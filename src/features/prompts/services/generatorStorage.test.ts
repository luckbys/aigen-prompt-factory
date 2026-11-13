import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRESET_TEMPLATES } from "../data/templates";
import { loadGeneratorState, saveGeneratorState } from "./generatorStorage";

describe("generatorStorage", () => {
  beforeEach(() => {
    const items = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses the default template when there is no saved state", () => {
    expect(loadGeneratorState()).toEqual({ activeTemplate: "assistant", formState: PRESET_TEMPLATES.assistant, history: [] });
  });

  it("round-trips edits, selected template and history using the existing storage key", () => {
    const state = { activeTemplate: "teacher", formState: { ...PRESET_TEMPLATES.teacher, role: "Meu papel" }, history: [PRESET_TEMPLATES.assistant] };
    saveGeneratorState(state);
    expect(loadGeneratorState()).toEqual(state);
    expect(JSON.parse(localStorage.getItem("promptGenerator")!).lastModified).toBeTruthy();
  });

  it("loads the legacy state without an active template", () => {
    localStorage.setItem("promptGenerator", JSON.stringify({ formState: PRESET_TEMPLATES.teacher, history: [PRESET_TEMPLATES.assistant] }));
    expect(loadGeneratorState().formState).toEqual(PRESET_TEMPLATES.teacher);
    expect(loadGeneratorState().history).toEqual([PRESET_TEMPLATES.assistant]);
  });

  it.each(["{invalid", "null", JSON.stringify({ formState: { role: 12 } })])("recovers from invalid stored data: %s", value => {
    localStorage.setItem("promptGenerator", value);
    expect(loadGeneratorState().formState).toEqual(PRESET_TEMPLATES.assistant);
  });

  it("ignores invalid history entries and limits retained history", () => {
    localStorage.setItem("promptGenerator", JSON.stringify({ activeTemplate: "missing", formState: PRESET_TEMPLATES.assistant, history: [null, {}, ...Array(60).fill(PRESET_TEMPLATES.teacher)] }));
    expect(loadGeneratorState().history).toHaveLength(50);
    expect(loadGeneratorState().activeTemplate).toBe("assistant");
  });

  it("recovers when storage access is denied", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("Denied"); } });
    expect(loadGeneratorState().formState).toEqual(PRESET_TEMPLATES.assistant);
  });
});
