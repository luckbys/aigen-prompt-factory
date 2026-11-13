import { describe, expect, it } from "vitest";
import { createDraft, QUESTION_KEYS } from "../types";
import { getSuggestions } from "../data/suggestions";
import {
  answerLabel,
  exportConcept,
  getPendingDecisions,
  getScopeAdvice,
  getStepErrors,
  ideaReducer,
  suggestPrototype,
} from "./idea";

describe("game idea flow", () => {
  it("requires an intentional starting point and a response or explicit deferral", () => {
    const draft = createDraft();
    expect(getStepErrors(draft, 0)).toEqual(["mode", "seed"]);
    const exploring = ideaReducer(draft, { type: "mode", mode: "explore" });
    expect(getStepErrors(exploring, 0)).toEqual(["seed"]);
    expect(
      getStepErrors(
        ideaReducer(exploring, {
          type: "defer",
          field: "seed",
          deferred: true,
        }),
        0,
      ),
    ).toEqual([]);
  });

  it("treats whitespace as unanswered and keeps optional fields optional", () => {
    const draft = createDraft();
    draft.answers.playerRole = "   ";
    draft.answers.feeling = "Curiosidade";
    expect(getStepErrors(draft, 1)).toEqual(["playerRole"]);
    draft.answers.playerRole = "Exploradora";
    expect(getStepErrors(draft, 1)).toEqual([]);
  });

  it("applies a suggestion only to its target field and clears its deferred status", () => {
    const draft = createDraft();
    draft.answers.seed = "Minha ideia original";
    draft.answers.twist = "Meu diferencial";
    draft.undecided = ["action", "reward"];
    const suggestion = getSuggestions("action")[0];
    const updated = ideaReducer(draft, {
      type: "answer",
      field: "action",
      value: suggestion,
    });
    expect(updated.answers.action).toBe(suggestion);
    expect(updated.answers.seed).toBe("Minha ideia original");
    expect(updated.answers.twist).toBe("Meu diferencial");
    expect(updated.undecided).toEqual(["reward"]);
    expect(draft.answers.action).toBe("");
  });

  it("preserves answers when changing modes and navigating between steps", () => {
    let draft = ideaReducer(createDraft(), {
      type: "answer",
      field: "seed",
      value: "Exploração submarina",
    });
    draft = ideaReducer(draft, { type: "step", step: 3 });
    draft = ideaReducer(draft, { type: "mode", mode: "own" });
    draft = ideaReducer(draft, { type: "step", step: 0 });
    expect(draft.answers.seed).toBe("Exploração submarina");
  });

  it("rejects unsupported choices and excessive input", () => {
    const draft = createDraft();
    expect(
      ideaReducer(draft, {
        type: "answer",
        field: "platform",
        value: "invalid",
      }),
    ).toBe(draft);
    expect(
      ideaReducer(draft, {
        type: "answer",
        field: "seed",
        value: "x".repeat(1001),
      }),
    ).toBe(draft);
  });

  it("does not mark unanswered concepts as reviewed", () => {
    const draft = createDraft();
    expect(ideaReducer(draft, { type: "review" }).reviewed).toBe(false);
  });

  it("allows acknowledged open decisions and invalidates review after an edit", () => {
    let draft = ideaReducer(createDraft(), { type: "mode", mode: "own" });
    for (const field of QUESTION_KEYS)
      draft = ideaReducer(draft, { type: "defer", field, deferred: true });
    draft = ideaReducer(draft, { type: "review" });
    expect(draft.reviewed).toBe(true);
    expect(
      getPendingDecisions(draft).every((decision) => decision.deferred),
    ).toBe(true);
    const edited = ideaReducer(draft, {
      type: "answer",
      field: "action",
      value: "Explorar e construir",
    });
    expect(edited.reviewed).toBe(false);
    expect(edited.undecided).not.toContain("action");
  });

  it("toggles future ambitions without silently changing the prototype", () => {
    const draft = createDraft();
    draft.answers.prototype = "Testar uma ilha";
    const ambitious = ideaReducer(draft, {
      type: "feature",
      feature: "online",
    });
    expect(ambitious.features).toEqual(["online"]);
    expect(ambitious.answers.prototype).toBe("Testar uma ilha");
    expect(
      ideaReducer(ambitious, { type: "feature", feature: "online" }).features,
    ).toEqual([]);
  });

  it("offers concrete scope advice for a solo weekend project with online and open world", () => {
    const draft = createDraft();
    draft.answers.team = "solo";
    draft.answers.timebox = "weekend";
    draft.features = ["online", "open-world"];
    const advice = getScopeAdvice(draft).join(" ");
    expect(advice).toContain("sincronização");
    expect(advice).toContain("Uma única área");
    expect(advice).toContain("uma pessoa em um fim de semana");
    expect(draft.features).toEqual(["online", "open-world"]);
  });

  it("suggests a prototype using the chosen mechanic without changing the draft", () => {
    const draft = createDraft();
    draft.answers.action = "Explorar ilhas e melhorar o barco";
    draft.features = ["online"];
    const suggestion = suggestPrototype(draft);
    expect(suggestion).toContain(draft.answers.action);
    expect(suggestion).toContain("Testar localmente");
    expect(draft.answers.prototype).toBe("");
    expect(suggestion.length).toBeLessThanOrEqual(1000);
  });

  it("exports gameplay, scope and open decisions with readable option labels", () => {
    const draft = createDraft();
    draft.answers.title = "O arquipélago";
    draft.answers.action = "Explorar → coletar → melhorar";
    draft.answers.platform = "browser";
    draft.undecided = ["reward"];
    const document = exportConcept(draft);
    expect(document).toContain("# O arquipélago");
    expect(document).toContain("Explorar → coletar → melhorar");
    expect(document).toContain("Plataforma: Navegador");
    expect(document).toContain("marcada para depois");
    expect(document).toContain("não respondida");
    expect(document).toContain("Estado: Rascunho");
    expect(answerLabel(draft, "reward")).toBe("Ainda não decidi");
  });

  it("resets the whole idea without sharing mutable defaults", () => {
    const draft = createDraft();
    draft.features.push("online");
    draft.answers.title = "Antiga";
    expect(ideaReducer(draft, { type: "reset" })).toEqual(createDraft());
    expect(createDraft().features).toEqual([]);
  });
});
