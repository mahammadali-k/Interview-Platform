import { useCallback, useState } from "react";
import { executeCode } from "../lib/execute";

// "Run code" state shared by the practice page and the live session
function useCodeRunner() {
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  /** @param {{ problem?: string, sessionId?: string }} context */
  const run = useCallback(async (language, code, context) => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(language, code, context);

    setOutput(result);
    setIsRunning(false);
    return result;
  }, []);

  const reset = useCallback(() => setOutput(null), []);

  return { output, isRunning, run, reset };
}

export default useCodeRunner;
