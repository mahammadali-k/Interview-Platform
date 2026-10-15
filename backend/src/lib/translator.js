import { ENV } from "./env.js";

// Text translation for live call captions. The provider is chosen with TRANSLATE_PROVIDER.

export const TRANSLATE_LANGUAGES = ["en", "az", "ru"];

const TIMEOUT_MS = 8000;
const CACHE_LIMIT = 500;
const cache = new Map();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) });

  if (!response.ok) throw new Error(`Translation service responded with status ${response.status}`);

  return response.json();
}

async function withMyMemory(text, from, to) {
  const params = new URLSearchParams({ q: text, langpair: `${from}|${to}` });
  if (ENV.MYMEMORY_EMAIL) params.set("de", ENV.MYMEMORY_EMAIL);

  const data = await fetchJson(`https://api.mymemory.translated.net/get?${params}`);

  if (data.responseStatus !== 200) throw new Error(data.responseDetails || "Translation failed");

  return data.responseData.translatedText;
}

async function withDeepL(text, from, to) {
  if (!ENV.DEEPL_API_KEY) throw new Error("DEEPL_API_KEY is not set");

  // free keys end with ":fx" and use a different host
  const host = ENV.DEEPL_API_KEY.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const data = await fetchJson(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${ENV.DEEPL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [text], source_lang: from.toUpperCase(), target_lang: to.toUpperCase() }),
  });

  return data.translations[0].text;
}

async function withGoogle(text, from, to) {
  if (!ENV.GOOGLE_TRANSLATE_API_KEY) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set");

  const data = await fetchJson(
    `https://translation.googleapis.com/language/translate/v2?key=${ENV.GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: from, target: to, format: "text" }),
    }
  );

  return data.data.translations[0].translatedText;
}

const PROVIDERS = { mymemory: withMyMemory, deepl: withDeepL, google: withGoogle };

/** @returns {Promise<string>} the translated text (the input itself when nothing needs translating) */
export async function translate(text, from, to) {
  if (from === to) return text;

  const key = `${from}|${to}|${text}`;
  if (cache.has(key)) return cache.get(key);

  const provider = PROVIDERS[ENV.TRANSLATE_PROVIDER] || withMyMemory;
  const translated = (await provider(text, from, to)).trim();

  // a tiny FIFO cache: captions repeat short phrases ("yes", "thank you") a lot
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, translated);

  return translated;
}
