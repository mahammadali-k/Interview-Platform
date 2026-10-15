import { ClockIcon, Code2Icon, TrophyIcon, UsersIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
import DifficultyBadge from "./DifficultyBadge";
import EmptyState from "./EmptyState";
import IconTile from "./IconTile";

function RecentCard({ session, index }) {
  const isActive = session.status === "active";

  return (
    <Link
      to={isActive ? `/session/${session._id}` : `/session/${session._id}/result`}
      className={`lift animate-rise stagger block rounded-lg border bg-base-200 p-5 ${
        isActive ? "border-success/40" : "hairline"
      }`}
      style={{ "--i": index }}
    >
      <div className="mb-4 flex items-start gap-3">
        <IconTile icon={Code2Icon} tone={isActive ? "primary" : "muted"} />

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate font-semibold">{session.problem}</h3>
          <DifficultyBadge difficulty={session.difficulty} />
        </div>

        {isActive && <span className="badge badge-success badge-outline badge-sm">ACTIVE</span>}
      </div>

      <div className="mb-4 space-y-2 text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4" />
          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4" />
          {session.participant ? "2 participants" : "1 participant"}
        </div>
      </div>

      <div className="flex items-center justify-between border-t hairline pt-3">
        <span className="eyebrow">{isActive ? "In progress" : "View feedback"}</span>
        <span className="text-xs text-base-content/40">
          {new Date(session.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

function RecentSessions({ sessions, isLoading }) {
  return (
    <section className="panel animate-rise stagger mt-6 p-6" style={{ "--i": 2 }}>
      <h2 className="mb-6 text-lg font-semibold">Your Past Sessions</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-[172px] w-full" />
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, idx) => (
            <RecentCard key={session._id} session={session} index={idx} />
          ))}
        </div>
      ) : (
        <EmptyState icon={TrophyIcon} title="No sessions yet" hint="Start your first session today." />
      )}
    </section>
  );
}

export default RecentSessions;
