import type { TemplateSchema } from "../types/template";
import { normalizeTemplateSchema } from "./templateSchema";

const DB_NAME = "resume-builder-templates";
const STORE_NAME = "templates";
const DB_VERSION = 1;

export async function listTemplates(): Promise<TemplateSchema[]> {
  const db = await openDatabase();
  const values = await request<unknown[]>(db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll());
  db.close();
  return values.map(normalizeTemplateSchema).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveTemplate(template: TemplateSchema): Promise<TemplateSchema> {
  const normalized = normalizeTemplateSchema(template);
  const db = await openDatabase();
  await request(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(normalized));
  db.close();
  return normalized;
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await openDatabase();
  await request(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id));
  db.close();
}

function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error("当前浏览器不支持本地模板存储。"));
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains(STORE_NAME)) open.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(new Error("无法打开本地模板库。"));
  });
}

function request<T = undefined>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(new Error("本地模板保存失败。"));
  });
}
