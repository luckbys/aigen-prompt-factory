import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ideaReducer } from "../lib/idea";
import type { IdeaAction } from "../lib/idea";
import { loadDraft, saveDraft } from "../services/draftStorage";

export function useGameIdea() {
  const [loaded] = useState(loadDraft);
  const [draft, dispatch] = useReducer(ideaReducer, loaded.draft);
  const [savedAt, setSavedAt] = useState(loaded.savedAt);
  const [problem, setProblem] = useState(loaded.problem);
  const [restored, setRestored] = useState(
    Boolean(loaded.savedAt && loaded.draft.mode),
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >(loaded.savedAt ? "saved" : "idle");
  const latest = useRef(draft);
  const unsaved = useRef(false);
  latest.current = draft;

  const change = useCallback((action: IdeaAction) => {
    if (action.type === "reset") setRestored(false);
    unsaved.current = true;
    setSaveStatus("saving");
    dispatch(action);
  }, []);

  const persist = useCallback((notify = true) => {
    if (!unsaved.current) return;
    try {
      const timestamp = saveDraft(latest.current);
      unsaved.current = false;
      if (notify) {
        setSavedAt(timestamp);
        setSaveStatus("saved");
        setProblem(null);
      }
    } catch {
      if (notify) setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!unsaved.current) return;
    const timer = window.setTimeout(() => persist(), 400);
    return () => window.clearTimeout(timer);
  }, [draft, persist]);

  useEffect(() => {
    const flush = () => persist(false);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persist]);

  return {
    draft,
    change,
    save: () => persist(),
    saveStatus,
    savedAt,
    problem,
    restored,
  };
}
