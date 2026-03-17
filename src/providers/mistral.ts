import { Mistral } from "@mistralai/mistralai";
import type { LLMProvider } from "./index.js";

export class MistralProvider implements LLMProvider {
  private client: Mistral;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Mistral({ apiKey });
    this.model = model;
  }

  async generateSummary(prompt: string): Promise<string> {
    const response = await this.client.chat.complete({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens: 512,
    });

    const choice = response.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error("Mistral returned an empty response");
    }

    const content = choice.message.content;
    if (typeof content === "string") {
      return content.trim();
    }
    // content can be an array of chunks
    return content
      .map((chunk) => {
        if (typeof chunk === "string") return chunk;
        if ("text" in chunk) return chunk.text;
        return "";
      })
      .join("")
      .trim();
  }
}
