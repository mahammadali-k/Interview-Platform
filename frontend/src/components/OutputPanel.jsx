import { CopyIcon, EraserIcon } from "lucide-react";
import { copyText } from "../lib/clipboard";

function OutputPanel({ output, onClear }) {
  const text = output ? [output.output, output.error].filter(Boolean).join("\n") : "";

  return (
    <div className="flex h-full flex-col bg-base-100">
      <div className="flex items-center justify-between border-b hairline bg-base-200 px-4 py-1.5">
        <span className="eyebrow">Output</span>

        {output && (
          <div className="flex items-center gap-1">
            {output.passed !== undefined && (
              <span className={`badge badge-outline badge-sm mr-1 ${output.passed ? "badge-success" : "badge-error"}`}>
                {output.passed ? "Tests passed" : "Tests failed"}
              </span>
            )}
            <button className="btn btn-ghost btn-xs gap-1" onClick={() => copyText(text, "Output copied")} title="Copy output">
              <CopyIcon className="size-3.5" />
              Copy
            </button>
            {onClear && (
              <button className="btn btn-ghost btn-xs gap-1" onClick={onClear} title="Clear output">
                <EraserIcon className="size-3.5" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output === null ? (
          <p className="text-base-content/50">Click &quot;Run Code&quot; (or Ctrl/Cmd + Enter) to see the output here...</p>
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
