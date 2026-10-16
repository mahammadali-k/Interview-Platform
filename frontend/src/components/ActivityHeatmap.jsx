import { useMemo } from "react";
import { addDays, format, startOfDay, startOfWeek, subWeeks } from "date-fns";
import { dateLocale } from "../lib/dateLocale";
import { t } from "../lib/i18n";

const WEEKS = 17;
const SHADES = [
  "bg-base-content/10",
  "bg-primary/30",
  "bg-primary/55",
  "bg-primary/80",
  "bg-primary",
];

// Like GitHub's contribution graph: one square per day, and the more interviews, the darker it gets
function ActivityHeatmap({ dates }) {
  const { weeks, total } = useMemo(() => {
    const counts = new Map();
    dates.forEach((date) => {
      const key = format(new Date(date), "yyyy-MM-dd");
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const start = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), WEEKS - 1);
    const today = startOfDay(new Date());
    let sum = 0;

    const columns = Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = addDays(start, w * 7 + d);
        const key = format(day, "yyyy-MM-dd");
        const count = counts.get(key) || 0;

        if (day <= today) sum += count;
        return { key, label: format(day, "d MMM yyyy", { locale: dateLocale() }), count, future: day > today };
      })
    );

    return { weeks: columns, total: sum };
  }, [dates]);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1" role="img" aria-label={t("heat.summary", "{n} interviews in the last {weeks} weeks", { n: total, weeks: WEEKS })}>
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((day, d) => (
              <div
                key={day.key}
                title={t("heat.day", "{date}: {n}", { date: day.label, n: day.count })}
                style={{ animationDelay: `${(w * 7 + d) * 4}ms` }}
                className={`animate-pop size-3.5 rounded-[4px] ${
                  day.future ? "opacity-0" : SHADES[Math.min(day.count, SHADES.length - 1)]
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-base-content/50">
        <span>
          {t("heat.summary", "{n} interviews in the last {weeks} weeks", { n: total, weeks: WEEKS })}
        </span>
        <span className="flex items-center gap-1">
          {t("heat.less", "Less")}
          {SHADES.map((shade) => (
            <span key={shade} className={`size-3 rounded-[3px] ${shade}`} />
          ))}
          {t("heat.more", "More")}
        </span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
