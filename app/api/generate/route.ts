// API endpoint for generating dialogue transcript
import { NextRequest, NextResponse } from 'next/server';
import { generateDialogue } from '@/lib/dialogue';
import { cleanupOldEpisodes } from '@/lib/cleanup';

// Track cleanup execution
let lastCleanup = 0;
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    // Run cleanup periodically
    const now = Date.now();
    if (now - lastCleanup > CLEANUP_INTERVAL) {
      cleanupOldEpisodes().catch(err => console.error('Cleanup failed:', err));
      lastCleanup = now;
    }

    const body = await request.json();
    const { theme, turns = 10 } = body;

    // Validate input
    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme is required', hint: 'Provide a theme as a string' },
        { status: 400 }
      );
    }

    if (theme.length > 200) {
      return NextResponse.json(
        { error: 'Theme too long', hint: 'Keep theme under 200 characters' },
        { status: 400 }
      );
    }

    if (typeof turns !== 'number' || turns < 2 || turns > 20) {
      return NextResponse.json(
        { error: 'Invalid turns count', hint: 'Turns must be between 2 and 20' },
        { status: 400 }
      );
    }

    // Generate dialogue
    console.log(`Generating dialogue for theme: "${theme}" with ${turns} turns`);
    const transcript = await generateDialogue(theme, turns);

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate dialogue', 
        hint: error.message || 'Please try again'
      },
      { status: 500 }
    );
  }
}

