import axiosInstance from "./axios";

/**
 * Code runs in a sandbox on the server, and the server judges the output too.
 * @param {string} language
 * @param {string} code
 * @param {{ problem?: string, sessionId?: string }} context
 * @returns {Promise<{success: boolean, output?: string, error?: string, passed: boolean}>}
 */
export async function executeCode(language, code, context = {}) {
  try {
    const { data } = await axiosInstance.post("/execute", { language, code, ...context });
    return data;
  } catch (error) {
    return {
      success: false,
      passed: false,
      error: error.response?.data?.message || `Failed to execute code: ${error.message}`,
    };
  }
}
