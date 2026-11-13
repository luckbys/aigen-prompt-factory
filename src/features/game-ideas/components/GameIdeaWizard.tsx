import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Gamepad2,
  Lightbulb,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { STEPS } from "../data/questions";
import { useGameIdea } from "../hooks/useGameIdea";
import { exportConcept, getPendingDecisions, getStepErrors } from "../lib/idea";
import { FEATURE_OPTIONS } from "../types";
import type { QuestionKey } from "../types";
import { IdeaQuestion } from "./IdeaQuestion";
import { IdeaReview } from "./IdeaReview";
import { IdeaSummary } from "./IdeaSummary";
import { ScopeAdvice } from "./ScopeAdvice";

type Issue = QuestionKey | "mode";

export default function GameIdeaWizard() {
  const { draft, change, save, saveStatus, savedAt, problem, restored } =
    useGameIdea();
  const [errors, setErrors] = useState<Issue[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(draft.step);
  const step = STEPS[draft.step];

  useEffect(() => {
    if (previousStep.current !== draft.step) {
      heading.current?.focus();
      previousStep.current = draft.step;
    }
  }, [draft.step]);

  useEffect(() => {
    if (errors.length)
      document
        .getElementById(
          errors[0] === "mode" ? "idea-mode" : `idea-${errors[0]}`,
        )
        ?.focus();
  }, [errors]);

  const navigate = (index: number) => {
    setErrors([]);
    change({ type: "step", step: index });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const stepsToCheck = draft.step === 4 ? [0, 1, 2, 3] : [draft.step];
    for (const index of stepsToCheck) {
      const issues = getStepErrors(draft, index);
      if (issues.length) {
        change({ type: "step", step: index });
        setErrors(issues);
        return;
      }
    }
    if (draft.step < 4) navigate(draft.step + 1);
    else {
      change({ type: "review" });
      toast.success(
        getPendingDecisions(draft).length
          ? "Conceito revisado. As decisões em aberto continuam registradas."
          : "Conceito revisado. Hora de experimentar o primeiro protótipo!",
      );
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportConcept(draft));
      toast.success("Conceito copiado!");
    } catch {
      toast.error("Não foi possível copiar. Você pode baixar o documento.");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([exportConcept(draft)], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    const name = draft.answers.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    link.href = url;
    link.download = `${name || "ideia-do-jogo"}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const statusText =
    saveStatus === "error"
      ? "Não foi possível salvar neste navegador"
      : saveStatus === "saving"
        ? "Salvando rascunho…"
        : savedAt
          ? "Rascunho salvo neste navegador"
          : "Seu rascunho será salvo neste navegador";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <header className="mb-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-100">
            <Gamepad2 className="h-4 w-4" aria-hidden="true" /> Laboratório de
            ideias
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <RotateCcw aria-hidden="true" /> Nova ideia
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Começar uma nova ideia?</AlertDialogTitle>
                <AlertDialogDescription>
                  O rascunho atual será substituído neste navegador. Se quiser
                  guardá-lo, cancele e baixe o conceito na etapa de revisão.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setErrors([]);
                    change({ type: "reset" });
                  }}
                >
                  Começar nova ideia
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Da primeira faísca a uma ideia jogável.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Conecte experiência, mecânica e um primeiro protótipo. Você pode
            explorar possibilidades, deixar decisões para depois e voltar quando
            quiser.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p
            role="status"
            className={cn(
              "flex items-center gap-2",
              saveStatus === "error" && "text-destructive",
            )}
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {statusText}
          </p>
          <a
            className="text-sm text-teal-800 underline underline-offset-4 dark:text-teal-200 lg:hidden"
            href="#idea-summary"
          >
            Ver resumo da ideia
          </a>
        </div>
        {(problem || saveStatus === "error") && (
          <div
            role="alert"
            className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
          >
            <p>
              {saveStatus === "error" || problem === "unavailable"
                ? "O armazenamento do navegador não está disponível. Suas respostas continuam nesta tela; baixe o conceito antes de sair para guardá-las."
                : "O rascunho anterior não pôde ser lido. Ele só será substituído quando você fizer uma alteração. Você pode começar uma nova ideia aqui."}
            </p>
            {saveStatus === "error" && (
              <Button type="button" variant="outline" size="sm" onClick={save}>
                Tentar salvar novamente
              </Button>
            )}
          </div>
        )}
        {restored && !problem && (
          <p className="text-sm text-teal-800 dark:text-teal-200">
            Rascunho recuperado. Continue de onde parou ou escolha uma etapa
            para editar.
          </p>
        )}
      </header>

      <nav aria-label="Etapas da ideia de jogo" className="mb-8">
        <ol className="grid grid-cols-5 gap-1 rounded-2xl border bg-card p-2 sm:gap-2">
          {STEPS.map((item, index) => {
            const ready =
              index === 4
                ? draft.reviewed
                : getStepErrors(draft, index).length === 0;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-label={`Etapa ${index + 1}: ${item.title}`}
                  aria-current={index === draft.step ? "step" : undefined}
                  onClick={() => navigate(index)}
                  className={cn(
                    "flex min-h-16 w-full flex-col items-center justify-center gap-2 rounded-xl px-1 py-3 text-xs transition-colors sm:flex-row sm:px-3 sm:text-sm",
                    index === draft.step
                      ? "bg-teal-800 text-white shadow-sm dark:bg-teal-700"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      index === draft.step
                        ? "border-white/40"
                        : "border-border",
                    )}
                  >
                    {ready ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                  <span className="sr-only">
                    {ready ? ", respostas registradas" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        <form
          noValidate
          onSubmit={submit}
          className="min-w-0 rounded-2xl border bg-card shadow-sm"
        >
          <div className="space-y-3 border-b p-5 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-800 dark:text-teal-200">
              Etapa {draft.step + 1} de 5
            </p>
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight"
            >
              {step.title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </div>
          <div className="space-y-8 p-5 sm:p-8">
            {errors.length > 0 && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
              >
                Faltam algumas respostas nesta etapa. Preencha os campos
                indicados ou marque o que deseja decidir depois.
              </p>
            )}
            {draft.step === 0 && (
              <>
                <fieldset className="space-y-3">
                  <legend className="mb-3 font-medium">
                    Como você quer começar?
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          mode: "own",
                          icon: Lightbulb,
                          title: "Já tenho uma ideia",
                          description:
                            "Traga a sua faísca e vamos dar forma a ela.",
                        },
                        {
                          mode: "explore",
                          icon: Sparkles,
                          title: "Quero explorar possibilidades",
                          description:
                            "Escolha uma inspiração e faça dela algo seu.",
                        },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.mode}
                        id={option.mode === "own" ? "idea-mode" : undefined}
                        type="button"
                        aria-pressed={draft.mode === option.mode}
                        onClick={() => {
                          change({ type: "mode", mode: option.mode });
                          setErrors([]);
                        }}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left transition-colors",
                          draft.mode === option.mode
                            ? "border-teal-700 bg-teal-50/70 dark:bg-teal-950/40"
                            : "border-border hover:border-teal-500",
                        )}
                      >
                        <option.icon
                          className="mb-3 h-5 w-5 text-teal-700 dark:text-teal-300"
                          aria-hidden="true"
                        />
                        <span className="block text-sm font-semibold">
                          {option.title}
                        </span>
                        <span className="mt-2 block text-xs leading-6 text-muted-foreground">
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.includes("mode") && (
                    <p className="text-sm text-destructive">
                      Escolha como deseja começar.
                    </p>
                  )}
                </fieldset>
                {draft.mode && (
                  <div className="space-y-3">
                    <Label htmlFor="idea-title">
                      Nome de trabalho{" "}
                      <span className="ml-1 font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      id="idea-title"
                      value={draft.answers.title}
                      maxLength={120}
                      placeholder="Não precisa ser o nome definitivo"
                      className="h-12 rounded-xl"
                      onChange={(event) =>
                        change({
                          type: "answer",
                          field: "title",
                          value: event.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </>
            )}

            {draft.step < 4 &&
              (draft.step !== 0 || draft.mode) &&
              step.fields.map((field) => (
                <IdeaQuestion
                  key={`${field}-${field === "seed" ? draft.mode : ""}`}
                  field={field}
                  value={draft.answers[field]}
                  deferred={draft.undecided.includes(field)}
                  error={errors.includes(field)}
                  initiallySuggest={
                    field === "seed" && draft.mode === "explore"
                  }
                  onChange={(value) => {
                    change({ type: "answer", field, value });
                    setErrors((current) =>
                      current.filter((issue) => issue !== field),
                    );
                  }}
                  onDefer={(deferred) => {
                    change({ type: "defer", field, deferred });
                    setErrors((current) =>
                      current.filter((issue) => issue !== field),
                    );
                  }}
                />
              ))}

            {draft.step === 3 && (
              <>
                <fieldset className="space-y-3">
                  <legend className="mb-2 font-medium">
                    Ambições para o jogo completo{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </legend>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Marque o que imagina para o futuro. Essas escolhas ajudam a
                    avaliar o escopo e não entram automaticamente no protótipo.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {FEATURE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-teal-700"
                          checked={draft.features.includes(option.value)}
                          onChange={() =>
                            change({ type: "feature", feature: option.value })
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <ScopeAdvice
                  draft={draft}
                  onApply={(value) => {
                    change({ type: "answer", field: "prototype", value });
                    setErrors((current) =>
                      current.filter((issue) => issue !== "prototype"),
                    );
                  }}
                />
              </>
            )}

            {draft.step === 4 && (
              <IdeaReview
                draft={draft}
                onEdit={navigate}
                onCopy={copy}
                onDownload={download}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 p-5 sm:px-8">
            <Button
              type="button"
              variant="ghost"
              disabled={draft.step === 0}
              onClick={() => navigate(draft.step - 1)}
            >
              <ArrowLeft aria-hidden="true" /> Voltar
            </Button>
            <Button
              type="submit"
              disabled={draft.step === 4 && draft.reviewed}
              className="bg-teal-800 text-white hover:bg-teal-900 dark:bg-teal-700"
            >
              {draft.step === 4 ? (
                <>
                  <CheckCircle2 aria-hidden="true" />
                  {draft.reviewed ? "Conceito revisado" : "Concluir revisão"}
                </>
              ) : (
                <>
                  Continuar <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </form>
        <IdeaSummary draft={draft} onEdit={navigate} />
      </div>
    </div>
  );
}
