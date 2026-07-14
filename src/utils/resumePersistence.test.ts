import { describe, expect, it } from "vitest";
import { defaultResume } from "../data/defaultResume";
import {
  loadResumeFromStorage,
  parseResumeImport,
  reorderItems,
  saveResumeToStorage,
  serializeResume,
} from "./resumePersistence";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("resume persistence helpers", () => {
  it("serializes and parses valid resume data without changing content", () => {
    const json = serializeResume(defaultResume);

    expect(parseResumeImport(json)).toEqual(defaultResume);
  });

  it("rejects invalid JSON imports with a useful message", () => {
    expect(() => parseResumeImport("{bad json")).toThrow("有效 JSON");
  });

  it("rejects imports that do not match the resume schema", () => {
    const invalidResume = JSON.stringify({
      profile: {
        name: "李明",
        title: "前端开发工程师",
        phone: "138 0000 0000",
        city: "上海",
        website: "github.com/liming",
        summary: "简历简介",
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      awards: [],
    });

    expect(() => parseResumeImport(invalidResume)).toThrow("profile.email");
  });

  it("loads default data when local storage is empty", () => {
    const storage = new MemoryStorage();

    const result = loadResumeFromStorage(storage);

    expect(result.source).toBe("default");
    expect(result.data).toEqual(defaultResume);
  });

  it("saves and reloads resume data from storage", () => {
    const storage = new MemoryStorage();
    const nextResume = {
      ...defaultResume,
      profile: { ...defaultResume.profile, name: "王小明" },
    };

    saveResumeToStorage(storage, nextResume);
    const result = loadResumeFromStorage(storage);

    expect(result.source).toBe("storage");
    expect(result.data.profile.name).toBe("王小明");
  });

  it("falls back to default data when stored data is corrupt", () => {
    const storage = new MemoryStorage();
    storage.setItem("resume-builder:data", "{bad json");

    const result = loadResumeFromStorage(storage);

    expect(result.source).toBe("default");
    expect(result.error).toContain("有效 JSON");
    expect(result.data).toEqual(defaultResume);
  });

  it("reorders items immutably and ignores out-of-range moves", () => {
    const items = ["教育", "经历", "项目"];

    expect(reorderItems(items, 2, -1)).toEqual(["教育", "项目", "经历"]);
    expect(reorderItems(items, 0, -1)).toEqual(items);
    expect(reorderItems(items, 2, 1)).toEqual(items);
    expect(reorderItems(items, -1, 1)).toEqual(items);
    expect(reorderItems(items, 1, 1)).not.toBe(items);
  });

});
