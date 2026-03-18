export function buildPrompt(
  diff: string,
  language: string,
  customPrompt?: string
): string {
  let prompt = `Summarize this git diff as a short Slack-style release update in ${language}. Rules:
- Use 2-4 bullet points, each one sentence max
- Start each bullet with a verb (Added, Fixed, Updated, Removed, Refactored)
- Be specific about what changed, not why it might matter
- Skip file paths, code snippets, and filler phrases
- No intro or outro text, just the bullets

Git diff:
\`\`\`
${diff}
\`\`\``;

  if (customPrompt) {
    prompt += `\n\nAdditional instructions: ${customPrompt}`;
  }

  return prompt;
}
