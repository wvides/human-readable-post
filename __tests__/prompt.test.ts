import { describe, it, expect } from "@jest/globals";
import { buildPrompt } from "../src/prompt.js";

describe("buildPrompt", () => {
  const diff = "diff --git a/file.ts\n+added line\n-removed line";

  it("builds a prompt with diff and language", () => {
    const prompt = buildPrompt(diff, "english");
    expect(prompt.system).toContain("in english");
    expect(prompt.user).toContain(diff);
    expect(prompt.system).toContain("overall purpose and effect");
    expect(prompt.system).not.toContain("Additional instructions");
  });

  it("includes custom prompt when provided", () => {
    const prompt = buildPrompt(diff, "spanish", "Focus on API changes");
    expect(prompt.system).toContain("in spanish");
    expect(prompt.system).toContain("Additional instructions: Focus on API changes");
  });

  it("handles empty custom prompt as undefined", () => {
    const prompt = buildPrompt(diff, "english", undefined);
    expect(prompt.system).not.toContain("Additional instructions");
  });

  it("separates instructions from diff content", () => {
    const prompt = buildPrompt(diff, "english");
    expect(prompt.system).not.toContain(diff);
    expect(prompt.user).not.toContain("Rules:");
  });
});
