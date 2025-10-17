// API endpoint for text-to-speech generation
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createEpisodeDir } from '@/lib/cleanup';
import { VOICES } from '@/config/voices';
import type { Speaker } from '@/types/transcript';
import fs from 'fs/promises';
import path from 'path';

// Rate limiting - simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', hint: 'Please wait a few minutes before trying again' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { speaker, text, episodeId, order } = body;

    // Validate input
    if (!speaker || !['LENA', 'ISAAC'].includes(speaker)) {
      return NextResponse.json(
        { error: 'Invalid speaker', hint: 'Speaker must be LENA or ISAAC' },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required', hint: 'Provide text to synthesize' },
        { status: 400 }
      );
    }

    if (!episodeId || typeof episodeId !== 'string') {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    if (typeof order !== 'number') {
      return NextResponse.json(
        { error: 'Order is required' },
        { status: 400 }
      );
    }

    // Get voice for speaker
    const voice = VOICES[speaker as Speaker];

    // Generate TTS with retry logic
    let audioBuffer: Buffer | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Generating TTS for ${speaker} (attempt ${attempt + 1})`);
        
        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: voice,
          input: text,
        });

        // Convert response to buffer
        const arrayBuffer = await mp3Response.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        break; // Success
      } catch (error: any) {
        console.error(`TTS attempt ${attempt + 1} failed:`, error.message);
        lastError = error;
        
        if (attempt === 0) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!audioBuffer) {
      throw lastError || new Error('Failed to generate audio');
    }

    // Create episode directory if it doesn't exist
    const episodeDir = await createEpisodeDir(episodeId);
    
    // Save MP3 file
    const filename = `${String(order).padStart(3, '0')}_${speaker}.mp3`;
    const filepath = path.join(episodeDir, filename);
    await fs.writeFile(filepath, audioBuffer);

    console.log(`Saved audio: ${filename}`);

    // Return URL for client to fetch
    const url = `/api/file?episodeId=${episodeId}&name=${filename}`;
    
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate audio', 
        hint: error.message || 'Please try again'
      },
      { status: 500 }
    );
  }
}

