import { ArrowRight, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { answerLabel, getPendingDecisions } from "../lib/idea";
import { QUESTIONS } from "../data/questions";
import { QUESTION_KEYS } from "../types";
import type { GameIdeaDraft } from "../types";

export function IdeaSummary({
  draft,
  onEdit,
}: {
  draft: GameIdeaDraft;
  onEdit: (step: number) => void;
}) {
  const pending = getPendingDecisions(draft);
  const total = QUESTION_KEYS.filter((key) => QUESTIONS[key].required).length;
  return (
    <aside
      id="idea-summary"
      aria-label="Resumo da ideia"
      className="min-w-0 scroll-mt-24 space-y-6 rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-6"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <NotebookPen className="h-4 w-4" aria-hidden="true" /> Seu conceito, em
        construção
      </div>
      <div>
        <h2 className="break-words text-xl font-semibold">
          {draft.answers.title.trim() || "Uma ideia à sua maneira"}
        </h2>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
          {draft.answers.seed.trim() ||
            "Escolha um ponto de partida. Suas decisões vão se conectar aqui."}
        </p>
      </div>
      <div className="space-y-4 border-y py-5">
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            O jogador
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {answerLabel(draft, "playerRole")}
          </p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            O ciclo principal
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {answerLabel(draft, "action")}
          </p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Primeiro teste
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {answerLabel(draft, "prototype")}
          </p>
        </div>
      </div>
      <p className="text-sm">
        <span className="font-semibold">
          {total - pending.length} de {total}
        </span>{" "}
        decisões essenciais definidas
      </p>
      {pending.some((item) => item.deferred) && (
        <p className="text-xs text-muted-foreground">
          {pending.filter((item) => item.deferred).length} marcadas para decidir
          depois.
        </p>
      )}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Você pode voltar a estas decisões:
          </p>
          {pending.slice(0, 3).map((item) => (
            <button
              key={item.field}
              type="button"
              onClick={() => onEdit(item.step)}
              className="block text-left text-sm leading-6 text-teal-800 underline decoration-teal-300 underline-offset-4 dark:text-teal-200"
            >
              {item.label}
            </button>
          ))}
          {pending.length > 3 && (
            <p className="text-xs text-muted-foreground">
              E mais {pending.length - 3} na revisão.
            </p>
          )}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onEdit(4)}
      >
        Ver conceito completo <ArrowRight aria-hidden="true" />
      </Button>
    </aside>
  );
}
