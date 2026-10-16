import { Loader2Icon } from "lucide-react";
import { t } from "../lib/i18n";

// The one loading spinner for pages, panels and suspense fallbacks
function Spinner({ size = "size-8", label, fullScreen = false, className = "" }) {
  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`} role="status">
      <Loader2Icon className={`${size} animate-spin text-primary`} />
      {label ? <p>{label}</p> : <span className="sr-only">{t("common.loading", "Loading")}</span>}
    </div>
  );

  return fullScreen ? <div className="grid h-screen place-items-center bg-base-200">{spinner}</div> : spinner;
}

export default Spinner;
