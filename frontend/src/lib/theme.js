import { useSyncExternalStore } from "react";
import { setStored } from "./storage";

const STORAGE_KEY = "theme";
const THEMES = { dark: "executive", light: "executive-light" };
const listeners = new Set();

const getTheme = () =>
  document.documentElement.dataset.theme === THEMES.light ? "light" : "dark";

export function setTheme(theme) {
  document.documentElement.dataset.theme = THEMES[theme];

  setStored(STORAGE_KEY, theme);

  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** @returns {"dark" | "light"} */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme);
