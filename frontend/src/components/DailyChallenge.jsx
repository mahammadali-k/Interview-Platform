import { Link } from "react-router";
import { CalendarDaysIcon, Loader2Icon, SparklesIcon, UsersIcon } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import useStartInterview from "../hooks/useStartInterview";
import { t } from "../lib/i18n";
import { PROBLEM_LIST } from "../data/problems";

const DAY_MS = 24 * 60 * 60 * 1000;

// Everyone gets the same problem all day and a new one at midnight (UTC). No backend needed
const problemOfTheDay = () => PROBLEM_LIST[Math.floor(Date.now() / DAY_MS) % PROBLEM_LIST.length];

function DailyChallenge() {
  const problem = problemOfTheDay();
  const { start, isStarting } = useStartInterview();

  return (
    <section className="panel lift relative flex flex-col overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mb-4 flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          <CalendarDaysIcon className="size-4" />
          {t("daily.title", "Problem of the day")}
        </p>
        <SparklesIcon className="size-4 text-warning" />
      </div>

      <h3 className="relative text-2xl font-semibold tracking-tight">{problem.title}</h3>
      <div className="relative mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span>{problem.category}</span>
      </div>
      <p className="relative mt-4 line-clamp-3 flex-1 text-sm text-base-content/70">{problem.description.text}</p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Link to={`/problem/${problem.id}`} className="btn btn-primary btn-sm">
          {t("daily.solve", "Solve now")}
        </Link>
        <button className="btn btn-outline btn-sm gap-2" disabled={isStarting} onClick={() => start(problem)}>
          {isStarting ? <Loader2Icon className="size-4 animate-spin" /> : <UsersIcon className="size-4" />}
          {t("daily.interview", "Interview with it")}
        </button>
      </div>
    </section>
  );
}

export default DailyChallenge;
