export function buildPrompt(
  diff: string,
  language: string,
  customPrompt?: string
): string {
  let prompt = `Summarize this git diff in ${language}. Rules:
- Describe the overall purpose and effect of the changes at a high level
- Max 10 lines, one sentence per line
- Do NOT list individual file changes or line-by-line details
- No filler, no opinions, no buzzwords
- No quotes around the summary

Git diff:
\`\`\`
${diff}
\`\`\``;

  if (customPrompt) {
    prompt += `\n\nAdditional instructions: ${customPrompt}`;
  }

  return prompt;
}
