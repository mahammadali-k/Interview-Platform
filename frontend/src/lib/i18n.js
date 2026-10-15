import { useSyncExternalStore } from "react";
import az from "../locales/az";
import ru from "../locales/ru";

/**
 * Tiny i18n layer: English text lives next to the code as the default,
 * `t("area.key", "English text", { vars })` looks the key up in the selected language and falls
 * back to the English text. `useLang()` is called once in <App/>, so the whole tree re-renders
 * when the language changes and every component can simply import `t`.
 */

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "az", label: "Azərbaycanca", short: "AZ" },
  { code: "ru", label: "Русский", short: "RU" },
];

const DICTIONARIES = { az, ru };
const STORAGE_KEY = "lang";
const listeners = new Set();

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    // storage unavailable: fall through to the browser language
  }

  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGUAGES.some((l) => l.code === browser) ? browser : "en";
}

let current = detect();
document.documentElement.lang = current;

export function setLang(code) {
  if (!LANGUAGES.some((l) => l.code === code) || code === current) return;

  current = code;
  document.documentElement.lang = code;

  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // storage unavailable: the choice just won't persist
  }

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
