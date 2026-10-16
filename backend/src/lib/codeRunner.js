import { ENV } from "./env.js";

// Candidate code runs in a remote sandbox (Judge0 or Piston), never on this server.

const JUDGE0_LANGUAGE_IDS = { javascript: 93, python: 92, java: 62 };
const PISTON_LANGUAGES = {
  javascript: { language: "javascript", version: "18.15.0", file: "main.js" },
  python: { language: "python", version: "3.10.0", file: "main.py" },
  java: { language: "java", version: "15.0.2", file: "Main.java" },
};

export const SUPPORTED_LANGUAGES = Object.keys(JUDGE0_LANGUAGE_IDS);

const TIMEOUT_MS = 25000;
const decode = (value) => (value ? Buffer.from(value, "base64").toString("utf8") : "");

// the sandbox compiles Java as Main.java, so the class that holds main() has to be named Main
function prepareJava(code) {
  const mainIndex = code.search(/static\s+void\s+main\s*\(/);
  if (mainIndex === -1) return code;

  const classes = [...code.slice(0, mainIndex).matchAll(/\bclass\s+([A-Za-z_]\w*)/g)];
  const mainClass = classes.at(-1)?.[1];

  if (!mainClass || mainClass === "Main") return code;

  return code.replace(new RegExp(`\\b${mainClass}\\b`, "g"), "Main");
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.status === 429) throw new Error("The code runner is busy. Please try again in a moment.");
  if (!response.ok) throw new Error(`Code runner responded with status ${response.status}`);

  return response.json();
}

async function runWithJudge0(language, code) {
  const headers = {};
  if (ENV.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = ENV.JUDGE0_API_KEY;
    if (ENV.JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = ENV.JUDGE0_API_HOST;
  }

  const data = await postJson(
    `${ENV.JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
    {
      language_id: JUDGE0_LANGUAGE_IDS[language],
      source_code: Buffer.from(code, "utf8").toString("base64"),
      cpu_time_limit: 5,
      wall_time_limit: 10,
    },
    headers
  );

  const stdout = decode(data.stdout);
  const stderr = decode(data.stderr);
  const compileOutput = decode(data.compile_output);
  const statusId = data.status?.id;

  if (statusId === 5) return { success: false, output: stdout, error: "Time limit exceeded" };
  if (compileOutput) return { success: false, output: stdout, error: compileOutput };
  if (stderr) return { success: false, output: stdout, error: stderr };
  if (statusId && statusId > 4) {
    return { success: false, output: stdout, error: data.status.description || "Execution failed" };
  }

  return { success: true, output: stdout || "No output" };
}

async function runWithPiston(language, code) {
  const config = PISTON_LANGUAGES[language];
  const headers = ENV.PISTON_API_KEY ? { Authorization: ENV.PISTON_API_KEY } : {};

  const data = await postJson(
    `${ENV.PISTON_URL}/execute`,
    {
      language: config.language,
      version: config.version,
      files: [{ name: config.file, content: code }],
    },
    headers
  );

  if (!data.run) throw new Error(data.message || "Code runner returned an invalid response");

  const output = data.run.output || "";
  const stderr = data.run.stderr || data.compile?.stderr || "";

  if (stderr) return { success: false, output, error: stderr };

  return { success: true, output: output || "No output" };
}

/** @returns {Promise<{success: boolean, output?: string, error?: string}>} */
export async function runCode(language, code) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return { success: false, error: `Unsupported language: ${language}` };
  }

  const source = language === "java" ? prepareJava(code) : code;

  try {
    return ENV.CODE_RUNNER === "piston"
      ? await runWithPiston(language, source)
      : await runWithJudge0(language, source);
  } catch (error) {
    console.log("Code runner error:", error.message);
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}
