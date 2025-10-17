# Always Evening

A podcast-style dialogue simulator featuring two AI hosts — Lena and Isaac — who explore human meaning through thoughtful conversation.

## Features

- **Character-driven dialogue**: Two distinct personalities with consistent voices
- **Text-to-Speech**: OpenAI TTS with character-specific voices (Nova for Lena, Onyx for Isaac)
- **Web Interface**: Interactive browser UI for generating and playing episodes
- **Natural conversation flow**: 10-turn alternating dialogue with realistic pacing
- **Audio playback**: Play individual lines or the entire episode sequentially
- **Episode downloads**: Package transcript + audio as ZIP files
- **CLI mode**: Original console-based interface still available

## Characters

### Lena
- Mid-forties, warm and reflective
- Former relationship columnist
- Poetic, humanist perspective
- Finds meaning in ordinary moments
- Occasionally teases Isaac's rationality

### Isaac  
- Early fifties, analytical and witty
- Ex-philosophy forum moderator
- Skeptical but curious
- Dry humor and grounded perspective
- Envies human capacity for belief

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API key**:
   Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-key-here
   ```

3. **Choose your interface**:

   ### Web UI (Recommended)
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000 in your browser.

   ### CLI Mode
   ```bash
   npm run cli
   ```
   Runs the original console-based version with random themes.

## Web UI Usage

1. Enter an episode theme (e.g., "Why do humans love drama?")
2. Click "Generate Episode"
3. Watch the transcript appear
4. Audio is generated automatically for each line
5. Click individual play buttons or "Play All" for sequential playback
6. Download the complete episode (transcript + MP3s) as a ZIP

### Features:
- **Real-time generation**: Transcript appears first, audio generates progressively
- **Visual feedback**: Loading spinners, play indicators, error states
- **Character distinction**: Color-coded dialogue for Lena (red) and Isaac (blue)
- **Sequential playback**: "Play All" auto-advances through the conversation
- **Episode packaging**: Download everything as a single ZIP file

## CLI Example Output

```
🌙 Always Evening - Episode Simulation

📻 Tonight's Theme: "Why do humans chase meaning?"

[21:45] Isaac: Let's talk about something that's been on my mind lately...
[21:45] Lena: I think we chase meaning because we're afraid of the alternative...

🌙 End of episode. Good evening.
```

## Technical Details

### Dialogue Generation
- **Model**: OpenAI GPT-4o-mini
- **Temperature**: 0.9 for creative, natural dialogue
- **Max tokens**: 150 per response

### Text-to-Speech
- **Model**: OpenAI TTS-1
- **Voices**: Nova (Lena), Onyx (Isaac)
- **Format**: MP3
- **Rate limiting**: 20 requests per 5 minutes per IP

### Architecture
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **API Routes**: `/api/generate`, `/api/tts`, `/api/file`, `/api/package`
- **Storage**: Local filesystem (`.cache/always-evening/`)
- **Cleanup**: Auto-delete episodes older than 2 hours
- **No database**: Ephemeral, local-first design

## API Endpoints

### POST `/api/generate`
Generate dialogue transcript.
- **Input**: `{ theme: string, turns?: number }`
- **Output**: `{ transcript: Line[] }`

### POST `/api/tts`
Generate audio for a single line.
- **Input**: `{ speaker: "LENA"|"ISAAC", text: string, episodeId: string, order: number }`
- **Output**: `{ url: string }`

### GET `/api/file`
Stream audio file.
- **Query**: `episodeId`, `name`
- **Output**: MP3 audio stream

### GET `/api/package`
Download episode as ZIP.
- **Query**: `episodeId`
- **Output**: ZIP file with all MP3s + transcript.json

## Future Enhancements

- **Episode history**: Browse and replay past episodes
- **Voice customization**: Adjust speaking rate, pitch
- **Streaming audio**: Real-time TTS during generation
- **Character memory**: Reference previous conversations
- **Custom voices**: Upload voice samples for cloning

## Requirements

- Node.js 16+
- OpenAI API key
- Internet connection for API calls

---

*"In the quiet hours, meaning finds us."* — Lena
