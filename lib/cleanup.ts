// Episode cleanup system - deletes old episode folders
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'always-evening');
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Clean up episode folders older than 2 hours
export async function cleanupOldEpisodes(): Promise<void> {
  try {
    let cleanupDir = CACHE_DIR;
    
    try {
      // Ensure cache directory exists
      await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error: any) {
      // If cache dir creation fails, try /tmp fallback
      if (error.code === 'ENOENT' || error.code === 'EACCES') {
        console.warn('Cache directory access failed, using /tmp for cleanup:', error.message);
        cleanupDir = path.join('/tmp', 'always-evening');
        await fs.mkdir(cleanupDir, { recursive: true });
      } else {
        throw error;
      }
    }
    
    const entries = await fs.readdir(cleanupDir, { withFileTypes: true });
    const now = Date.now();
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const episodePath = path.join(cleanupDir, entry.name);
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
  
  try {
    await fs.mkdir(episodeDir, { recursive: true });
  } catch (error: any) {
    // If mkdir fails, try using /tmp as fallback in serverless environments
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
      console.warn('Cache directory creation failed, using /tmp fallback:', error.message);
      const tmpDir = path.join('/tmp', 'always-evening', episodeId);
      await fs.mkdir(tmpDir, { recursive: true });
      return tmpDir;
    }
    throw error;
  }
  
  return episodeDir;
}

