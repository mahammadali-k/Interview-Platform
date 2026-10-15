import { CheckCircle2Icon, HistoryIcon, RadioIcon } from "lucide-react";
import StatTile from "./StatTile";
import { t } from "../lib/i18n";

function StatsCards({ activeSessionsCount, recentSessionsCount, acceptedCount }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:col-span-1">
      <StatTile label={t("dash.stat.active", "Active sessions")} value={activeSessionsCount} icon={RadioIcon} live className="animate-rise" />
      <StatTile
        label={t("dash.stat.finished", "Finished interviews")}
        value={recentSessionsCount}
        icon={HistoryIcon}
        className="animate-rise stagger [--i:1]"
      />
      <StatTile
        label={t("hub.stat.accepted", "Accepted")}
        value={acceptedCount}
        tone="success"
        icon={CheckCircle2Icon}
        hint={
          recentSessionsCount
            ? t("hub.stat.ofFinished", "{n}% of finished", { n: Math.round((acceptedCount / recentSessionsCount) * 100) })
            : undefined
        }
        className="animate-rise stagger [--i:2]"
      />
    </div>
  );
}

export default StatsCards;
