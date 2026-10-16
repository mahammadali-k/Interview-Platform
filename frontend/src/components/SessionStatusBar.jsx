import { CrownIcon, UserIcon } from "lucide-react";
import IconTile from "./IconTile";
import { t } from "../lib/i18n";

const TONES = {
  success: "badge-success",
  warning: "badge-warning",
  info: "badge-info",
  neutral: "badge-neutral",
};

function Person({ icon: Icon, role, name, isYou, status, tone, muted }) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={Icon} tone={muted ? "muted" : "primary"} size="sm" />

      <div className="min-w-0">
        <p className="eyebrow">{role}</p>
        <p className={`truncate text-sm font-medium ${muted ? "text-base-content/50" : ""}`}>
          {name}
          {isYou && <span className="ml-1.5 text-xs font-normal text-base-content/50">{t("session.you", "(you)")}</span>}
        </p>
      </div>

      <span className={`badge badge-outline badge-sm shrink-0 ${TONES[tone]}`}>{status}</span>
    </div>
  );
}

// Who's in the room and how the interview is going, worked out from the polled session
function SessionStatusBar({ session, userId }) {
  const { host, participant, status, quizSubmittedAt } = session;
  const completed = status === "completed";

  const candidateStatus = completed
    ? { label: t("status.finished", "Finished"), tone: "neutral" }
    : !participant
      ? { label: t("status.waiting", "Waiting"), tone: "warning" }
      : quizSubmittedAt
        ? { label: t("status.quizSubmitted", "Quiz submitted"), tone: "info" }
        : { label: t("status.inInterview", "In interview"), tone: "success" };

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <Person
        icon={CrownIcon}
        role={t("session.interviewer", "Interviewer")}
        name={host?.name || t("common.loadingDots", "Loading...")}
        isYou={host?.clerkId === userId}
        status={completed ? t("status.finished", "Finished") : t("status.host", "Host")}
        tone={completed ? "neutral" : "success"}
      />

      <Person
        icon={UserIcon}
        role={t("session.candidate", "Candidate")}
        name={participant?.name || t("session.waitingDots", "Waiting for candidate...")}
        isYou={participant?.clerkId === userId}
        status={candidateStatus.label}
        tone={candidateStatus.tone}
        muted={!participant}
      />
    </div>
  );
}

export default SessionStatusBar;
