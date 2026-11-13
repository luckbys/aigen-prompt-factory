import { QUESTIONS, STEPS } from "../data/questions";
import {
  answersSchema,
  createDraft,
  FEATURE_OPTIONS,
  QUESTION_KEYS,
} from "../types";
import type {
  Feature,
  GameIdeaDraft,
  IdeaAnswers,
  QuestionKey,
} from "../types";

export type IdeaAction =
  | { type: "answer"; field: keyof IdeaAnswers; value: string }
  | { type: "defer"; field: QuestionKey; deferred: boolean }
  | { type: "mode"; mode: GameIdeaDraft["mode"] }
  | { type: "step"; step: number }
  | { type: "feature"; feature: Feature }
  | { type: "review" }
  | { type: "reset" };

export function ideaReducer(
  draft: GameIdeaDraft,
  action: IdeaAction,
): GameIdeaDraft {
  switch (action.type) {
    case "answer": {
      const result = answersSchema.shape[action.field].safeParse(action.value);
      if (!result.success) return draft;
      return {
        ...draft,
        reviewed: false,
        answers: { ...draft.answers, [action.field]: result.data },
        undecided: draft.undecided.filter((field) => field !== action.field),
      };
    }
    case "defer":
      return {
        ...draft,
        reviewed: false,
        answers: action.deferred
          ? { ...draft.answers, [action.field]: "" }
          : draft.answers,
        undecided: action.deferred
          ? [...new Set([...draft.undecided, action.field])]
          : draft.undecided.filter((field) => field !== action.field),
      };
    case "mode":
      return { ...draft, mode: action.mode, reviewed: false };
    case "step":
      return { ...draft, step: Math.max(0, Math.min(4, action.step)) };
    case "feature":
      return {
        ...draft,
        reviewed: false,
        features: draft.features.includes(action.feature)
          ? draft.features.filter((feature) => feature !== action.feature)
          : [...draft.features, action.feature],
      };
    case "review":
      return [0, 1, 2, 3].every(
        (step) => getStepErrors(draft, step).length === 0,
      )
        ? { ...draft, reviewed: true }
        : draft;
    case "reset":
      return createDraft();
  }
}

export function getStepErrors(
  draft: GameIdeaDraft,
  step: number,
): Array<QuestionKey | "mode"> {
  const errors: Array<QuestionKey | "mode"> = [];
  if (step === 0 && !draft.mode) errors.push("mode");
  for (const field of STEPS[step]?.fields ?? []) {
    if (
      QUESTIONS[field].required &&
      !draft.answers[field].trim() &&
      !draft.undecided.includes(field)
    )
      errors.push(field);
  }
  return errors;
}

export function getPendingDecisions(draft: GameIdeaDraft) {
  return QUESTION_KEYS.filter(
    (field) => QUESTIONS[field].required && !draft.answers[field].trim(),
  ).map((field) => ({
    field,
    label: QUESTIONS[field].label,
    deferred: draft.undecided.includes(field),
    step: STEPS.findIndex((step) => step.fields.includes(field)),
  }));
}

export function answerLabel(draft: GameIdeaDraft, field: QuestionKey): string {
  const value = draft.answers[field].trim();
  if (!value)
    return draft.undecided.includes(field) ? "Ainda não decidi" : "A definir";
  return (
    QUESTIONS[field].options?.find((option) => option.value === value)?.label ??
    value
  );
}

export function getScopeAdvice(draft: GameIdeaDraft): string[] {
  const advice: string[] = [];
  if (draft.features.includes("online"))
    advice.push(
      "Multiplayer online acrescenta sincronização, conexão e testes com vários jogadores. Experimente o ciclo principal em modo local antes de adicionar rede.",
    );
  if (draft.features.includes("open-world"))
    advice.push(
      "Um mundo aberto exige conteúdo, navegação e exploração consistentes. Uma única área pode testar a proposta do protótipo.",
    );
  if (
    draft.features.includes("3d") &&
    (draft.answers.team === "solo" || draft.answers.timebox === "weekend")
  )
    advice.push(
      "Para experimentar em 3D, use formas simples e assets provisórios. Modele o visual definitivo depois de testar a mecânica.",
    );
  if (draft.features.includes("story"))
    advice.push(
      "Narrativas ramificadas multiplicam cenas e estados para testar. Comece com uma situação e uma escolha com consequência visível.",
    );
  if (draft.answers.team === "solo" && draft.answers.timebox === "weekend")
    advice.push(
      "Para uma pessoa em um fim de semana, concentre o teste em uma mecânica, um cenário e uma condição de término. Deixe polimento e sistemas adicionais para depois.",
    );
  return advice;
}

