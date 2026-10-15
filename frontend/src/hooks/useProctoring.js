import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useManageSession } from "./useSessions";
import { t } from "../lib/i18n";

const GRACE_MS = 3000; // how long the alert is shown before the candidate is removed
const COOLDOWN_MS = 30000; // after "false alarm" the host is not alerted again for a while

/**
 * Device detection for a live interview.
 *
 * Host: the overlay analyses the candidate's camera and calls `handleViolation`; the host can also
 *       `report` a device by hand (earphones, anything the model can not see). An alert is shown to
 *       both sides and, after a short countdown, the candidate is removed (the host can cancel a
 *       false alarm). Alerts travel over the session's chat channel.
 * Candidate: only shows the alert and leaves when the countdown ends.
 */
function useProctoring({ channel, userId, isHost, sessionId }) {
  const navigate = useNavigate();
  const { removeCandidate } = useManageSession();
  const [alert, setAlert] = useState(null); // { device, score, deadline }
  const cooldownUntil = useRef(0);

  const handleViolation = useCallback(({ device, score }) => {
    if (Date.now() < cooldownUntil.current) return;

    setAlert((current) => current ?? { device, score, deadline: Date.now() + GRACE_MS });
  }, []);

  const removeNow = useCallback(() => {
    if (!alert) return;

    removeCandidate.mutate(
      { id: sessionId, reason: "prohibited_device", device: alert.device, score: alert.score },
      { onSuccess: () => toast.error(t("proctor.removed", "The candidate was removed: prohibited device detected")) }
    );
    cooldownUntil.current = Date.now() + COOLDOWN_MS;
    setAlert(null);
  }, [alert, removeCandidate, sessionId]);

  const cancel = useCallback(() => {
    channel?.sendEvent({ type: "proctor.cancel" }).catch(() => {});
    cooldownUntil.current = Date.now() + COOLDOWN_MS;
    setAlert(null);
  }, [channel]);

  // host: tell the candidate, then remove them when the countdown ends
  useEffect(() => {
    if (!isHost || !alert) return;

    channel
      ?.sendEvent({ type: "proctor.violation", device: alert.device, deadline: alert.deadline })
      .catch(() => {});

    const timer = setTimeout(removeNow, Math.max(0, alert.deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [isHost, alert, channel, removeNow]);

  // candidate: show what the host's browser reported
  useEffect(() => {
    if (isHost || !channel) return;

    const subscription = channel.on((event) => {
      if (event.user?.id === userId) return;

      if (event.type === "proctor.violation") {
        setAlert({ device: event.device, deadline: event.deadline });
      } else if (event.type === "proctor.cancel") {
        setAlert(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isHost, channel, userId]);

  // candidate: leave the room when the countdown is over (the server removes them as well)
  useEffect(() => {
    if (isHost || !alert) return;

    const timer = setTimeout(() => navigate("/dashboard", { replace: true }), Math.max(0, alert.deadline - Date.now()) + 800);
    return () => clearTimeout(timer);
  }, [isHost, alert, navigate]);

  // the host spots something the model can not: earphones, a second screen...
  const report = useCallback((device) => handleViolation({ device, score: 1 }), [handleViolation]);

  return { alert, cancel, removeNow, report, handleViolation };
}

export default useProctoring;
