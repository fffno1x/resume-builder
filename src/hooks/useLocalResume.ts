import { useEffect, useState } from "react";
import { loadResumeFromStorage, saveResumeToStorage } from "../utils/resumePersistence";
import type { ResumeData } from "../types/resume";

type SaveState = "已自动保存" | "正在保存" | "使用示例数据";

export function useLocalResume() {
  const [initialLoad] = useState(() => loadResumeFromStorage(window.localStorage));
  const [resume, setResume] = useState<ResumeData>(initialLoad.data);
  const [saveState, setSaveState] = useState<SaveState>("使用示例数据");

  useEffect(() => {
    setSaveState("正在保存");
    saveResumeToStorage(window.localStorage, resume);
    const timer = window.setTimeout(() => setSaveState("已自动保存"), 250);

    return () => window.clearTimeout(timer);
  }, [resume]);

  return {
    resume,
    setResume,
    saveState,
    initialError: initialLoad.error,
  };
}
