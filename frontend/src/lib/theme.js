import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";
const THEMES = { dark: "executive", light: "executive-light" };
const listeners = new Set();

const getTheme = () =>
  document.documentElement.dataset.theme === THEMES.light ? "light" : "dark";

export function setTheme(theme) {
  document.documentElement.dataset.theme = THEMES[theme];

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable: the theme just won't persist
  }

  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** @returns {"dark" | "light"} */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme);
