import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PRESET_TEMPLATES } from "../data/templates";
import { formatPrompt } from "../lib/formatPrompt";
import { getGeminiSuggestion } from "../services/geminiService";
import { loadGeneratorState, saveGeneratorState } from "../services/generatorStorage";
import type { PromptFieldName, PromptTemplate } from "../types";

export function usePromptGenerator() {
  const [initialState] = useState(loadGeneratorState);
  const [activeTemplate, setActiveTemplate] = useState(initialState.activeTemplate);
  const [formState, setFormState] = useState(initialState.formState);
  const [history, setHistory] = useState(initialState.history);
  const [undoStack, setUndoStack] = useState<PromptTemplate[]>([]);
  const [redoStack, setRedoStack] = useState<PromptTemplate[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const generatedPrompt = useMemo(() => aiPrompt ?? formatPrompt(formState), [aiPrompt, formState]);

  const handleTemplateChange = useCallback((template: string) => {
    if (!PRESET_TEMPLATES[template]) return;
    setHistory(prev => [formState, ...prev].slice(0, 50));
    setUndoStack(prev => [formState, ...prev]);
    setRedoStack([]);
    setActiveTemplate(template);
    setFormState(PRESET_TEMPLATES[template]);
    setAiPrompt(null);
  }, [formState]);

  const handleInputChange = useCallback((field: PromptFieldName, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value, lastModified: new Date().toISOString() }));
    setAiPrompt(null);
  }, []);

  const handleSave = useCallback(() => {
    try {
      saveGeneratorState({ activeTemplate, formState, history });
      toast.success("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    }
  }, [activeTemplate, formState, history]);

  const handleUndo = useCallback(() => {
    if (!undoStack.length) return;
    setRedoStack(prev => [formState, ...prev]);
    setUndoStack(undoStack.slice(1));
    setFormState(undoStack[0]);
    setAiPrompt(null);
    toast.info("Ação desfeita");
  }, [formState, undoStack]);

  const handleRedo = useCallback(() => {
    if (!redoStack.length) return;
    setUndoStack(prev => [formState, ...prev]);
    setRedoStack(redoStack.slice(1));
    setFormState(redoStack[0]);
    setAiPrompt(null);
    toast.info("Ação refeita");
  }, [formState, redoStack]);

  useEffect(() => {
    const timer = window.setTimeout(handleSave, 30000);
    return () => window.clearTimeout(timer);
  }, [handleSave]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const actions: Record<string, () => void> = {
        s: handleSave,
        z: event.shiftKey ? handleRedo : handleUndo,
        y: handleRedo,
      };
      const action = actions[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleSave, handleUndo, handleRedo]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  const handleApplyTip = (tip: string) => {
    let field: PromptFieldName = "guidelines";
    if (tip.includes("tom") || tip.includes("comunique")) field = "output";
    else if (tip.includes("exemplo") || tip.includes("Usuário:")) field = "examples";
    else if (tip.includes("não deve") || tip.includes("limitação")) field = "constraints";
    else if (tip.includes("estruture") || tip.includes("formatada")) field = "output";
    handleInputChange(field, formState[field] + (formState[field] ? "\n\n" : "") + tip);
    toast.success("Dica aplicada com sucesso!");
  };

  const handleGenerateWithGemini = async () => {
    setIsGenerating(true);
    try {
      const prompt = Object.entries(formState)
        .filter(([key, value]) => value && key !== "name")
        .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
        .join("\n\n");
      const suggestion = await getGeminiSuggestion({ prompt, type: "generate" });
      if (suggestion) {
        setAiPrompt(suggestion);
        toast.success("Prompt gerado com IA!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!generatedPrompt) {
      toast.error("Gere um prompt primeiro antes de melhorá-lo.");
      return;
    }
    setIsImproving(true);
    try {
      const suggestion = await getGeminiSuggestion({ prompt: generatedPrompt, type: "improve" });
      if (suggestion) {
        setAiPrompt(suggestion);
        toast.success("Prompt aprimorado com sucesso!");
      }
    } finally {
      setIsImproving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      toast.success("Prompt copiado para a área de transferência!");
    } catch {
      toast.error("Não foi possível copiar o prompt.");
    }
  };

  return {
    activeTemplate, formState, generatedPrompt, isGenerating, isImproving, isCopied,
    handleTemplateChange, handleInputChange, handleApplyTip, handleGenerateWithGemini,
    handleImprovePrompt, copyToClipboard,
  };
}
