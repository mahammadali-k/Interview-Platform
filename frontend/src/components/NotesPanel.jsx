import { CheckIcon, CloudOffIcon, Loader2Icon, NotebookPenIcon } from "lucide-react";
import { t } from "../lib/i18n";

const getStatus = () => ({
  idle: null,
  saving: { icon: Loader2Icon, text: t("notes.saving", "Saving..."), className: "text-base-content/60", spin: true },
  saved: { icon: CheckIcon, text: t("notes.saved", "Saved"), className: "text-success" },
  error: { icon: CloudOffIcon, text: t("notes.error", "Could not save"), className: "text-error" },
});

// the interviewer's private scratchpad, autosaved to the server
function NotesPanel({ value, status, onChange }) {
  const state = getStatus()[status];

  return (
    <div className="space-y-3 p-5">
      <div className="panel flex items-start gap-3 p-4">
        <NotebookPenIcon className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-base-content/70">
          {t("notes.hint", "Private to you and saved automatically. When you end the interview these notes are offered as the candidate's feedback.")}
        </p>
        {state && (
          <span className={`flex shrink-0 items-center gap-1.5 text-xs ${state.className}`}>
            <state.icon className={`size-3.5 ${state.spin ? "animate-spin" : ""}`} />
            {state.text}
          </span>
        )}
      </div>

      <textarea
        className="textarea textarea-bordered h-[55vh] w-full font-mono text-sm"
        placeholder={t("notes.placeholder", "Observations, follow-up questions, red flags...")}
        maxLength={5000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default NotesPanel;
