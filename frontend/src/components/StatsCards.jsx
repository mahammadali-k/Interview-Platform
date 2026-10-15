import { CheckCircle2Icon, HistoryIcon, RadioIcon } from "lucide-react";
import StatTile from "./StatTile";

function StatsCards({ activeSessionsCount, recentSessionsCount, acceptedCount }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:col-span-1">
      <StatTile label="Active sessions" value={activeSessionsCount} icon={RadioIcon} live className="animate-rise" />
      <StatTile
        label="Finished interviews"
        value={recentSessionsCount}
        icon={HistoryIcon}
        className="animate-rise stagger [--i:1]"
      />
      <StatTile
        label="Accepted"
        value={acceptedCount}
        tone="success"
        icon={CheckCircle2Icon}
        hint={recentSessionsCount ? `${Math.round((acceptedCount / recentSessionsCount) * 100)}% of finished` : undefined}
        className="animate-rise stagger [--i:2]"
      />
    </div>
  );
}

export default StatsCards;