export function suggestPrototype(draft: GameIdeaDraft): string {
  const action = draft.answers.action.trim().slice(0, 300);
  return `Um cenário pequeno para testar ${action ? `o ciclo: ${action}` : "uma interação principal"}. Uma condição de término e uma recompensa visível. Usar arte provisória e observar se o jogador entende o objetivo e quer repetir.${draft.features.includes("online") ? " Testar localmente antes de implementar multiplayer online." : ""}`.slice(
    0,
    1000,
  );
}

export function getPitch(draft: GameIdeaDraft): string {
  const { playerRole, action, challenge, feeling } = draft.answers;
  if (!playerRole.trim() && !action.trim())
    return (
      draft.answers.seed.trim() ||
      "Sua ideia vai aparecer aqui conforme você fizer escolhas."
    );
  return [
    `O jogador assume o papel de ${playerRole.trim() || "um personagem a definir"}.`,
    action.trim()
      ? `O ciclo principal é: ${action.trim()}.`
      : "A mecânica principal ainda será definida.",
    challenge.trim() && `O desafio é: ${challenge.trim()}.`,
    feeling.trim() && `A experiência busca despertar: ${feeling.trim()}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function conceptSections(draft: GameIdeaDraft) {
  const pending = getPendingDecisions(draft);
  return [
    { title: "A ideia", content: answerLabel(draft, "seed"), step: 0 },
    { title: "Pitch", content: getPitch(draft), step: 1 },
    {
      title: "Experiência do jogador",
      content: `Papel: ${answerLabel(draft, "playerRole")}\nSensação: ${answerLabel(draft, "feeling")}\nPúblico: ${answerLabel(draft, "audience")}`,
      step: 1,
    },
    {
      title: "Ciclo de gameplay",
      content: `${answerLabel(draft, "action")}\n\nDesafio: ${answerLabel(draft, "challenge")}\nMotivo para continuar: ${answerLabel(draft, "reward")}\nDiferencial: ${answerLabel(draft, "twist")}`,
      step: 2,
    },
    {
      title: "Primeiro protótipo",
      content: `Plataforma: ${answerLabel(draft, "platform")}\nEquipe: ${answerLabel(draft, "team")}\nTempo reservado: ${answerLabel(draft, "timebox")}\n\nO que testar: ${answerLabel(draft, "prototype")}`,
      step: 3,
    },
    {
      title: "Ambições para versões futuras",
      content: draft.features.length
        ? FEATURE_OPTIONS.filter((option) =>
            draft.features.includes(option.value),
          )
            .map((option) => option.label)
            .join("; ")
        : "Nenhuma funcionalidade adicional selecionada.",
      step: 3,
    },
    ...(getScopeAdvice(draft).length
      ? [
          {
            title: "Pontos de atenção no escopo",
            content: getScopeAdvice(draft).join("\n\n"),
            step: 3,
          },
        ]
      : []),
    {
      title: "Decisões pendentes",
      content: pending.length
        ? pending
            .map(
              (item) =>
                `• ${item.label} — ${item.deferred ? "marcada para depois" : "não respondida"}`,
            )
            .join("\n")
        : "Todas as decisões essenciais foram preenchidas. Valide a experiência com um protótipo jogável.",
      step: -1,
    },
  ];
}

export function exportConcept(draft: GameIdeaDraft): string {
  const pending = getPendingDecisions(draft).length;
  return (
    `# ${draft.answers.title.trim() || "Conceito de jogo"}\n\nEstado: ${draft.reviewed ? "Revisado" : "Rascunho"} · ${pending} decisões essenciais em aberto.\n\n` +
    conceptSections(draft)
      .map((section) => `## ${section.title}\n\n${section.content}`)
      .join("\n\n")
  );
}
