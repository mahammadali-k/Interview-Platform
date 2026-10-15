import { useMemo, useState } from "react";
import { Link } from "react-router";
import { format, startOfWeek, subWeeks } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  HistoryIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import BarChart from "../components/BarChart";
import DifficultyBadge from "../components/DifficultyBadge";
import EmptyState from "../components/EmptyState";
import { useHistory } from "../hooks/useSessions";
import { formatDuration } from "../lib/utils";
import { downloadCsv } from "../lib/csv";

const PAGE_SIZE = 10;
const WEEKS_SHOWN = 8;

const average = (values) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : 0;

const SORTS = {
  date: (item) => new Date(item.endedAt).getTime(),
  time: (item) => item.durationSeconds,
  quiz: (item) => item.quiz.percent,
  rating: (item) => item.rating ?? 0,
};

function VerdictBadge({ verdict }) {
  if (!verdict) return <span className="text-base-content/40">-</span>;

  return (
    <span className={`badge badge-outline badge-sm ${verdict === "accepted" ? "badge-success" : "badge-error"}`}>
      {verdict === "accepted" ? "Accepted" : "Not accepted"}
    </span>
  );
}

function SortableTh({ label, field, sort, onSort }) {
  const active = sort.field === field;
  const Arrow = sort.direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <th>
      <button className="flex items-center gap-1 hover:text-base-content" onClick={() => onSort(field)}>
        {label}
        {active && <Arrow className="size-3" />}
      </button>
    </th>
  );
}

// interviews per week, split into accepted / not accepted (oldest first)
function weeklyBuckets(interviews) {
  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

  return Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const start = subWeeks(thisWeek, WEEKS_SHOWN - 1 - i);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inWeek = interviews.filter((item) => {
      const endedAt = new Date(item.endedAt);
      return endedAt >= start && endedAt < end;
    });

    return {
      label: format(start, "d MMM"),
      accepted: inWeek.filter((item) => item.verdict === "accepted").length,
      rejected: inWeek.filter((item) => item.verdict !== "accepted").length,
    };
  });
}

