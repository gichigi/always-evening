// Type definitions for Always Evening transcript and episode data

export type Speaker = "LENA" | "ISAAC";

export interface Line {
  speaker: Speaker;
  text: string;
  order: number;
}

export interface Episode {
  id: string;
  theme: string;
  lines: Line[];
}

export interface AudioStatus {
  url?: string;
  loading: boolean;
  error?: string;
}

