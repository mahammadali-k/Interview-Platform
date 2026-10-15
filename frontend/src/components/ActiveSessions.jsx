import { ArrowRightIcon, Code2Icon, CrownIcon, RadioIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import DifficultyBadge from "./DifficultyBadge";
import EmptyState from "./EmptyState";
import CopyInviteButton from "./CopyInviteButton";
import IconTile from "./IconTile";

function SessionRow({ session, isUserInSession, isHostOf, onEdit, index }) {
  const isMember = isUserInSession(session);
  const isHost = isHostOf(session);
  const isFull = session.participant && !isMember;

  return (
    <div
      className="lift animate-rise stagger flex items-center justify-between gap-4 rounded-lg border hairline bg-base-200 p-4"
      style={{ "--i": index }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <IconTile icon={Code2Icon} />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <h3 className="truncate font-semibold">{session.problem}</h3>
            <DifficultyBadge difficulty={session.difficulty} />
          </div>

          <div className="flex items-center gap-4 text-sm text-base-content/70">
            <span className="flex items-center gap-1.5">
              <CrownIcon className="size-4" />
              {session.host?.name}
            </span>
            <span className="flex items-center gap-1.5">
              <UserIcon className="size-4" />
              {session.participant ? session.participant.name : "Waiting for candidate"}
            </span>
            <span className={`badge badge-sm badge-outline ${isFull ? "badge-error" : "badge-success"}`}>
              {isFull ? "FULL" : "OPEN"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isHost && (
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => onEdit(session)}
            aria-label="Edit session"
            title="Edit session"
          >
            <SettingsIcon className="size-4" />
          </button>
        )}

        {!isFull && (
          <CopyInviteButton sessionId={session._id} label="" className="btn btn-ghost btn-sm btn-square" />
        )}

        {isFull ? (
          <button className="btn btn-disabled btn-sm">Full</button>
        ) : (
          <Link to={`/session/${session._id}`} className="btn btn-primary btn-sm gap-2">
            {isMember ? "Rejoin" : "Join"}
            <ArrowRightIcon className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function ActiveSessions({ sessions, isLoading, isUserInSession, isHostOf, onEdit }) {
  return (
    <section className="panel animate-rise stagger h-full p-6 lg:col-span-2" style={{ "--i": 1 }}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Sessions</h2>
        <span className="flex items-center gap-2 text-sm text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {sessions.length} active
        </span>
      </div>

      <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-[78px] w-full" />)
        ) : sessions.length > 0 ? (
          sessions.map((session, idx) => (
            <SessionRow
              key={session._id}
              session={session}
              isUserInSession={isUserInSession}
              isHostOf={isHostOf}
              onEdit={onEdit}
              index={idx}
            />
          ))
        ) : (
          <EmptyState icon={RadioIcon} title="No active sessions" hint="Be the first to create one." />
        )}
      </div>
    </section>
  );
}

export default ActiveSessions;
