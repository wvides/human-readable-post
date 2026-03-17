import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

// Mock @actions/exec
const mockExec = jest.fn();
jest.unstable_mockModule("@actions/exec", () => ({
  exec: mockExec,
}));

// Must dynamically import after mocking
let computeDiff: typeof import("../src/diff.js").computeDiff;
let truncateDiff: typeof import("../src/diff.js").truncateDiff;

beforeAll(async () => {
  const mod = await import("../src/diff.js");
  computeDiff = mod.computeDiff;
  truncateDiff = mod.truncateDiff;
});

beforeEach(() => {
  mockExec.mockReset();
});

describe("truncateDiff", () => {
  it("returns diff unchanged when under max size", () => {
    expect(truncateDiff("short diff", 100)).toBe("short diff");
  });

  it("truncates diff and adds marker when over max size", () => {
    const longDiff = "a".repeat(5000);
    const result = truncateDiff(longDiff, 4000);
    expect(result.length).toBeGreaterThan(4000);
    expect(result).toContain("... [diff truncated");
    expect(result.startsWith("a".repeat(4000))).toBe(true);
  });
});

describe("computeDiff", () => {
  function simulateExecOutput(output: string) {
    mockExec.mockImplementation(
      async (
        _cmd: unknown,
        _args: unknown,
        opts: any
      ) => {
        opts.listeners.stdout(Buffer.from(output));
        return 0;
      }
    );
  }

  it("computes commit diff with HEAD~1", async () => {
    simulateExecOutput("diff content");
    const result = await computeDiff("commit", undefined, 4000);
    expect(result).toBe("diff content");
    expect(mockExec).toHaveBeenCalledWith(
      "git",
      ["diff", "HEAD~1", "HEAD"],
      expect.any(Object)
    );
  });

  it("computes ref diff with base_ref", async () => {
    simulateExecOutput("ref diff content");
    const result = await computeDiff("ref", "main", 4000);
    expect(result).toBe("ref diff content");
    expect(mockExec).toHaveBeenCalledWith(
      "git",
      ["diff", "main", "HEAD"],
      expect.any(Object)
    );
  });

  it("throws when ref mode has no base_ref", async () => {
    await expect(computeDiff("ref", undefined, 4000)).rejects.toThrow(
      "base_ref is required"
    );
  });

  it("computes tag diff between two most recent tags", async () => {
    mockExec.mockImplementation(
      async (
        _cmd: unknown,
        args: unknown,
        opts: any
      ) => {
        const argsArr = args as string[];
        if (argsArr[0] === "tag") {
          opts.listeners.stdout(Buffer.from("v2.0.0\nv1.0.0\n"));
        } else {
          opts.listeners.stdout(Buffer.from("tag diff content"));
        }
        return 0;
      }
    );

    const result = await computeDiff("tag", undefined, 4000);
    expect(result).toBe("tag diff content");
    expect(mockExec).toHaveBeenCalledWith(
      "git",
      ["diff", "v1.0.0", "v2.0.0"],
      expect.any(Object)
    );
  });

  it("throws when fewer than 2 tags exist", async () => {
    mockExec.mockImplementation(
      async (
        _cmd: unknown,
        _args: unknown,
        opts: any
      ) => {
        opts.listeners.stdout(Buffer.from("v1.0.0\n"));
        return 0;
      }
    );

    await expect(computeDiff("tag", undefined, 4000)).rejects.toThrow(
      "at least 2 tags"
    );
  });

  it("throws on empty diff", async () => {
    simulateExecOutput("");
    await expect(computeDiff("commit", undefined, 4000)).rejects.toThrow(
      "empty"
    );
  });

  it("truncates large diffs", async () => {
    simulateExecOutput("x".repeat(5000));
    const result = await computeDiff("commit", undefined, 100);
    expect(result).toContain("[diff truncated");
  });
});
