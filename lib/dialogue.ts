// Dialogue generation logic extracted from index.js
import { openai } from './openai';
import type { Line, Speaker } from '@/types/transcript';

// Character profiles and system prompts
const CHARACTERS = {
  LENA: {
    name: "Lena" as Speaker,
    systemPrompt: `You are Lena, a warm, reflective woman in your mid-forties. You used to be a relationship columnist and have a poetic, humanist perspective on life. You're curious and sometimes ironic, believing that meaning hides in the ordinary moments. You occasionally tease Isaac for being too rational. You speak in 2-3 sentences, naturally and conversationally. It's late evening in your shared apartment. Never mention being an AI.`
  },
  ISAAC: {
    name: "Isaac" as Speaker,
    systemPrompt: `You are Isaac, a deliberate, skeptical man in your early fifties. You're an ex-philosophy forum moderator with an analytical mind and dry wit. You doubt human optimism but secretly envy humanity's ability to believe in something larger. You often ground Lena's ideas with humor. You speak in 2-3 sentences, naturally and conversationally. It's late evening in your shared apartment. Never mention being an AI.`
  }
};

// Generate AI response for a character
async function generateResponse(
  speaker: Speaker,
  conversationHistory: Array<{ role: "assistant" | "user"; content: string }>,
  theme: string
): Promise<string> {
  const character = CHARACTERS[speaker];
  
  try {
    const messages = [
      {
        role: "system" as const,
        content: `${character.systemPrompt}\n\nToday's episode theme: "${theme}"`
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: "Continue the conversation naturally, responding to what was just said."
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.9,
      max_tokens: 150
    });

    return response.choices[0].message.content?.trim() || `[${character.name} seems to be thinking...]`;
  } catch (error) {
    console.error(`Error generating response for ${character.name}:`, error);
    throw error;
  }
}

// Generate complete dialogue for an episode
export async function generateDialogue(theme: string, turns: number = 10): Promise<Line[]> {
  const lines: Line[] = [];
  const conversationHistory: Array<{ role: "assistant" | "user"; content: string }> = [];
  
  // Start with Isaac introducing the theme
  const intro = `Let's talk about something that's been on my mind lately. ${theme.toLowerCase()}`;
  lines.push({
    speaker: "ISAAC",
    text: intro,
    order: 0
  });
  
  conversationHistory.push({
    role: "assistant",
    content: intro
  });
  
  // Alternate dialogue turns
  for (let turn = 1; turn < turns; turn++) {
    const speaker: Speaker = turn % 2 === 1 ? "LENA" : "ISAAC";
    
    const response = await generateResponse(speaker, conversationHistory, theme);
    
    lines.push({
      speaker,
      text: response,
      order: turn
    });
    
    conversationHistory.push({
      role: "assistant",
      content: response
    });
  }
  
  return lines;
}

// Generate Lena's journal entry
export async function generateJournalEntry(theme: string, lines: Line[]): Promise<string> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: `You are Lena writing in her personal journal after the evening's conversation. Reflect on what was discussed, the theme "${theme}", and any insights that emerged. Write 3-4 sentences in a warm, reflective tone. It's late evening. Never mention being an AI.`
      },
      {
        role: "user" as const,
        content: `Write a journal entry reflecting on tonight's conversation about "${theme}".`
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.8,
      max_tokens: 200
    });

    return response.choices[0].message.content?.trim() || "[Lena's journal entry unavailable...]";
  } catch (error) {
    console.error("Error generating journal entry:", error);
    throw error;
  }
}

