import { useEffect, useState } from "react";
import { HourglassIcon, TimerIcon } from "lucide-react";
import { t } from "../lib/i18n";

const pad = (n) => String(n).padStart(2, "0");

const format = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours > 0 ? `${hours}:` : ""}${pad(minutes)}:${pad(totalSeconds % 60)}`;
};

// Lives in its own component so the one-second tick doesn't re-render the whole session page
function ElapsedTimer({ since, limitMinutes = 0 }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));

  if (!limitMinutes) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-sm tabular-nums" title={t("timer.elapsed", "Elapsed time")}>
        <TimerIcon className="size-4 text-base-content/50" />
        {format(elapsed)}
      </span>
    );
  }

  // Countdown mode: turns yellow in the last 5 minutes, then red and counting up once time's over
  const remaining = limitMinutes * 60 - elapsed;
  const over = remaining < 0;
  const tone = over ? "text-error" : remaining <= 300 ? "text-warning" : "";

  return (
    <span
      className={`flex items-center gap-1.5 font-mono text-sm tabular-nums ${tone}`}
      title={t("timer.limit", "Time limit: {n} minutes", { n: limitMinutes })}
    >
      <HourglassIcon className="size-4" />
      {over
        ? t("timer.over", "+{time} over", { time: format(-remaining) })
        : t("timer.left", "{time} left", { time: format(remaining) })}
    </span>
  );
}

export default ElapsedTimer;
