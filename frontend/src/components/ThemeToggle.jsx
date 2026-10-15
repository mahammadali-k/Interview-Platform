import { MoonIcon, SunIcon } from "lucide-react";
import { setTheme, useTheme } from "../lib/theme";
import { t } from "../lib/i18n";

function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? t("theme.toLight", "Switch to light theme") : t("theme.toDark", "Switch to dark theme");

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-square"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}

export default ThemeToggle;
