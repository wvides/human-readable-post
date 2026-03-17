import * as core from "@actions/core";
import { computeDiff } from "./diff.js";
import { buildPrompt } from "./prompt.js";
import {
  createProvider,
  getDefaultModel,
  type ProviderName,
} from "./providers/index.js";

async function run(): Promise<void> {
  try {
    // Read inputs
    const providerName = core.getInput("provider", {
      required: true,
    }) as ProviderName;
    const apiKey = core.getInput("api_key", { required: true });
    const diffMode = (core.getInput("diff_mode") || "commit") as
      | "commit"
      | "ref"
      | "tag";
    const baseRef = core.getInput("base_ref") || undefined;
    const maxDiffSize = Math.max(
      1,
      Math.min(100000, parseInt(core.getInput("max_diff_size") || "4000", 10) || 4000)
    );
    const language = core.getInput("language") || "english";
    const customPrompt = core.getInput("custom_prompt") || undefined;
    const model =
      core.getInput("model") || getDefaultModel(providerName);

    // Mask the API key
    core.setSecret(apiKey);

    // Validate provider
    if (!["openai", "anthropic", "mistral"].includes(providerName)) {
      throw new Error(
        `Invalid provider: ${providerName}. Must be one of: openai, anthropic, mistral`
      );
    }

    // Validate diff_mode
    if (!["commit", "ref", "tag"].includes(diffMode)) {
      throw new Error(
        `Invalid diff_mode: ${diffMode}. Must be one of: commit, ref, tag`
      );
    }

    // Compute diff
    core.info(`Computing diff (mode: ${diffMode})...`);
    const diff = await computeDiff(diffMode, baseRef, maxDiffSize);
    core.info(`Diff computed (${diff.length} chars)`);

    // Build prompt
    const prompt = buildPrompt(diff, language, customPrompt);

    // Generate summary
    core.info(`Generating summary with ${providerName} (${model})...`);
    const provider = await createProvider(providerName, apiKey, model);
    const summary = await provider.generateSummary(prompt);

    core.info("Summary generated successfully");
    core.setOutput("summary", summary);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
