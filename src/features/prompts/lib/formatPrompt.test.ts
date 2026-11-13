import { describe, expect, it } from "vitest";
import { PRESET_TEMPLATES } from "../data/templates";
import { formatPrompt } from "./formatPrompt";

describe("formatPrompt", () => {
  it("preserves section order and excludes template metadata", () => {
    const prompt = formatPrompt({ ...PRESET_TEMPLATES.assistant, name: "Internal name", tags: ["internal"] });
    const headings = prompt.split("\n").filter(line => line.startsWith("# "));
    expect(headings).toEqual(["# Papel", "# Objetivo", "# Restrições", "# Diretrizes", "# Formato de Saída", "# Exemplos"]);
    expect(prompt).not.toContain("Internal name");
    expect(prompt).not.toContain("internal");
    expect(prompt).toContain(PRESET_TEMPLATES.assistant.role);
  });

  it("omits empty sections while preserving multiline content", () => {
    expect(formatPrompt({ ...PRESET_TEMPLATES.assistant, role: "", goal: "", constraints: "", guidelines: "", output: "", examples: "Usuário: Olá\nIA: Oi" }))
      .toBe("# Exemplos\nUsuário: Olá\nIA: Oi");
  });

  it("returns an empty prompt when all fields are empty", () => {
    expect(formatPrompt({ name: "Empty", role: "", goal: "", constraints: "", guidelines: "", output: "", examples: "" })).toBe("");
  });
});
