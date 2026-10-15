import { MoonIcon, SunIcon } from "lucide-react";
import { setTheme, useTheme } from "../lib/theme";

function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-square"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}

export default ThemeToggle;
