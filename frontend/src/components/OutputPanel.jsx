import { CopyIcon, EraserIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";
import { t } from "../lib/i18n";

function OutputPanel({ output, onClear }) {
  const text = output ? [output.output, output.error].filter(Boolean).join("\n") : "";

  return (
    <div className="flex h-full flex-col bg-base-100">
      <div className="flex items-center justify-between border-b hairline bg-base-200 px-4 py-1.5">
        <span className="eyebrow">{t("problem.output", "Output")}</span>

        {output && (
          <div className="flex items-center gap-1">
            {output.passed !== undefined && (
              <span className={`badge badge-outline badge-sm mr-1 ${output.passed ? "badge-success" : "badge-error"}`}>
                {output.passed ? t("end.testsPassed", "Tests passed") : t("output.failed", "Tests failed")}
              </span>
            )}
            <button className="btn btn-ghost btn-xs gap-1" onClick={() => copyText(text, t("output.copied", "Output copied"))} title={t("output.copy", "Copy output")}>
              <CopyIcon className="size-3.5" />
              {t("common.copy", "Copy")}
            </button>
            {onClear && (
              <button className="btn btn-ghost btn-xs gap-1" onClick={onClear} title={t("output.clear", "Clear output")}>
                <EraserIcon className="size-3.5" />
                {t("common.clear", "Clear")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output === null ? (
          <p className="text-base-content/50">{t("output.empty", "Click \"Run Code\" (or Ctrl/Cmd + Enter) to see the output here...")}</p>
        ) : output.success ? (
          <pre className="whitespace-pre-wrap text-success">{output.output}</pre>
        ) : (
          <>
            {output.output && <pre className="mb-2 whitespace-pre-wrap">{output.output}</pre>}
            <pre className="whitespace-pre-wrap text-error">{output.error}</pre>
          </>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
