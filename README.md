# Always Evening

A podcast-style dialogue simulator featuring two AI hosts — Lena and Isaac — who explore human meaning through thoughtful conversation.

## 🎧 Try It Live

**[Launch Always Evening →](https://always-evening.vercel.app)**

*Generate your own philosophical dialogue episodes with AI-powered hosts*

## ✨ Features

- 🎭 **Character-driven dialogue**: Two distinct personalities with consistent voices
- 🔊 **Text-to-Speech**: OpenAI TTS with character-specific voices (Nova for Lena, Onyx for Isaac)
- 🖥️ **Web Interface**: Interactive browser UI for generating and playing episodes
- 💬 **Natural conversation flow**: 10-turn alternating dialogue with realistic pacing
- ▶️ **Audio playback**: Play individual lines or the entire episode sequentially
- 📦 **Episode downloads**: Package transcript + audio as ZIP files
- 💻 **CLI mode**: Original console-based interface still available

## 🎭 Characters

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

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Local Development

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd always-evening
   npm install
   ```

2. **Configure environment**:
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Alternative: CLI Mode
For the original console experience:
```bash
npm run cli
```

## 🖥️ Web UI Usage

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

## 💻 CLI Example Output

```
🌙 Always Evening - Episode Simulation

📻 Tonight's Theme: "Why do humans chase meaning?"

[21:45] Isaac: Let's talk about something that's been on my mind lately...
[21:45] Lena: I think we chase meaning because we're afraid of the alternative...

🌙 End of episode. Good evening.
```

## ⚙️ Technical Details

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
- **Storage**: Local filesystem with `/tmp` fallback for serverless environments
- **Cache**: `.cache/always-evening/` directory (auto-created)
- **Cleanup**: Auto-delete episodes older than 2 hours
- **Deployment**: Optimized for Vercel with 30s API timeouts
- **No database**: Ephemeral, local-first design

## 🔌 API Endpoints

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

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your forked repository
   - Vercel will auto-detect Next.js configuration

3. **Configure environment variables**:
   - Add `OPENAI_API_KEY` in Vercel dashboard
   - Go to Project Settings → Environment Variables

4. **Deploy**:
   - Vercel deploys automatically on every push to main
   - Your app will be live at `https://your-project.vercel.app`

### Vercel Configuration
The project includes `vercel.json` with optimized settings:
- 30-second timeout for API routes (TTS generation)
- Next.js framework detection
- Automatic builds on deployment

### Other Platforms
- **Netlify**: Works with Next.js adapter
- **Railway**: Deploy with Docker
- **Self-hosted**: Use `npm run build && npm start`

## 🔧 Requirements

- Node.js 16+
- OpenAI API key ([Get yours here](https://platform.openai.com/api-keys))
- Internet connection for API calls

## 🚀 Future Enhancements

- **Episode history**: Browse and replay past episodes
- **Voice customization**: Adjust speaking rate, pitch  
- **Streaming audio**: Real-time TTS during generation
- **Character memory**: Reference previous conversations
- **Custom voices**: Upload voice samples for cloning

---

*"In the quiet hours, meaning finds us."* — Lena