// every finished interview with time spent, quiz right/wrong counts and the code result
function HistoryPage() {
  const { data, isLoading } = useHistory();
  const [role, setRole] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ field: "date", direction: "desc" });
  const [page, setPage] = useState(0);

  const interviews = useMemo(() => data?.interviews || [], [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const key = SORTS[sort.field];
    const factor = sort.direction === "asc" ? 1 : -1;

    return interviews
      .filter((item) => {
        if (role !== "all" && item.role !== role) return false;
        if (verdict !== "all" && item.verdict !== verdict) return false;
        if (!needle) return true;

        return [item.candidate?.name, item.candidate?.email, item.host?.name, item.problem]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(needle));
      })
      .sort((a, b) => (key(a) - key(b)) * factor);
  }, [interviews, role, verdict, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const accepted = filtered.filter((item) => item.verdict === "accepted").length;
  const withQuiz = filtered.filter((item) => item.quiz.submitted);
  const rated = filtered.filter((item) => item.rating);
  const averageRating = rated.length
    ? (rated.reduce((sum, item) => sum + item.rating, 0) / rated.length).toFixed(1)
    : null;

  const chart = useMemo(() => weeklyBuckets(filtered), [filtered]);

  // any filter change returns to the first page
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const handleSort = (field) =>
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));

  const handleExport = () =>
    downloadCsv(
      `interview-history-${format(new Date(), "yyyy-MM-dd")}.csv`,
      filtered.map((item) => ({
        date: format(new Date(item.endedAt), "yyyy-MM-dd HH:mm"),
        role: item.role,
        candidate: item.candidate?.name,
        candidate_email: item.candidate?.email,
        interviewer: item.host?.name,
        problem: item.problem,
        difficulty: item.difficulty,
        time_spent_seconds: item.durationSeconds,
        quiz_correct: item.quiz.correct,
        quiz_incorrect: item.quiz.incorrect,
        quiz_unanswered: item.quiz.unanswered,
        quiz_percent: item.quiz.percent,
        tests_passed: item.code.testsPassed ? "yes" : "no",
        code_runs: item.code.runs,
        rating: item.rating,
        result: item.verdict,
      }))
    );

  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <PageHeader
          eyebrow="Records"
          title="Interview history"
          description="Time spent, correct and incorrect answers and the outcome of every interview."
          actions={
            <button className="btn btn-outline gap-2" onClick={handleExport} disabled={!filtered.length}>
              <DownloadIcon className="size-4" />
              Export CSV
            </button>
          }
        />

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Interviews" value={filtered.length} />
          <StatTile
            label="Accepted"
            value={filtered.length ? `${Math.round((accepted / filtered.length) * 100)}%` : "-"}
            hint={`${accepted} of ${filtered.length}`}
            tone="success"
          />
          <StatTile
            label="Avg time spent"
            value={filtered.length ? formatDuration(average(filtered.map((i) => i.durationSeconds))) : "-"}
          />
          <StatTile
            label="Avg quiz score"
            value={withQuiz.length ? `${average(withQuiz.map((i) => i.quiz.percent))}%` : "-"}
            hint={`${withQuiz.length} submitted`}
          />
          <StatTile
            label="Avg rating"
            value={averageRating ? `${averageRating} / 5` : "-"}
            hint={`${rated.length} rated`}
          />
        </div>

        {/* ACTIVITY */}
        <section className="panel mb-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Interviews per week</p>
            <span className="flex items-center gap-4 text-xs text-base-content/60">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-success/80" /> Accepted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-error/70" /> Not accepted
              </span>
            </span>
          </div>
          <BarChart data={chart} />
        </section>

        {/* FILTERS */}
        <div className="panel mb-4 flex flex-wrap items-center gap-3 p-3">
          <label className="input input-bordered flex min-w-60 flex-1 items-center gap-2">
            <SearchIcon className="size-4 text-base-content/50" />
            <input
              type="search"
              placeholder="Search candidate, interviewer or problem"
              value={query}
              onChange={(e) => withReset(setQuery)(e.target.value)}
            />
          </label>

          <select
            className="select select-bordered"
            value={role}
            onChange={(e) => withReset(setRole)(e.target.value)}
          >
            <option value="all">All roles</option>
            <option value="host">As interviewer</option>
            <option value="participant">As candidate</option>
          </select>

          <select
            className="select select-bordered"
            value={verdict}
            onChange={(e) => withReset(setVerdict)(e.target.value)}
          >
            <option value="all">Any result</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Not accepted</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="panel animate-rise overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No interviews found"
              hint={interviews.length ? "Try different filters." : "Finished interviews will appear here."}
            />
          ) : (
            <table className="table">
              <thead>
                <tr className="eyebrow">
                  <SortableTh label="Date" field="date" sort={sort} onSort={handleSort} />
                  <th>Candidate</th>
                  <th>Problem</th>
                  <SortableTh label="Time spent" field="time" sort={sort} onSort={handleSort} />
                  <SortableTh label="Quiz" field="quiz" sort={sort} onSort={handleSort} />
                  <th>Code</th>
                  <SortableTh label="Rating" field="rating" sort={sort} onSort={handleSort} />
                  <th>Result</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-base-200">
                    <td className="whitespace-nowrap text-sm">
                      {format(new Date(item.endedAt), "d MMM yyyy")}
                      <div className="text-xs text-base-content/50">{format(new Date(item.endedAt), "HH:mm")}</div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {item.role === "host" ? item.candidate?.name || "No candidate" : item.host?.name}
                      </div>
                      <div className="text-xs text-base-content/50">
                        {item.role === "host" ? item.candidate?.email : "You were the candidate"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{item.problem}</span>
                        <DifficultyBadge difficulty={item.difficulty} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-mono text-sm">{formatDuration(item.durationSeconds)}</td>
                    <td className="whitespace-nowrap font-mono text-sm">
                      {item.quiz.submitted ? (
                        <>
                          <span className="text-success">{item.quiz.correct}✓</span>{" "}
                          <span className="text-error">{item.quiz.incorrect}✗</span>{" "}
                          <span className="text-base-content/50">{item.quiz.unanswered}–</span>
                        </>
                      ) : (
                        <span className="text-base-content/40">not submitted</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-sm">
                      <span className={item.code.testsPassed ? "text-success" : "text-error"}>
                        {item.code.testsPassed ? "Passed" : "Not passed"}
                      </span>
                      <div className="text-xs text-base-content/50">
                        {item.code.runs} run{item.code.runs === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-sm">
                      {item.rating ? (
                        <span className="flex items-center gap-1">
                          <StarIcon className="size-4 fill-warning text-warning" />
                          {item.rating}
                        </span>
                      ) : (
                        <span className="text-base-content/40">-</span>
                      )}
                    </td>
                    <td>
                      <VerdictBadge verdict={item.verdict} />
                    </td>
                    <td>
                      <Link to={`/session/${item.id}/result`} className="btn btn-ghost btn-sm gap-1">
                        Details
                        <ChevronRightIcon className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-sm text-base-content/60">
            <span>
              {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm btn-square"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage + 1} / {pageCount}
              </span>
              <button
                className="btn btn-ghost btn-sm btn-square"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-base-content/50">Quiz column: correct ✓ · incorrect ✗ · unanswered –</p>
      </main>
    </div>
  );
}

export default HistoryPage;
