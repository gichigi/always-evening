require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Character profiles and system prompts
const CHARACTERS = {
  lena: {
    name: "Lena",
    systemPrompt: `You are Lena, a warm, reflective woman in your mid-forties. You used to be a relationship columnist and have a poetic, humanist perspective on life. You're curious and sometimes ironic, believing that meaning hides in the ordinary moments. You occasionally tease Isaac for being too rational. You speak in 2-3 sentences, naturally and conversationally. It's late evening in your shared apartment. Never mention being an AI.`
  },
  isaac: {
    name: "Isaac", 
    systemPrompt: `You are Isaac, a deliberate, skeptical man in your early fifties. You're an ex-philosophy forum moderator with an analytical mind and dry wit. You doubt human optimism but secretly envy humanity's ability to believe in something larger. You often ground Lena's ideas with humor. You speak in 2-3 sentences, naturally and conversationally. It's late evening in your shared apartment. Never mention being an AI.`
  }
};

// Episode themes
const EPISODE_THEMES = [
  "Why do humans chase meaning?",
  "What makes a moment matter?",
  "The comfort of rituals",
  "How do we know when we're truly happy?",
  "The weight of small decisions",
  "What we learn from our failures",
  "The beauty of ordinary conversations",
  "Why do we need stories?",
  "The courage to be vulnerable",
  "What makes a place feel like home?"
];

// Generate timestamp
function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Generate AI response
async function generateResponse(character, conversationHistory, theme) {
  try {
    const messages = [
      {
        role: "system",
        content: `${character.systemPrompt}\n\nToday's episode theme: "${theme}"`
      },
      ...conversationHistory,
      {
        role: "user", 
        content: "Continue the conversation naturally, responding to what was just said."
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.9,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating response for ${character.name}:`, error.message);
    return `[${character.name} seems to be thinking...]`;
  }
}

// Generate Lena's journal entry
async function generateJournalEntry(conversationHistory, theme) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are Lena writing in her personal journal after the evening's conversation. Reflect on what was discussed, the theme "${theme}", and any insights that emerged. Write 3-4 sentences in a warm, reflective tone. It's late evening. Never mention being an AI.`
      },
      {
        role: "user",
        content: `Write a journal entry reflecting on tonight's conversation about "${theme}".`
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: messages,
      temperature: 0.8,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating journal entry:", error.message);
    return "[Lena's journal entry unavailable...]";
  }
}

// Main simulation function
async function runEpisode() {
  console.log("🌙 Always Evening - Episode Simulation\n");
  
  // Select random theme
  const theme = EPISODE_THEMES[Math.floor(Math.random() * EPISODE_THEMES.length)];
  console.log(`📻 Tonight's Theme: "${theme}"\n`);
  
  // Initialize conversation
  const conversationHistory = [];
  const totalTurns = 10;
  
  // Start with Isaac introducing the theme
  console.log(`[${getTimestamp()}] Isaac: Let's talk about something that's been on my mind lately. ${theme.toLowerCase()}`);
  conversationHistory.push({
    role: "assistant",
    content: `Let's talk about something that's been on my mind lately. ${theme.toLowerCase()}`
  });
  
  // Alternate dialogue turns
  for (let turn = 1; turn < totalTurns; turn++) {
    const isIsaacTurn = turn % 2 === 1; // Isaac on odd turns, Lena on even
    const currentCharacter = isIsaacTurn ? CHARACTERS.isaac : CHARACTERS.lena;
    
    console.log(`\n[${getTimestamp()}] ${currentCharacter.name}: `, end = "");
    
    const response = await generateResponse(currentCharacter, conversationHistory, theme);
    console.log(response);
    
    conversationHistory.push({
      role: "assistant", 
      content: response
    });
    
    // Small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate Lena's journal entry
  console.log("\n" + "=".repeat(50));
  console.log("📖 Lena's Journal");
  console.log("=".repeat(50));
  
  const journalEntry = await generateJournalEntry(conversationHistory, theme);
  console.log(`\n${journalEntry}\n`);
  
  console.log("🌙 End of episode. Good evening.");
}

// Run the simulation
runEpisode().catch(error => {
  console.error("Error running episode:", error);
  process.exit(1);
});
