import { PRESET_TEMPLATES } from "../data/templates";
import { PROMPT_SECTIONS } from "../lib/formatPrompt";
import type { PromptTemplate } from "../types";

interface GeneratorState {
  activeTemplate: string;
  formState: PromptTemplate;
  history: PromptTemplate[];
}

const STORAGE_KEY = "promptGenerator";

function isTemplate(value: unknown): value is PromptTemplate {
  if (typeof value !== "object" || value === null) return false;
  return "name" in value && typeof value.name === "string" &&
    PROMPT_SECTIONS.every(({ field }) => field in value && typeof value[field] === "string");
}

export function loadGeneratorState(): GeneratorState {
  const fallback = { activeTemplate: "assistant", formState: PRESET_TEMPLATES.assistant, history: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!saved || !isTemplate(saved.formState)) return fallback;
    return {
      activeTemplate: typeof saved.activeTemplate === "string" && PRESET_TEMPLATES[saved.activeTemplate]
        ? saved.activeTemplate : "assistant",
      formState: saved.formState,
      history: Array.isArray(saved.history) ? saved.history.filter(isTemplate).slice(0, 50) : [],
    };
  } catch {
    return fallback;
  }
}

export function saveGeneratorState(state: GeneratorState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastModified: new Date().toISOString() }));
}
