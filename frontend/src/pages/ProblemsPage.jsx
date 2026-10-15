import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronRightIcon, Loader2Icon, SearchIcon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import DifficultyBadge from "../components/DifficultyBadge";
import useStartInterview from "../hooks/useStartInterview";
import { PROBLEM_LIST } from "../data/problems";

const FILTERS = ["All", "Easy", "Medium", "Hard"];

const countBy = (difficulty) => PROBLEM_LIST.filter((p) => p.difficulty === difficulty).length;

function ProblemsPage() {
  const [difficulty, setDifficulty] = useState("All");
  const [query, setQuery] = useState("");
  const { start, isStarting } = useStartInterview();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return PROBLEM_LIST.filter(
      (p) =>
        (difficulty === "All" || p.difficulty === difficulty) &&
        (!needle || `${p.title} ${p.category}`.toLowerCase().includes(needle))
    );
  }, [difficulty, query]);

  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          eyebrow="Practice"
          title="Practice Problems"
          description="Sharpen your coding skills, or start a live interview with any of these problems."
        />

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Total" value={PROBLEM_LIST.length} />
          <StatTile label="Easy" value={countBy("Easy")} tone="success" />
          <StatTile label="Medium" value={countBy("Medium")} tone="warning" />
          <StatTile label="Hard" value={countBy("Hard")} tone="error" />
        </div>

        <div className="panel mb-4 flex flex-wrap items-center gap-3 p-3">
          <label className="input input-bordered flex min-w-60 flex-1 items-center gap-2">
            <SearchIcon className="size-4 text-base-content/50" />
            <input
              type="search"
              placeholder="Search problems"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="flex gap-1">
            {FILTERS.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`btn btn-sm ${difficulty === level ? "btn-primary" : "btn-ghost"}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="panel divide-y divide-base-content/10">
          {visible.length === 0 && (
            <p className="p-8 text-center text-sm text-base-content/60">No problems match your filters.</p>
          )}

          {visible.map((problem, idx) => (
            <div
              key={problem.id}
              className="group animate-rise stagger flex items-center gap-3 pr-5 transition-colors hover:bg-base-200"
              style={{ "--i": idx }}
            >
              <Link to={`/problem/${problem.id}`} className="flex flex-1 items-center gap-5 p-5">
                <span className="w-8 font-mono text-sm text-base-content/40">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{problem.title}</h2>
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span className="text-sm text-base-content/50">{problem.category}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-base-content/70">{problem.description.text}</p>
                </div>

                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  Solve
                  <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <button
                className="btn btn-outline btn-sm gap-2"
                disabled={isStarting}
                onClick={() => start(problem)}
                title="Start a live interview with this problem"
              >
                {isStarting ? <Loader2Icon className="size-4 animate-spin" /> : <UsersIcon className="size-4" />}
                Interview
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ProblemsPage;
