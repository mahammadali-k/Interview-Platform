import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpenIcon,
  CornerDownLeftIcon,
  HistoryIcon,
  HouseIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { PROBLEM_LIST } from "../data/problems";
import { setTheme, useTheme } from "../lib/theme";
import { getLang, t } from "../lib/i18n";

// Ctrl/Cmd + K: jump anywhere without reaching for the mouse
function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // t() reads the current language, which is why the language is a dependency here (otherwise the list keeps the old words)
  const lang = getLang();
  const commands = useMemo(
    () => [
      { id: "new", label: t("palette.create", "Create a session"), hint: t("nav.dashboard", "Dashboard"), icon: PlusIcon, run: () => navigate("/dashboard?new=1") },
      { id: "home", label: t("nav.home", "Home"), hint: t("palette.page", "Page"), icon: HouseIcon, run: () => navigate("/") },
      { id: "dashboard", label: t("nav.dashboard", "Dashboard"), hint: t("palette.page", "Page"), icon: LayoutDashboardIcon, run: () => navigate("/dashboard") },
      { id: "history", label: t("palette.history", "Interview history"), hint: t("palette.page", "Page"), icon: HistoryIcon, run: () => navigate("/history") },
      { id: "questions", label: t("palette.questions", "Question bank"), hint: t("palette.page", "Page"), icon: ListChecksIcon, run: () => navigate("/questions") },
      { id: "problems", label: t("palette.problems", "Practice problems"), hint: t("palette.page", "Page"), icon: BookOpenIcon, run: () => navigate("/problems") },
      {
        id: "theme",
        label: theme === "dark" ? t("theme.toLight", "Switch to light theme") : t("theme.toDark", "Switch to dark theme"),
        hint: t("palette.appearance", "Appearance"),
        icon: theme === "dark" ? SunIcon : MoonIcon,
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      ...PROBLEM_LIST.map((problem) => ({
        id: `problem-${problem.id}`,
        label: problem.title,
        hint: t("palette.problem", "Problem · {difficulty}", { difficulty: t(`difficulty.${problem.difficulty.toLowerCase()}`, problem.difficulty) }),
        icon: BookOpenIcon,
        run: () => navigate(`/problem/${problem.id}`),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, theme, lang]
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(needle)) : commands;
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const run = (command) => {
    onClose();
    command?.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[15vh]" role="dialog" aria-modal="true" aria-label={t("palette.title", "Command palette")}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="panel animate-pop relative w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 border-b hairline px-4">
          <SearchIcon className="size-4 text-base-content/50" />
          <input
            ref={inputRef}
            className="h-12 flex-1 bg-transparent outline-none placeholder:text-base-content/40"
            placeholder={t("palette.placeholder", "Search pages, problems and actions...")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd className="kbd kbd-sm">esc</kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-base-content/50">
              {t("palette.empty", "Nothing matches \"{query}\"", { query })}
            </li>
          )}

          {results.map((command, idx) => (
            <li key={command.id} role="option" aria-selected={idx === active}>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  idx === active ? "bg-primary/15" : "hover:bg-base-200"
                }`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => run(command)}
              >
                <command.icon className="size-4 shrink-0 text-base-content/60" />
                <span className="flex-1">{command.label}</span>
                <span className="text-xs text-base-content/40">{command.hint}</span>
                {idx === active && <CornerDownLeftIcon className="size-3.5 text-base-content/40" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
