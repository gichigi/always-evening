// API endpoint for serving audio files
import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeDirWithFallback } from '@/lib/cleanup';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get('episodeId');
    const name = searchParams.get('name');

    // Validate input
    if (!episodeId || !name) {
      return NextResponse.json(
        { error: 'Missing episodeId or name' },
        { status: 400 }
      );
    }

    // Security: prevent directory traversal
    if (episodeId.includes('..') || name.includes('..') || 
        episodeId.includes('/') || name.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!name.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Get file path with fallback for serverless environments
    const episodeDir = await getEpisodeDirWithFallback(episodeId);
    const filepath = path.join(episodeDir, name);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error: any) {
      console.error(`File not found: ${filepath}`, error.message);
      
      // Also check if episode directory exists for debugging
      try {
        await fs.access(episodeDir);
        console.log(`Episode directory exists: ${episodeDir}`);
        
        // List files in directory for debugging
        const files = await fs.readdir(episodeDir);
        console.log(`Files in episode directory:`, files);
      } catch (dirError: any) {
        console.error(`Episode directory not found: ${episodeDir}`, dirError.message);
      }
      
      return NextResponse.json(
        { 
          error: 'File not found', 
          hint: `Audio file ${name} not found for episode ${episodeId}. Make sure TTS generation completed successfully.`,
          debug: {
            episodeDir,
            filepath,
            episodeId,
            name
          }
        },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(filepath);

    // Return audio file with correct headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file', hint: error.message },
      { status: 500 }
    );
  }
}

