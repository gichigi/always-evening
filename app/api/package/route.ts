// API endpoint for packaging episode as ZIP
import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeDirWithFallback } from '@/lib/cleanup';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get('episodeId');

    // Validate input
    if (!episodeId) {
      return NextResponse.json(
        { error: 'Missing episodeId' },
        { status: 400 }
      );
    }

    // Security: prevent directory traversal
    if (episodeId.includes('..') || episodeId.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid episodeId' },
        { status: 400 }
      );
    }

    const episodeDir = await getEpisodeDirWithFallback(episodeId);

    // Check if directory exists
    if (!fs.existsSync(episodeDir)) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle errors
    archive.on('error', (err) => {
      throw err;
    });

    // Add all files from episode directory
    archive.directory(episodeDir, false);

    // Finalize archive
    await archive.finalize();

    // Stream response
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        archive.on('end', () => {
          controller.close();
        });
        archive.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="episode_${episodeId}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/package:', error);
    return NextResponse.json(
      { error: 'Failed to package episode', hint: error.message },
      { status: 500 }
    );
  }
}

