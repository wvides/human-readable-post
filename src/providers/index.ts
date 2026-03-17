export interface LLMProvider {
  generateSummary(prompt: string): Promise<string>;
}

export type ProviderName = "openai" | "anthropic" | "mistral";

const DEFAULT_MODELS: Record<ProviderName, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  mistral: "mistral-small-latest",
};

export function getDefaultModel(provider: ProviderName): string {
  return DEFAULT_MODELS[provider];
}

export async function createProvider(
  name: ProviderName,
  apiKey: string,
  model: string
): Promise<LLMProvider> {
  switch (name) {
    case "openai": {
      const { OpenAIProvider } = await import("./openai.js");
      return new OpenAIProvider(apiKey, model);
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./anthropic.js");
      return new AnthropicProvider(apiKey, model);
    }
    case "mistral": {
      const { MistralProvider } = await import("./mistral.js");
      return new MistralProvider(apiKey, model);
    }
    default:
      throw new Error(
        `Unknown provider: ${name}. Must be one of: openai, anthropic, mistral`
      );
  }
}
