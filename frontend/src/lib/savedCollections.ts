export type SavedItem = {
  id: string;
  title: string;
  prompt: string;
  type: "smartgen" | "prompt-optimization" | "prompt-marketplace" | "prompt-library";
  category?: string;
  // optional if you use them in the grid:
  tags?: string[];
  uses?: number;
  imageUrl?: string;
  createdAt: number;
};

const KEY = "tokun_saved_prompts";

export function loadSaved(): SavedItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveItem(item: Omit<SavedItem, "id" | "createdAt">) {
  const list = loadSaved();
  const row: SavedItem = { id: crypto.randomUUID(), createdAt: Date.now(), ...item };
  localStorage.setItem(KEY, JSON.stringify([row, ...list]));
  return row;
}
