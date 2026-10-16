import useCountUp from "../hooks/useCountUp";

const TONES = {
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  primary: "text-primary",
};

/** One number with a label. The dashboard, history and result pages all use it */
function StatTile({ label, value, hint, tone, icon: Icon, live = false, className = "" }) {
  // numbers count up from zero; text values (like "12m 3s") are shown as they are
  const counted = useCountUp(typeof value === "number" ? value : 0);
  const shown = typeof value === "number" ? counted : value;

  return (
    <div className={`panel lift p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <p className="eyebrow">{label}</p>

        {live ? (
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success" />
          </span>
        ) : (
          Icon && <Icon className="size-4 text-base-content/40" />
        )}
      </div>

      <p className={`mt-3 font-mono text-3xl font-semibold tabular-nums ${TONES[tone] || ""}`}>{shown}</p>
      {hint && <p className="mt-1 text-sm text-base-content/60">{hint}</p>}
    </div>
  );
}

export default StatTile;
