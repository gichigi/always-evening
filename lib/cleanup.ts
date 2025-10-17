// Episode cleanup system - deletes old episode folders
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'always-evening');
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Clean up episode folders older than 2 hours
export async function cleanupOldEpisodes(): Promise<void> {
  try {
    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });
    
    const entries = await fs.readdir(CACHE_DIR, { withFileTypes: true });
    const now = Date.now();
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const episodePath = path.join(CACHE_DIR, entry.name);
        const stats = await fs.stat(episodePath);
        const age = now - stats.mtimeMs;
        
        // Delete if older than MAX_AGE
        if (age > MAX_AGE_MS) {
          console.log(`Cleaning up old episode: ${entry.name}`);
          await fs.rm(episodePath, { recursive: true, force: true });
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Don't throw - cleanup failures shouldn't break the app
  }
}

// Get episode directory path
export function getEpisodeDir(episodeId: string): string {
  return path.join(CACHE_DIR, episodeId);
}

// Create episode directory
export async function createEpisodeDir(episodeId: string): Promise<string> {
  const episodeDir = getEpisodeDir(episodeId);
  await fs.mkdir(episodeDir, { recursive: true });
  return episodeDir;
}

