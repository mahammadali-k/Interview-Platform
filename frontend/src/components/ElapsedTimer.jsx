import { useEffect, useState } from "react";
import { HourglassIcon, TimerIcon } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

const format = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours > 0 ? `${hours}:` : ""}${pad(minutes)}:${pad(totalSeconds % 60)}`;
};

// isolated so the one-second tick never re-renders the whole session page
function ElapsedTimer({ since, limitMinutes = 0 }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));

  if (!limitMinutes) {
    return (
      <span className="flex items-center gap-1.5 font-mono text-sm tabular-nums" title="Elapsed time">
        <TimerIcon className="size-4 text-base-content/50" />
        {format(elapsed)}
      </span>
    );
  }

  // countdown: warns in the last five minutes and counts up in red once the limit is passed
  const remaining = limitMinutes * 60 - elapsed;
  const over = remaining < 0;
  const tone = over ? "text-error" : remaining <= 300 ? "text-warning" : "";

  return (
    <span
      className={`flex items-center gap-1.5 font-mono text-sm tabular-nums ${tone}`}
      title={`Time limit: ${limitMinutes} minutes`}
    >
      <HourglassIcon className="size-4" />
      {over ? `+${format(-remaining)} over` : `${format(remaining)} left`}
    </span>
  );
}

export default ElapsedTimer;
