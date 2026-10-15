import axiosInstance from "./axios";

/** @returns {Promise<string>} the translation, or the original text when the service fails */
export async function translateText(text, from, to) {
  if (from === to) return text;

  try {
    const { data } = await axiosInstance.post("/translate", { text, from, to });
    return data.text;
  } catch {
    return text;
  }
}
