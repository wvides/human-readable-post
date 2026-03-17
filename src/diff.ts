import * as exec from "@actions/exec";

export type DiffMode = "commit" | "ref" | "tag";

async function runGit(args: string[]): Promise<string> {
  let output = "";
  await exec.exec("git", args, {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  });
  return output.trim();
}

async function getCommitDiff(): Promise<string> {
  return runGit(["diff", "HEAD~1", "HEAD"]);
}

async function getRefDiff(baseRef: string): Promise<string> {
  return runGit(["diff", baseRef, "HEAD"]);
}

async function getTagDiff(): Promise<string> {
  const tagsOutput = await runGit([
    "tag",
    "--sort=-version:refname",
    "--merged",
    "HEAD",
  ]);
  const tags = tagsOutput.split("\n").filter((t) => t.length > 0);

  if (tags.length < 2) {
    throw new Error(
      "Tag mode requires at least 2 tags. Found: " + tags.length
    );
  }

  const [currentTag, previousTag] = tags;
  return runGit(["diff", previousTag, currentTag]);
}

export function truncateDiff(diff: string, maxSize: number): string {
  if (diff.length <= maxSize) {
    return diff;
  }
  return (
    diff.slice(0, maxSize) +
    "\n\n... [diff truncated — exceeded " +
    maxSize +
    " chars]"
  );
}

export async function computeDiff(
  mode: DiffMode,
  baseRef: string | undefined,
  maxDiffSize: number
): Promise<string> {
  let diff: string;

  switch (mode) {
    case "commit":
      diff = await getCommitDiff();
      break;
    case "ref":
      if (!baseRef) {
        throw new Error("base_ref is required when diff_mode is 'ref'");
      }
      diff = await getRefDiff(baseRef);
      break;
    case "tag":
      diff = await getTagDiff();
      break;
    default:
      throw new Error(`Unknown diff_mode: ${mode}`);
  }

  if (!diff) {
    throw new Error("Git diff is empty — nothing to summarize");
  }

  return truncateDiff(diff, maxDiffSize);
}
