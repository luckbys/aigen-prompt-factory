import type { PromptFieldName, PromptTemplate } from "../types";

export const PROMPT_SECTIONS: ReadonlyArray<{ field: PromptFieldName; title: string }> = [
  { field: "role", title: "Papel" },
  { field: "goal", title: "Objetivo" },
  { field: "constraints", title: "Restrições" },
  { field: "guidelines", title: "Diretrizes" },
  { field: "output", title: "Formato de Saída" },
  { field: "examples", title: "Exemplos" },
];

export function formatPrompt(template: PromptTemplate): string {
  return PROMPT_SECTIONS
    .filter(({ field }) => template[field])
    .map(({ field, title }) => `# ${title}\n${template[field]}`)
    .join("\n\n")
    .trim();
}
