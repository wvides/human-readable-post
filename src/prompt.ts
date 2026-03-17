export function buildPrompt(
  diff: string,
  language: string,
  customPrompt?: string
): string {
  let prompt = `You are a release notes assistant. Summarize the following git diff into a concise, human-readable summary of 2-6 lines. Focus on what changed and why it matters to the team. Write in ${language}.

Do NOT include code snippets, file paths, or technical jargon unless necessary. The audience is the engineering team reading a Slack notification.

Git diff:
\`\`\`
${diff}
\`\`\``;

  if (customPrompt) {
    prompt += `\n\nAdditional instructions: ${customPrompt}`;
  }

  return prompt;
}
