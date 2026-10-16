import { CaptionsIcon, CaptionsOffIcon, InfoIcon } from "lucide-react";
import { LANGUAGES, t } from "../lib/i18n";
import { isSpeechRecognitionSupported } from "../hooks/useSpeechRecognition";

// The live translation switch, plus a picker for the language you speak
function CaptionsControl({ enabled, onToggle, spokenLang, onSpokenLangChange }) {
  const Icon = enabled ? CaptionsIcon : CaptionsOffIcon;

  return (
    <div className="flex items-center gap-1.5">
      <button
        className={`btn btn-sm gap-2 ${enabled ? "btn-primary" : "btn-ghost"}`}
        onClick={onToggle}
        aria-pressed={enabled}
        title={t("cc.title", "Live translation of speech into your language")}
      >
        <Icon className="size-4" />
        <span className="hidden xl:inline">{t("cc.toggle", "Live translation")}</span>
      </button>

      {enabled && (
        <label className="flex items-center gap-1 text-xs text-base-content/60">
          <span className="hidden md:inline">{t("cc.speak", "I speak")}</span>
          <select
            className="select select-xs"
            value={spokenLang}
            onChange={(e) => onSpokenLangChange(e.target.value)}
            aria-label={t("cc.speak", "I speak")}
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {enabled && !isSpeechRecognitionSupported && (
        <span
          className="tooltip tooltip-bottom text-warning"
          data-tip={t("cc.unsupported", "Speech recognition is not available in this browser (use Chrome, Edge or Safari). You will still see the other person's translated speech.")}
        >
          <InfoIcon className="size-4" />
        </span>
      )}
    </div>
  );
}

export default CaptionsControl;
