export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  timestamp: string;
  isFavorite?: boolean;
}

const STORAGE_KEY = "saved_prompts";

export const savePrompt = (prompt: Omit<SavedPrompt, "id" | "timestamp">): SavedPrompt => {
  const savedPrompts = getPrompts();
  
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isFavorite: false
  };
  
  savedPrompts.unshift(newPrompt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPrompts));
  
  return newPrompt;
};

export const getPrompts = (): SavedPrompt[] => {
  const savedPrompts = localStorage.getItem(STORAGE_KEY);
  return savedPrompts ? JSON.parse(savedPrompts) : [];
};

export const deletePrompt = (id: string): void => {
  const savedPrompts = getPrompts();
  const updatedPrompts = savedPrompts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
};

export const toggleFavorite = (id: string): SavedPrompt | null => {
  const savedPrompts = getPrompts();
  const promptIndex = savedPrompts.findIndex(p => p.id === id);
  
  if (promptIndex === -1) return null;
  
  savedPrompts[promptIndex] = {
    ...savedPrompts[promptIndex],
    isFavorite: !savedPrompts[promptIndex].isFavorite
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPrompts));
  return savedPrompts[promptIndex];
};

export const updatePrompt = (id: string, updates: Partial<SavedPrompt>): SavedPrompt | null => {
  const savedPrompts = getPrompts();
  const promptIndex = savedPrompts.findIndex(p => p.id === id);
  
  if (promptIndex === -1) return null;
  
  savedPrompts[promptIndex] = {
    ...savedPrompts[promptIndex],
    ...updates
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPrompts));
  return savedPrompts[promptIndex];
};

export const importPrompts = (prompts: SavedPrompt[]): void => {
  const existingPrompts = getPrompts();
  const updatedPrompts = [...existingPrompts, ...prompts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
};

export const exportPrompts = (): string => {
  const prompts = getPrompts();
  return JSON.stringify({
    version: "1.0",
    prompts,
    exportDate: new Date().toISOString()
  }, null, 2);
}; 