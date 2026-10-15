import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { t } from "../lib/i18n";

const getOptions = () => [
  { value: "accepted", label: t("decision.accept", "Accept"), icon: CheckCircle2Icon, active: "border-success bg-success/10 text-success" },
  { value: "rejected", label: t("decision.reject", "Reject"), icon: XCircleIcon, active: "border-error bg-error/10 text-error" },
];

// Accept / Reject toggle shared by the "end interview" dialog and the result editor
function DecisionPicker({ value, onChange, suggested }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("decision.label", "Decision")}>
      {getOptions().map(({ value: option, label, icon: Icon, active }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
            value === option ? active : "hairline hover:bg-base-200"
          }`}
        >
          <Icon className="size-4" />
          {label}
          {suggested === option && (
            <span className="text-xs font-normal text-base-content/50">{t("decision.suggested", "(suggested)")}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default DecisionPicker;
