import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { CopyIcon, Loader2Icon, MinusIcon, PlayIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";
import { LANGUAGE_CONFIG } from "../data/problems";
import { useTheme } from "../lib/theme";
import { t } from "../lib/i18n";

const MIN_FONT = 12;
const MAX_FONT = 24;

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onReset,
}) {
  const language = LANGUAGE_CONFIG[selectedLanguage];
  const theme = useTheme();
  const [fontSize, setFontSize] = useState(15);

  // Monaco registers the shortcut only once, so read the latest handler through a ref (a plain closure would go stale)
  const runRef = useRef({ run: onRunCode, isRunning });
  useEffect(() => {
    runRef.current = { run: onRunCode, isRunning };
  });

  const handleMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!runRef.current.isRunning) runRef.current.run();
    });
  };

  const handleReset = () => {
    if (confirm(t("editor.resetConfirm", "Reset the editor to the starter code? Your changes will be lost."))) onReset();
  };

  return (
    <div className="flex h-full flex-col bg-base-300">
      <div className="flex items-center justify-between gap-2 border-b hairline bg-base-100 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <img src={language.icon} alt={language.name} className="size-6" />
          <select className="select select-sm" value={selectedLanguage} onChange={onLanguageChange}>
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            label={t("editor.smaller", "Smaller text")}
            onClick={() => setFontSize((size) => Math.max(MIN_FONT, size - 1))}
            disabled={fontSize <= MIN_FONT}
          >
            <MinusIcon className="size-4" />
          </IconButton>
          <span className="w-6 text-center font-mono text-xs text-base-content/60">{fontSize}</span>
          <IconButton
            label={t("editor.larger", "Larger text")}
            onClick={() => setFontSize((size) => Math.min(MAX_FONT, size + 1))}
            disabled={fontSize >= MAX_FONT}
          >
            <PlusIcon className="size-4" />
          </IconButton>

          <span className="mx-1 h-5 w-px bg-base-content/15" />

          <IconButton label={t("editor.copy", "Copy code")} onClick={() => copyText(code, t("editor.copied", "Code copied"))}>
            <CopyIcon className="size-4" />
          </IconButton>
          {onReset && (
            <IconButton label={t("editor.reset", "Reset to starter code")} onClick={handleReset}>
              <RotateCcwIcon className="size-4" />
            </IconButton>
          )}

          <button
            className="btn btn-primary btn-sm ml-2 gap-2"
            disabled={isRunning}
            onClick={onRunCode}
            title={t("editor.runHint", "Run code (Ctrl/Cmd + Enter)")}
          >
            {isRunning ? <Loader2Icon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
            {isRunning ? t("editor.running", "Running...") : t("editor.run", "Run Code")}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={language.monacoLang}
          value={code}
          onChange={onCodeChange}
          onMount={handleMount}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            fontSize,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
