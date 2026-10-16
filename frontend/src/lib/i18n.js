import { useSyncExternalStore } from "react";
import { getStored, setStored } from "./storage";

/**
 * A tiny i18n layer: the English text sits right next to the code as the default.
 * `t("area.key", "English text", { vars })` looks the key up in the selected language and falls back
 * to the English text. `useLang()` is called once in <App/>, so the whole tree re-renders when the
 * language changes and every component can just import `t`.
 */

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "az", label: "Azərbaycanca", short: "AZ" },
  { code: "ru", label: "Русский", short: "RU" },
];

// the other languages' dictionaries are separate chunks, loaded only when needed
const LOADERS = {
  az: () => import("../locales/az"),
  ru: () => import("../locales/ru"),
};
const DICTIONARIES = {};
const STORAGE_KEY = "lang";
const listeners = new Set();

function detect() {
  const saved = getStored(STORAGE_KEY);
  if (LANGUAGES.some((l) => l.code === saved)) return saved;

  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGUAGES.some((l) => l.code === browser) ? browser : "en";
}

let current = detect();
document.documentElement.lang = current;

async function ensureDictionary(code) {
  if (code !== "en" && !DICTIONARIES[code]) DICTIONARIES[code] = (await LOADERS[code]()).default;
}

/** Loads the saved language's dictionary: await it before the first render */
export const initLang = () => ensureDictionary(current).catch(() => {});

export async function setLang(code) {
  if (!LANGUAGES.some((l) => l.code === code) || code === current) return;

  try {
    await ensureDictionary(code);
  } catch {
    return; // couldn't load the chunk, so stay on the current language
  }

  current = code;
  document.documentElement.lang = code;

  setStored(STORAGE_KEY, code);

  listeners.forEach((listener) => listener());
}

export const getLang = () => current;

/** @param {string} key  @param {string} text English default  @param {Record<string, string|number>} [vars] */
export function t(key, text, vars) {
  const template = (current !== "en" && DICTIONARIES[current]?.[key]) || text;

  return vars ? template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? "")) : template;
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLang = () => {
  const lang = useSyncExternalStore(subscribe, getLang);

  return { lang, setLang };
};
