import { describe, it, expect } from "@jest/globals";
import { buildPrompt } from "../src/prompt.js";

describe("buildPrompt", () => {
  const diff = "diff --git a/file.ts\n+added line\n-removed line";

  it("builds a prompt with diff and language", () => {
    const prompt = buildPrompt(diff, "english");
    expect(prompt).toContain("in english");
    expect(prompt).toContain(diff);
    expect(prompt).toContain("bullet");
    expect(prompt).not.toContain("Additional instructions");
  });

  it("includes custom prompt when provided", () => {
    const prompt = buildPrompt(diff, "spanish", "Focus on API changes");
    expect(prompt).toContain("in spanish");
    expect(prompt).toContain("Additional instructions: Focus on API changes");
  });

  it("handles empty custom prompt as undefined", () => {
    const prompt = buildPrompt(diff, "english", undefined);
    expect(prompt).not.toContain("Additional instructions");
  });
});
