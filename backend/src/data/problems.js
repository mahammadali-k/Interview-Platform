// Server-side truth for judging submissions: the candidate never decides whether tests passed.
// Keys are problem titles (what a session stores).

export const PROBLEMS = {
  "Two Sum": {
    difficulty: "easy",
    expectedOutput: {
      javascript: "[0,1]\n[1,2]\n[0,1]",
      python: "[0, 1]\n[1, 2]\n[0, 1]",
      java: "[0, 1]\n[1, 2]\n[0, 1]",
    },
  },
  "Reverse String": {
    difficulty: "easy",
    expectedOutput: {
      javascript: '["o","l","l","e","h"]\n["h","a","n","n","a","H"]',
      python: "['o', 'l', 'l', 'e', 'h']\n['h', 'a', 'n', 'n', 'a', 'H']",
      java: "[o, l, l, e, h]\n[h, a, n, n, a, H]",
    },
  },
  "Valid Palindrome": {
    difficulty: "easy",
    expectedOutput: {
      javascript: "true\nfalse\ntrue",
      python: "True\nFalse\nTrue",
      java: "true\nfalse\ntrue",
    },
  },
  "Maximum Subarray": {
    difficulty: "medium",
    expectedOutput: {
      javascript: "6\n1\n23",
      python: "6\n1\n23",
      java: "6\n1\n23",
    },
  },
  "Container With Most Water": {
    difficulty: "medium",
    expectedOutput: {
      javascript: "49\n1",
      python: "49\n1",
      java: "49\n1",
    },
  },
};

export const PROBLEM_TITLES = Object.keys(PROBLEMS);

// normalize output for comparison (trim whitespace, handle different spacing)
const normalize = (output) =>
  String(output)
    .trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/\[\s+/g, "[")
        .replace(/\s+\]/g, "]")
        .replace(/\s*,\s*/g, ",")
    )
    .filter(Boolean)
    .join("\n");

export function judgeOutput(problem, language, output) {
  const expected = PROBLEMS[problem]?.expectedOutput?.[language];

  return expected !== undefined && normalize(output) === normalize(expected);
}
