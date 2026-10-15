import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { CopyIcon, Loader2Icon, MinusIcon, PlayIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";
import { LANGUAGE_CONFIG } from "../data/problems";
import { useTheme } from "../lib/theme";

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

  // the Monaco shortcut is registered once, so it reads the latest handler through a ref
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
    if (confirm("Reset the editor to the starter code? Your changes will be lost.")) onReset();
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
            label="Smaller text"
            onClick={() => setFontSize((size) => Math.max(MIN_FONT, size - 1))}
            disabled={fontSize <= MIN_FONT}
          >
            <MinusIcon className="size-4" />
          </IconButton>
          <span className="w-6 text-center font-mono text-xs text-base-content/60">{fontSize}</span>
          <IconButton
            label="Larger text"
            onClick={() => setFontSize((size) => Math.min(MAX_FONT, size + 1))}
            disabled={fontSize >= MAX_FONT}
          >
            <PlusIcon className="size-4" />
          </IconButton>

          <span className="mx-1 h-5 w-px bg-base-content/15" />

          <IconButton label="Copy code" onClick={() => copyText(code, "Code copied")}>
            <CopyIcon className="size-4" />
          </IconButton>
          {onReset && (
            <IconButton label="Reset to starter code" onClick={handleReset}>
              <RotateCcwIcon className="size-4" />
            </IconButton>
          )}

          <button
            className="btn btn-primary btn-sm ml-2 gap-2"
            disabled={isRunning}
            onClick={onRunCode}
            title="Run code (Ctrl/Cmd + Enter)"
          >
            {isRunning ? <Loader2Icon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
            {isRunning ? "Running..." : "Run Code"}
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
