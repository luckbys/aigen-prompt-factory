import { z } from "zod";

export const QUESTION_KEYS = [
  "seed",
  "playerRole",
  "feeling",
  "audience",
  "action",
  "challenge",
  "reward",
  "twist",
  "platform",
  "team",
  "timebox",
  "prototype",
] as const;
export type QuestionKey = (typeof QUESTION_KEYS)[number];

export const FEATURE_OPTIONS = [
  { value: "online", label: "Multiplayer online" },
  { value: "open-world", label: "Mundo aberto" },
  { value: "3d", label: "Visual 3D" },
  { value: "story", label: "Narrativa com ramificações" },
] as const;
export type Feature = (typeof FEATURE_OPTIONS)[number]["value"];

const text = z.string().max(1000);
export const answersSchema = z.object({
  title: z.string().max(120),
  seed: text,
  playerRole: text,
  feeling: text,
  audience: text,
  action: text,
  challenge: text,
  reward: text,
  twist: text,
  platform: z.enum(["", "browser", "desktop", "mobile"]),
  team: z.enum(["", "solo", "small", "studio"]),
  timebox: z.enum(["", "weekend", "month", "quarter"]),
  prototype: text,
});

export const draftSchema = z.object({
  version: z.literal(1),
  mode: z.enum(["", "own", "explore"]),
  step: z.number().int().min(0).max(4),
  answers: answersSchema,
  undecided: z.array(z.enum(QUESTION_KEYS)).max(QUESTION_KEYS.length),
  features: z.array(z.enum(["online", "open-world", "3d", "story"])).max(4),
  reviewed: z.boolean(),
});
export type GameIdeaDraft = z.infer<typeof draftSchema>;
export type IdeaAnswers = z.infer<typeof answersSchema>;

export function createDraft(): GameIdeaDraft {
  return {
    version: 1,
    mode: "",
    step: 0,
    answers: {
      title: "",
      seed: "",
      playerRole: "",
      feeling: "",
      audience: "",
      action: "",
      challenge: "",
      reward: "",
      twist: "",
      platform: "",
      team: "",
      timebox: "",
      prototype: "",
    },
    undecided: [],
    features: [],
    reviewed: false,
  };
}
