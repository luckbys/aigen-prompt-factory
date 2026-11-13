import { z } from "zod";
import { createDraft, draftSchema } from "../types";
import type { GameIdeaDraft } from "../types";

export const DRAFT_KEY = "aigen.game-idea.v1";
const storedSchema = z.object({
  draft: draftSchema,
  savedAt: z.string().datetime(),
});

export interface LoadedDraft {
  draft: GameIdeaDraft;
  savedAt: string | null;
  problem: "corrupt" | "unavailable" | null;
}

export function loadDraft(): LoadedDraft {
  const empty: LoadedDraft = {
    draft: createDraft(),
    savedAt: null,
    problem: null,
  };
  let raw: string | null;
  try {
    raw = localStorage.getItem(DRAFT_KEY);
  } catch {
    return { ...empty, problem: "unavailable" };
  }
  if (raw === null) return empty;
  try {
    const result = storedSchema.safeParse(JSON.parse(raw));
    return result.success
      ? {
          draft: result.data.draft,
          savedAt: result.data.savedAt,
          problem: null,
        }
      : { ...empty, problem: "corrupt" };
  } catch {
    return { ...empty, problem: "corrupt" };
  }
}

export function saveDraft(draft: GameIdeaDraft): string {
  const savedAt = new Date().toISOString();
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, savedAt }));
  return savedAt;
}
