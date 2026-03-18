export function buildPrompt(
  diff: string,
  language: string,
  customPrompt?: string
): string {
  let prompt = `Summarize this git diff in ${language}. Rules:
- One line, 10 words max
- Say what changed, nothing else
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
