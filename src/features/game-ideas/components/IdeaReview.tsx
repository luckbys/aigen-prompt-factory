import { Copy, Download, Pencil, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { conceptSections, getPendingDecisions } from "../lib/idea";
import type { GameIdeaDraft } from "../types";

interface Props {
  draft: GameIdeaDraft;
  onEdit: (step: number) => void;
  onCopy: () => void;
  onDownload: () => void;
}

export function IdeaReview({ draft, onEdit, onCopy, onDownload }: Props) {
  const pending = getPendingDecisions(draft);
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/50 p-4 text-sm leading-6">
        {draft.reviewed && (
          <p className="mb-2 flex items-center gap-2 font-medium">
            <CheckCircle2
              className="h-4 w-4 text-teal-700"
              aria-hidden="true"
            />{" "}
            Conceito revisado
          </p>
        )}
        {pending.length
          ? `${pending.length} decisões essenciais continuam em aberto. Elas serão incluídas no documento para você retomar depois.`
          : "As decisões essenciais estão registradas. O próximo passo é testar o ciclo principal em um protótipo jogável."}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onCopy}>
          <Copy aria-hidden="true" /> Copiar conceito
        </Button>
        <Button type="button" variant="outline" onClick={onDownload}>
          <Download aria-hidden="true" /> Baixar conceito (.md)
        </Button>
      </div>
      <article aria-label="Documento do conceito" className="space-y-7">
        <h3 className="break-words text-2xl font-semibold">
          {draft.answers.title.trim() || "Conceito de jogo"}
        </h3>
        {conceptSections(draft).map((section) => (
          <section key={section.title} className="space-y-2 border-t pt-5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold">{section.title}</h4>
              {section.step >= 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Editar ${section.title}`}
                  onClick={() => onEdit(section.step)}
                >
                  <Pencil aria-hidden="true" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {section.content}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
