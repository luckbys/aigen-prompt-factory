import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDraft } from "../types";
import { DRAFT_KEY, loadDraft, saveDraft } from "./draftStorage";

describe("game idea draft storage", () => {
  let items: Map<string, string>;
  beforeEach(() => {
    items = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("starts a fresh draft without writing to storage", () => {
    expect(loadDraft()).toEqual({
      draft: createDraft(),
      savedAt: null,
      problem: null,
    });
    expect(items.size).toBe(0);
  });

  it("restores the current step, decisions, future features and review status", () => {
    const draft = createDraft();
    draft.mode = "explore";
    draft.step = 3;
    draft.answers.seed = "Um jardim que muda o ambiente";
    draft.features = ["3d"];
    draft.undecided = ["timebox"];
    const timestamp = saveDraft(draft);
    expect(loadDraft()).toEqual({ draft, savedAt: timestamp, problem: null });
  });

  it.each([
    "{broken",
    "null",
    JSON.stringify({
      draft: { ...createDraft(), version: 2 },
      savedAt: new Date().toISOString(),
    }),
    JSON.stringify({
      draft: { ...createDraft(), step: 9 },
      savedAt: new Date().toISOString(),
    }),
    JSON.stringify({
      draft: { ...createDraft(), answers: {} },
      savedAt: new Date().toISOString(),
    }),
  ])("reports invalid data without overwriting it: %s", (raw) => {
    items.set(DRAFT_KEY, raw);
    expect(loadDraft().problem).toBe("corrupt");
    expect(loadDraft().draft).toEqual(createDraft());
    expect(items.get(DRAFT_KEY)).toBe(raw);
  });

  it("keeps prompt generator storage separate", () => {
    items.set("promptGenerator", "original-prompt-state");
    saveDraft(createDraft());
    expect(items.get("promptGenerator")).toBe("original-prompt-state");
  });

  it("reports unavailable storage and propagates write failures to the UI", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("Blocked");
      },
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    });
    expect(loadDraft().problem).toBe("unavailable");
    expect(() => saveDraft(createDraft())).toThrow("Quota exceeded");
  });
});
