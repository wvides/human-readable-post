export interface PromptMessages {
  system: string;
  user: string;
}

export function buildPrompt(
  diff: string,
  language: string,
  customPrompt?: string
): PromptMessages {
  let system = `Summarize git diffs in ${language}. Rules:
- Describe the overall purpose and effect of the changes at a high level
- Max 10 lines, one sentence per line
- Do NOT list individual file changes or line-by-line details
- No filler, no opinions, no buzzwords
- No quotes around the summary`;

  if (customPrompt) {
    system += `\n\nAdditional instructions: ${customPrompt}`;
  }

  const user = `Git diff:\n\`\`\`\n${diff}\n\`\`\``;

  return { system, user };
}
