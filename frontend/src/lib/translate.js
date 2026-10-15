import axiosInstance from "./axios";

/** @returns {Promise<string | null>} the translation, or null when the service failed */
export async function translateText(text, from, to) {
  if (from === to) return text;

  try {
    const { data } = await axiosInstance.post("/translate", { text, from, to });
    return data.text;
  } catch (error) {
    console.warn("Translation failed:", error.response?.data?.message || error.message);
    return null;
  }
}
