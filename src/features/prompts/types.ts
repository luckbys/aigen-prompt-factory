export interface PromptTemplate {
  name: string;
  role: string;
  goal: string;
  constraints: string;
  guidelines: string;
  output: string;
  examples: string;
  category?: string;
  tags?: string[];
  lastModified?: string;
}

export type PromptFieldName = "role" | "goal" | "constraints" | "guidelines" | "output" | "examples";

export interface PromptTip {
  id: string;
  text: string;
  category: 'constraints' | 'guidelines' | 'output' | 'examples';
  tags: string[];
  popularity?: number; // De 0 a 5, onde 5 é o mais popular
  useCount?: number; // Número de vezes que a dica foi aplicada
  isNew?: boolean; // Indica se é uma nova dica
}
