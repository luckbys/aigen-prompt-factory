import { Compass, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScopeAdvice, suggestPrototype } from "../lib/idea";
import type { GameIdeaDraft } from "../types";

export function ScopeAdvice({
  draft,
  onApply,
}: {
  draft: GameIdeaDraft;
  onApply: (value: string) => void;
}) {
  const advice = getScopeAdvice(draft);
  const suggestion = suggestPrototype(draft);
  return (
    <div className="space-y-5 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900 dark:bg-teal-950/30">
      <div className="flex items-center gap-2 font-medium">
        <Compass
          className="h-5 w-5 text-teal-700 dark:text-teal-300"
          aria-hidden="true"
        />{" "}
        Um experimento possível
      </div>
      {advice.length > 0 && (
        <ul className="list-disc space-y-3 pl-5 text-sm leading-6">
          {advice.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <div className="space-y-3 border-t border-teal-200 pt-4 dark:border-teal-900">
        <p className="text-xs font-medium uppercase tracking-wider text-teal-800 dark:text-teal-200">
          Sugestão para testar a mecânica
        </p>
        <p className="text-sm leading-6">{suggestion}</p>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-10 whitespace-normal"
          onClick={() => onApply(suggestion)}
        >
          <Scissors aria-hidden="true" /> Usar no primeiro protótipo
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Altera somente a resposta sobre o protótipo. As ambições do jogo
          completo continuam registradas.
        </p>
      </div>
    </div>
  );
}
