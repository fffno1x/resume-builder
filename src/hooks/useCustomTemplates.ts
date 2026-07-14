import { useCallback, useEffect, useState } from "react";
import type { TemplateSchema } from "../types/template";
import { deleteTemplate, listTemplates, saveTemplate } from "../templates/templateStorage";

export function useCustomTemplates() {
  const [templates, setTemplates] = useState<TemplateSchema[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try { setTemplates(await listTemplates()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "无法读取本地模板。"); }
  }, []);

  useEffect(() => {
    if (typeof indexedDB === "undefined") return;
    void refresh();
  }, [refresh]);

  const upsert = useCallback(async (template: TemplateSchema) => {
    const saved = await saveTemplate(template);
    setTemplates((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    return saved;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteTemplate(id);
    setTemplates((current) => current.filter((item) => item.id !== id));
  }, []);

  return { templates, error, upsert, remove };
}
