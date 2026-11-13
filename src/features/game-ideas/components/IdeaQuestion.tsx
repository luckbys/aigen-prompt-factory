import { useState } from "react";
import { Lightbulb, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUESTIONS } from "../data/questions";
import { getSuggestions, hasMoreSuggestions } from "../data/suggestions";
import type { QuestionKey } from "../types";

interface Props {
  field: QuestionKey;
  value: string;
  deferred: boolean;
  error?: boolean;
  initiallySuggest?: boolean;
  onChange: (value: string) => void;
  onDefer: (deferred: boolean) => void;
}

export function IdeaQuestion({
  field,
  value,
  deferred,
  error,
  initiallySuggest,
  onChange,
  onDefer,
}: Props) {
  const question = QUESTIONS[field];
  const [showSuggestions, setShowSuggestions] = useState(
    Boolean(initiallySuggest),
  );
  const [page, setPage] = useState(0);
  const options = getSuggestions(field, page);
  const id = `idea-${field}`;
  const description = `${id}-hint${error ? ` ${id}-error` : ""}`;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Label htmlFor={id} className="text-base leading-6">
          {question.label}
          {!question.required && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Opcional
            </span>
          )}
        </Label>
        {deferred && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-950 dark:bg-amber-950 dark:text-amber-100">
            Para depois
          </span>
        )}
      </div>
      <p id={`${id}-hint`} className="text-sm leading-6 text-muted-foreground">
        {question.hint}
      </p>
      {question.options ? (
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={description}
          aria-invalid={error || undefined}
          aria-required={question.required && !deferred}
          className="h-12 w-full rounded-xl border bg-background px-3 text-sm focus-visible:ring-2"
        >
          <option value="">
            {deferred ? "Definir em outro momento" : "Escolha uma opção"}
          </option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={1000}
          aria-describedby={description}
          aria-invalid={error || undefined}
          aria-required={question.required && !deferred}
          placeholder={question.placeholder}
          rows={field === "action" || field === "prototype" ? 4 : 3}
          className="resize-y rounded-xl bg-background text-base leading-7 sm:text-sm"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {question.required && !value.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDefer(!deferred)}
            aria-pressed={deferred}
          >
            {deferred ? "Quero responder agora" : "Ainda não decidi"}
          </Button>
        ) : (
          <span />
        )}
        {options.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showSuggestions}
            aria-controls={`${id}-suggestions`}
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Lightbulb aria-hidden="true" />{" "}
            {showSuggestions ? "Fechar sugestões" : "Ver sugestões"}
          </Button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          Preencha esta resposta ou marque “Ainda não decidi”.
        </p>
      )}
      {showSuggestions && options.length > 0 && (
        <div
          id={`${id}-suggestions`}
          className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900 dark:bg-teal-950/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-teal-900 dark:text-teal-100">
              Sugestões locais · escolha uma para aplicar só a esta resposta
            </p>
            {hasMoreSuggestions(field) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
              >
                <RefreshCw aria-hidden="true" /> Outras ideias
              </Button>
            )}
          </div>
          <div className="grid gap-2">
            {options.map((text, index) => (
              <button
                type="button"
                key={text}
                aria-label={`Usar sugestão ${index + 1}: ${text}`}
                onClick={() => onChange(text)}
                className="flex items-start justify-between gap-3 rounded-lg border border-teal-200/80 bg-background p-3 text-left text-sm leading-6 transition-colors hover:border-teal-600 dark:border-teal-800"
              >
                <span>{text}</span>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
