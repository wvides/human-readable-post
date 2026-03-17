import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import { getDefaultModel } from "../src/providers/index.js";

// Mock OpenAI SDK
const mockOpenAICreate = jest.fn();
jest.unstable_mockModule("openai", () => ({
  default: class {
    chat = {
      completions: {
        create: mockOpenAICreate,
      },
    };
  },
}));

// Mock Anthropic SDK
const mockAnthropicCreate = jest.fn();
jest.unstable_mockModule("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: mockAnthropicCreate,
    };
  },
}));

// Mock Mistral SDK
const mockMistralComplete = jest.fn();
jest.unstable_mockModule("@mistralai/mistralai", () => ({
  Mistral: class {
    chat = {
      complete: mockMistralComplete,
    };
  },
}));

let createProvider: typeof import("../src/providers/index.js").createProvider;

beforeAll(async () => {
  const mod = await import("../src/providers/index.js");
  createProvider = mod.createProvider;
});

beforeEach(() => {
  mockOpenAICreate.mockReset();
  mockAnthropicCreate.mockReset();
  mockMistralComplete.mockReset();
});

describe("getDefaultModel", () => {
  it("returns gpt-4o-mini for openai", () => {
    expect(getDefaultModel("openai")).toBe("gpt-4o-mini");
  });

  it("returns claude model for anthropic", () => {
    expect(getDefaultModel("anthropic")).toBe("claude-sonnet-4-20250514");
  });

  it("returns mistral-small-latest for mistral", () => {
    expect(getDefaultModel("mistral")).toBe("mistral-small-latest");
  });
});

describe("OpenAI provider", () => {
  it("generates a summary", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "OpenAI summary" } }],
    });

    const provider = await createProvider("openai", "test-key", "gpt-4o-mini");
    const result = await provider.generateSummary("test prompt");
    expect(result).toBe("OpenAI summary");
  });

  it("throws on empty response", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const provider = await createProvider("openai", "test-key", "gpt-4o-mini");
    await expect(provider.generateSummary("test")).rejects.toThrow("empty");
  });
});

describe("Anthropic provider", () => {
  it("generates a summary", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "Anthropic summary" }],
    });

    const provider = await createProvider(
      "anthropic",
      "test-key",
      "claude-sonnet-4-20250514"
    );
    const result = await provider.generateSummary("test prompt");
    expect(result).toBe("Anthropic summary");
  });

  it("throws on empty response", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [],
    });

    const provider = await createProvider(
      "anthropic",
      "test-key",
      "claude-sonnet-4-20250514"
    );
    await expect(provider.generateSummary("test")).rejects.toThrow("empty");
  });
});

describe("Mistral provider", () => {
  it("generates a summary from string content", async () => {
    mockMistralComplete.mockResolvedValue({
      choices: [{ message: { content: "Mistral summary" } }],
    });

    const provider = await createProvider(
      "mistral",
      "test-key",
      "mistral-small-latest"
    );
    const result = await provider.generateSummary("test prompt");
    expect(result).toBe("Mistral summary");
  });

  it("generates a summary from array content", async () => {
    mockMistralComplete.mockResolvedValue({
      choices: [
        {
          message: {
            content: [{ text: "Part 1" }, { text: " Part 2" }],
          },
        },
      ],
    });

    const provider = await createProvider(
      "mistral",
      "test-key",
      "mistral-small-latest"
    );
    const result = await provider.generateSummary("test prompt");
    expect(result).toBe("Part 1 Part 2");
  });

  it("throws on empty response", async () => {
    mockMistralComplete.mockResolvedValue({
      choices: [],
    });

    const provider = await createProvider(
      "mistral",
      "test-key",
      "mistral-small-latest"
    );
    await expect(provider.generateSummary("test")).rejects.toThrow("empty");
  });
});

describe("createProvider", () => {
  it("throws on unknown provider", async () => {
    await expect(
      createProvider("unknown" as any, "key", "model")
    ).rejects.toThrow("Unknown provider");
  });
});
