import { CrownIcon, UserIcon } from "lucide-react";
import IconTile from "./IconTile";

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
          {isYou && <span className="ml-1.5 text-xs font-normal text-base-content/50">(you)</span>}
        </p>
      </div>

      <span className={`badge badge-outline badge-sm shrink-0 ${TONES[tone]}`}>{status}</span>
    </div>
  );
}

// who is in the room and where the interview stands, derived from the polled session
function SessionStatusBar({ session, userId }) {
  const { host, participant, status, quizSubmittedAt } = session;
  const completed = status === "completed";

  const candidateStatus = completed
    ? { label: "Finished", tone: "neutral" }
    : !participant
      ? { label: "Waiting", tone: "warning" }
      : quizSubmittedAt
        ? { label: "Quiz submitted", tone: "info" }
        : { label: "In interview", tone: "success" };

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <Person
        icon={CrownIcon}
        role="Interviewer"
        name={host?.name || "Loading..."}
        isYou={host?.clerkId === userId}
        status={completed ? "Finished" : "Host"}
        tone={completed ? "neutral" : "success"}
      />

      <Person
        icon={UserIcon}
        role="Candidate"
        name={participant?.name || "Waiting for candidate..."}
        isYou={participant?.clerkId === userId}
        status={candidateStatus.label}
        tone={candidateStatus.tone}
        muted={!participant}
      />
    </div>
  );
}

export default SessionStatusBar;
