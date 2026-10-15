import { Loader2Icon, UsersIcon } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import useStartInterview from "../hooks/useStartInterview";
import { t } from "../lib/i18n";
import ProblemDetails from "./ProblemDetails";

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  const { start, isStarting } = useStartInterview();

  return (
    <div className="h-full overflow-y-auto bg-base-200">
      <header className="border-b hairline bg-base-100 p-5">
        <p className="eyebrow mb-2">{problem.category}</p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <select
          className="select select-sm mt-4 w-full"
          value={currentProblemId}
          onChange={(e) => onProblemChange(e.target.value)}
        >
          {allProblems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} - {p.difficulty}
            </option>
          ))}
        </select>

        <button
          className="btn btn-outline btn-sm mt-3 w-full gap-2"
          disabled={isStarting}
          onClick={() => start(problem)}
        >
          {isStarting ? <Loader2Icon className="size-4 animate-spin" /> : <UsersIcon className="size-4" />}
          {t("prob.startTitle", "Start a live interview with this problem")}
        </button>
      </header>

      <ProblemDetails problem={problem} />
    </div>
  );
}

export default ProblemDescription;
