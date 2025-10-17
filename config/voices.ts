// Voice mappings for OpenAI TTS
// Lena: warm, feminine voice
// Isaac: deep, masculine voice

export const VOICES = {
  LENA: "nova",   // warm, feminine
  ISAAC: "onyx"   // deep, masculine
} as const;

export type VoiceType = typeof VOICES[keyof typeof VOICES];

