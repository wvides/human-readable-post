import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock @actions/core
const mockGetInput = jest.fn();
const mockSetOutput = jest.fn();
const mockSetFailed = jest.fn();
const mockSetSecret = jest.fn();
const mockInfo = jest.fn();

jest.unstable_mockModule("@actions/core", () => ({
  getInput: mockGetInput,
  setOutput: mockSetOutput,
  setFailed: mockSetFailed,
  setSecret: mockSetSecret,
  info: mockInfo,
}));

// Mock diff module
const mockComputeDiff = jest.fn();
jest.unstable_mockModule("../src/diff.js", () => ({
  computeDiff: mockComputeDiff,
}));

// Mock providers module
const mockCreateProvider = jest.fn();
const mockGetDefaultModel = jest.fn();
jest.unstable_mockModule("../src/providers/index.js", () => ({
  createProvider: mockCreateProvider,
  getDefaultModel: mockGetDefaultModel,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  mockGetDefaultModel.mockReturnValue("gpt-4o-mini");
});

function setupInputs(inputs: Record<string, string>) {
  mockGetInput.mockImplementation((name: unknown) => inputs[name as string] || "");
}

describe("main", () => {
  it("runs successfully end-to-end", async () => {
    setupInputs({
      provider: "openai",
      api_key: "sk-test",
      diff_mode: "commit",
      max_diff_size: "4000",
      language: "english",
    });

    mockComputeDiff.mockResolvedValue("diff content");
    mockCreateProvider.mockResolvedValue({
      generateSummary: jest.fn<() => Promise<string>>().mockResolvedValue("Release summary here"),
    });

    await import("../src/main.js");

    // Wait for async run() to complete
    await new Promise((r) => setTimeout(r, 100));

    expect(mockSetSecret).toHaveBeenCalledWith("sk-test");
    expect(mockComputeDiff).toHaveBeenCalledWith("commit", undefined, 4000);
    expect(mockSetOutput).toHaveBeenCalledWith("summary", "Release summary here");
    expect(mockSetFailed).not.toHaveBeenCalled();
  });

  it("clamps max_diff_size to valid range", async () => {
    setupInputs({
      provider: "openai",
      api_key: "sk-test",
      diff_mode: "commit",
      max_diff_size: "999999",
      language: "english",
    });

    mockComputeDiff.mockResolvedValue("diff content");
    mockCreateProvider.mockResolvedValue({
      generateSummary: jest.fn<() => Promise<string>>().mockResolvedValue("summary"),
    });

    await import("../src/main.js");
    await new Promise((r) => setTimeout(r, 100));

    // Should be clamped to 100000
    expect(mockComputeDiff).toHaveBeenCalledWith("commit", undefined, 100000);
  });

  it("falls back to 4000 when max_diff_size is NaN", async () => {
    setupInputs({
      provider: "openai",
      api_key: "sk-test",
      diff_mode: "commit",
      max_diff_size: "not-a-number",
      language: "english",
    });

    mockComputeDiff.mockResolvedValue("diff content");
    mockCreateProvider.mockResolvedValue({
      generateSummary: jest.fn<() => Promise<string>>().mockResolvedValue("summary"),
    });

    await import("../src/main.js");
    await new Promise((r) => setTimeout(r, 100));

    expect(mockComputeDiff).toHaveBeenCalledWith("commit", undefined, 4000);
  });

  it("calls setFailed on error", async () => {
    setupInputs({
      provider: "openai",
      api_key: "sk-test",
    });

    mockComputeDiff.mockRejectedValue(new Error("git failed"));

    await import("../src/main.js");
    await new Promise((r) => setTimeout(r, 100));

    expect(mockSetFailed).toHaveBeenCalledWith("git failed");
  });

  it("rejects invalid provider", async () => {
    setupInputs({
      provider: "invalid-provider",
      api_key: "sk-test",
    });

    await import("../src/main.js");
    await new Promise((r) => setTimeout(r, 100));

    expect(mockSetFailed).toHaveBeenCalledWith(
      expect.stringContaining("Invalid provider")
    );
  });

  it("rejects invalid diff_mode", async () => {
    setupInputs({
      provider: "openai",
      api_key: "sk-test",
      diff_mode: "invalid-mode",
    });

    await import("../src/main.js");
    await new Promise((r) => setTimeout(r, 100));

    expect(mockSetFailed).toHaveBeenCalledWith(
      expect.stringContaining("Invalid diff_mode")
    );
  });
});
