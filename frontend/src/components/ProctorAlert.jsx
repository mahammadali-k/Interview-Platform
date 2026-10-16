import { useEffect, useState } from "react";
import { ShieldAlertIcon } from "lucide-react";
import { t } from "../lib/i18n";
import { deviceLabel } from "../lib/devices";

/**
 * The alert people see when a prohibited device shows up. `deadline` is when the candidate gets
 * removed. The host can cancel (false alarm) or remove right away; the candidate just sees the notice.
 */
function ProctorAlert({ device, deadline, isHost, onCancel, onRemoveNow }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));

  const message = isHost
    ? t("proctor.hostText", "A {device} was detected on the candidate's camera. The candidate will be removed from the interview in {n}s.", { device: deviceLabel(device), n: seconds })
    : t("proctor.candText", "A {device} was detected on your camera. Using devices is not allowed in this interview and you will be removed in {n}s.", { device: deviceLabel(device), n: seconds });

  // Host: a slim banner, so the red box on the candidate's video stays visible underneath
  if (isHost) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="animate-pop absolute inset-x-3 top-3 z-30 flex flex-wrap items-center gap-3 rounded-lg border border-error/70 bg-black/80 p-3 text-white shadow-2xl backdrop-blur-sm"
      >
        <ShieldAlertIcon className="size-6 shrink-0 text-error" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-error">{t("proctor.title", "Prohibited device detected")}</p>
          <p className="text-sm text-white/85">{message}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-error font-mono text-lg font-bold text-error">
          {seconds}
        </span>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm text-white" onClick={onCancel}>
            {t("proctor.cancel", "False alarm, cancel")}
          </button>
          <button className="btn btn-error btn-sm" onClick={onRemoveNow}>
            {t("proctor.removeNow", "Remove now")}
          </button>
        </div>
      </div>
    );
  }

  // Candidate: a notice that covers the video until they're removed
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="animate-pop w-full max-w-md rounded-xl border border-error/60 bg-base-100 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl border border-error/40 bg-error/10 text-error">
          <ShieldAlertIcon className="size-7" />
        </div>

        <h3 className="text-xl font-semibold text-error">{t("proctor.title", "Prohibited device detected")}</h3>
        <p className="mt-2 text-base-content/80">{message}</p>
        <p className="mt-4 font-mono text-3xl font-bold text-error">{seconds}</p>
      </div>
    </div>
  );
}

export default ProctorAlert;
