'use client';

import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { Line, AudioStatus } from '@/types/transcript';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Line[]>([]);
  const [audioStatuses, setAudioStatuses] = useState<Map<number, AudioStatus>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());

  // Generate dialogue transcript
  const handleGenerate = async () => {
    if (!theme.trim()) return;

    setIsGenerating(true);
    setTranscript([]);
    setAudioStatuses(new Map());
    setCurrentlyPlaying(null);
    audioRefs.current.clear();

    try {
      // Call API to generate dialogue
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, turns: 10 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate dialogue');
      }

      const data = await response.json();
      const lines: Line[] = data.transcript;
      
      setTranscript(lines);
      
      // Generate episode ID
      const newEpisodeId = nanoid(10);
      setEpisodeId(newEpisodeId);

      // Initialize audio statuses
      const statuses = new Map<number, AudioStatus>();
      lines.forEach(line => {
        statuses.set(line.order, { loading: true });
      });
      setAudioStatuses(statuses);

      // Start generating audio for each line
      generateAllAudio(lines, newEpisodeId, statuses);
    } catch (error: any) {
      console.error('Error generating dialogue:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate audio for all lines sequentially
  const generateAllAudio = async (
    lines: Line[],
    epId: string,
    statuses: Map<number, AudioStatus>
  ) => {
    for (const line of lines) {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            speaker: line.speaker,
            text: line.text,
            episodeId: epId,
            order: line.order,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }

        const data = await response.json();
        
        // Update status with URL
        setAudioStatuses(prev => {
          const updated = new Map(prev);
          updated.set(line.order, { loading: false, url: data.url });
          return updated;
        });
      } catch (error: any) {
        console.error(`Error generating audio for line ${line.order}:`, error);
        
        // Mark as error
        setAudioStatuses(prev => {
          const updated = new Map(prev);
          updated.set(line.order, { loading: false, error: error.message });
          return updated;
        });
      }
    }
  };

  // Play a specific line
  const playLine = (order: number) => {
    const status = audioStatuses.get(order);
    if (!status?.url) return;

    // Stop currently playing audio
    if (currentlyPlaying !== null && currentlyPlaying !== order) {
      const currentAudio = audioRefs.current.get(currentlyPlaying);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Get or create audio element
    let audio = audioRefs.current.get(order);
    if (!audio) {
      audio = new Audio(status.url);
      audioRefs.current.set(order, audio);
      
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }

    setCurrentlyPlaying(order);
    audio.play();
  };

  // Play all lines sequentially
  const playAll = async () => {
    for (const line of transcript) {
      const status = audioStatuses.get(line.order);
      if (!status?.url) continue;

      // Play line
      await new Promise<void>((resolve) => {
        let audio = audioRefs.current.get(line.order);
        if (!audio) {
          audio = new Audio(status.url);
          audioRefs.current.set(line.order, audio);
        }

        setCurrentlyPlaying(line.order);
        
        const handleEnded = () => {
          audio!.removeEventListener('ended', handleEnded);
          setCurrentlyPlaying(null);
          resolve();
        };
        
        audio.addEventListener('ended', handleEnded);
        audio.play();
      });

      // Small pause between lines
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Download episode as ZIP
  const downloadEpisode = () => {
    if (!episodeId) return;
    window.location.href = `/api/package?episodeId=${episodeId}`;
  };

  // Check if all audio is ready
  const allAudioReady = transcript.length > 0 && 
    transcript.every(line => audioStatuses.get(line.order)?.url);

  return (
    <div className="container">
      <header className="header">
        <h1>🌙 Always Evening</h1>
        <p>A podcast dialogue between Lena and Isaac</p>
      </header>

      <div className="theme-input-section">
        <h2>Episode Theme</h2>
        <input
          type="text"
          className="theme-input"
          placeholder="e.g., Why do humans love drama?"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          disabled={isGenerating}
        />
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isGenerating || !theme.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate Episode'}
        </button>
      </div>

      {isGenerating && (
        <div className="loading-message">
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Generating dialogue...</p>
        </div>
      )}

      {transcript.length > 0 && (
        <>
          <div className="transcript-section">
            <div className="transcript-header">
              <h2>Transcript</h2>
              <button
                className="play-all-button"
                onClick={playAll}
                disabled={!allAudioReady || currentlyPlaying !== null}
              >
                ▶ Play All
              </button>
            </div>

            {transcript.map((line) => {
              const status = audioStatuses.get(line.order);
              const isPlaying = currentlyPlaying === line.order;

              return (
                <div
                  key={line.order}
                  className={`dialogue-line ${line.speaker.toLowerCase()} ${
                    isPlaying ? 'playing' : ''
                  }`}
                >
                  <div className={`speaker-label ${line.speaker.toLowerCase()}`}>
                    {line.speaker}
                  </div>
                  <div className="line-content">
                    <div className="line-text">{line.text}</div>
                    <div className="line-controls">
                      {status?.url && (
                        <button
                          className="play-button"
                          onClick={() => playLine(line.order)}
                          disabled={isPlaying}
                        >
                          {isPlaying ? '▶ Playing...' : '▶ Play'}
                        </button>
                      )}
                      {status?.loading && (
                        <div className="status-indicator">
                          <span className="spinner"></span>
                          Generating audio...
                        </div>
                      )}
                      {status?.error && (
                        <div className="error-message">Audio failed</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allAudioReady && (
            <div className="download-section">
              <button className="download-button" onClick={downloadEpisode}>
                ⬇ Download Episode (ZIP)
              </button>
            </div>
          )}
        </>
      )}

      {!isGenerating && transcript.length === 0 && (
        <div className="empty-state">
          <p>Enter a theme above to generate your first episode.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Try: "Why do humans love drama?" or "What makes a moment matter?"
          </p>
        </div>
      )}
    </div>
  );
}

