import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  Loader2Icon,
  LinkIcon,
  MailIcon,
  XCircleIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import DifficultyBadge from "../components/DifficultyBadge";
import Spinner from "../components/Spinner";
import StarRating from "../components/StarRating";
import StatTile from "../components/StatTile";
import DecisionPicker from "../components/DecisionPicker";
import { OPTION_LETTERS as LETTERS, PASS_PERCENT } from "../lib/constants";
import { copyText } from "../lib/clipboard";
import { useEmailReport, useSessionReport, useUpdateResult } from "../hooks/useSessions";
import { downloadReportPdf } from "../lib/download";
import { formatDuration } from "../lib/utils";
import { dateLocale } from "../lib/dateLocale";
import { t } from "../lib/i18n";

// host-only: change the final decision or the notes after the interview
function ResultEditor({ id, result }) {
  const updateResult = useUpdateResult();
  const [decision, setDecision] = useState(result.verdict);
  const [notes, setNotes] = useState(result.notes || "");
  const [rating, setRating] = useState(result.rating ?? null);

  const changed =
    decision !== result.verdict ||
    notes !== (result.notes || "") ||
    rating !== (result.rating ?? null);

  return (
    <section className="panel space-y-4 p-5">
      <p className="eyebrow">{t("result.decision", "Interviewer decision")}</p>

      <DecisionPicker value={decision} onChange={setDecision} />

      <div>
        <p className="eyebrow mb-2">{t("rating.label", "Rating")}</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <textarea
        className="textarea textarea-bordered h-24 w-full"
        placeholder={t("result.notesPlaceholder", "Notes for the candidate (included in the PDF)")}
        maxLength={2000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-base-content/50">
          {t("result.resend", "Re-send the email after changing the decision so the candidate receives the update.")}
        </p>
        <button
          className="btn btn-primary btn-sm gap-2"
          disabled={!changed || updateResult.isPending}
          onClick={() => updateResult.mutate({ id, decision, notes, rating })}
        >
          {updateResult.isPending && <Loader2Icon className="size-4 animate-spin" />}
          {t("common.save", "Save")}
        </button>
      </div>
    </section>
  );
}

function ResultPage() {
  const { id } = useParams();
  const { data: report, isLoading, isError } = useSessionReport(id);
  const emailReport = useEmailReport();
  const [isDownloading, setIsDownloading] = useState(false);
  const autoDownloaded = useRef(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReportPdf(id, report.session.problem);
    } catch (error) {
      console.error("Failed to download the PDF", error);
      toast.error(t("result.pdfFail", "Could not download the PDF"));
    } finally {
      setIsDownloading(false);
    }
  };

  // the candidate gets the PDF automatically the first time the report opens
  useEffect(() => {
    if (!report || report.role !== "participant" || autoDownloaded.current) return;
    autoDownloaded.current = true;

    const key = `report-downloaded:${id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // storage unavailable: just download
    }

    downloadReportPdf(id, report.session.problem).catch(() => toast.error(t("result.pdfFail", "Could not download the PDF")));
  }, [report, id]);

  if (isError) return <Navigate to="/dashboard" replace />;

  if (isLoading || !report) {
    return <Spinner fullScreen />;
  }

  const { session, result, quiz, code, email } = report;
  const isHost = report.role === "host";
  const accepted = result.verdict === "accepted";

  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <Link
          to={isHost ? "/history" : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content"
        >
          <ArrowLeftIcon className="size-4" />
          {isHost ? t("result.backHistory", "Back to history") : t("common.backDashboard", "Back to dashboard")}
        </Link>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">{t("result.eyebrow", "Interview feedback")}</p>
            <h1 className="text-3xl font-semibold">{session.problem}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-base-content/60">
              <DifficultyBadge difficulty={session.difficulty} />
              <span>{new Date(session.endedAt).toLocaleString(dateLocale().code)}</span>
              <span>
                {session.candidate?.name || t("session.candidate", "Candidate")} · {t("session.interviewerLower", "interviewer")} {session.host?.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-ghost gap-2"
              onClick={() => copyText(window.location.href, t("result.linkCopied", "Report link copied"))}
            >
              <LinkIcon className="size-4" />
              {t("result.copyLink", "Copy link")}
            </button>

            <button
              className="btn btn-ghost gap-2"
              onClick={() =>
                copyText(
                  [
                    `${session.candidate?.name || t("session.candidate", "Candidate")} - ${session.problem}`,
                    `${t("result.sumResult", "Result")}: ${accepted ? t("result.accepted", "Accepted") : t("result.notAccepted", "Not accepted")}`,
                    `${t("tab.quiz", "Quiz")}: ${t("end.nCorrect", "{a}/{b} correct", { a: quiz.correct, b: quiz.total })}`,
                    `${t("result.coding", "Coding task")}: ${result.testsPassed ? t("result.passed", "Passed") : t("result.notPassed", "Not passed")}`,
                    `${t("result.time", "Time spent")}: ${formatDuration(session.durationSeconds)}`,
                  ].join("\n"),
                  t("result.summaryCopied", "Summary copied")
                )
              }
            >
              <CopyIcon className="size-4" />
              {t("result.copySummary", "Copy summary")}
            </button>

            {isHost && session.candidate && (
              <button
                className="btn btn-outline gap-2"
                onClick={() => emailReport.mutate(id)}
                disabled={emailReport.isPending || !report.emailEnabled}
                title={
                  report.emailEnabled
                    ? t("result.emailTitle", "Email the PDF to the candidate")
                    : t("result.emailOff", "Email is not configured on the server")
                }
              >
                {emailReport.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <MailIcon className="size-4" />
                )}
                {t("result.sendEmail", "Send by email")}
              </button>
            )}

            <button className="btn btn-primary gap-2" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
              {t("result.download", "Download PDF")}
            </button>
          </div>
        </header>

        {/* VERDICT */}
        <section
          className={`animate-rise flex items-center gap-4 rounded-lg border p-6 ${
            accepted ? "border-success/50 bg-success/10" : "border-error/50 bg-error/10"
          }`}
        >
          {accepted ? (
            <CheckCircle2Icon className="size-10 shrink-0 text-success" />
          ) : (
            <XCircleIcon className="size-10 shrink-0 text-error" />
          )}
          <div>
            <h2 className="text-2xl font-semibold">{accepted ? t("result.accepted", "Accepted") : t("result.notAccepted", "Not accepted")}</h2>
            <p className="text-base-content/70">
              {isHost
                ? accepted
                  ? t("result.hostAccepted", "The candidate met the requirements of this interview.")
                  : t("result.hostRejected", "The candidate did not meet the requirements of this interview.")
                : accepted
                  ? t("result.candAccepted", "You met the requirements of this interview.")
                  : t("result.candRejected", "You did not meet the requirements of this interview. Review the corrections below.")}
              {result.endedBy === "candidate" && ` ${t("result.selfFinished", "The candidate finished the interview themselves.")}`}
            </p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={t("result.time", "Time spent")}
            value={formatDuration(session.durationSeconds)}
            hint={
              session.joinedAt
                ? t("result.joined", "Joined {time}", { time: new Date(session.joinedAt).toLocaleTimeString(dateLocale().code) })
                : t("result.inRoom", "In the room")
            }
          />
          <StatTile
            label={t("result.coding", "Coding task")}
            value={result.testsPassed ? t("result.passed", "Passed") : t("result.notPassed", "Not passed")}
            hint={t("result.runs", "{n} runs, {p} passed", { n: code.runs, p: code.passedRuns })}
            tone={result.testsPassed ? "success" : "error"}
          />
          <StatTile
            label={t("result.quizScore", "Quiz score")}
            value={`${quiz.correct}/${quiz.total}`}
            hint={quiz.submitted ? t("result.percentCorrect", "{n}% correct", { n: quiz.percent }) : t("end.notSubmitted", "Not submitted")}
            tone={quiz.submitted && quiz.percent >= PASS_PERCENT ? "success" : "error"}
          />
          <StatTile
            label={t("result.mistakes", "Mistakes")}
            value={quiz.incorrect + quiz.unanswered}
            hint={t("result.wrongUnanswered", "{w} wrong · {u} unanswered", { w: quiz.incorrect, u: quiz.unanswered })}
            tone={quiz.incorrect + quiz.unanswered === 0 ? "success" : "error"}
          />
        </div>

        {isHost && session.candidate && (
          <p className="text-sm text-base-content/60">
            {email?.sentAt
              ? t("result.emailedTo", "Feedback emailed to {to} on {date}.", {
                  to: email.to,
                  date: new Date(email.sentAt).toLocaleString(dateLocale().code),
                })
              : email?.error
                ? t("result.emailError", "Feedback email was not sent: {error}.", { error: email.error })
                : t("result.emailNot", "Feedback email has not been sent yet.")}
          </p>
        )}

        {isHost ? (
          <ResultEditor id={id} result={result} />
        ) : (
          (result.notes || result.rating) && (
            <section className="panel space-y-3 p-5">
              <p className="eyebrow">{t("result.interviewerFeedback", "Interviewer feedback")}</p>
              {result.rating && <StarRating value={result.rating} readOnly size="size-5" />}
              {result.notes && <p className="whitespace-pre-wrap leading-relaxed">{result.notes}</p>}
            </section>
          )
        )}

        {/* QUIZ REVIEW */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("result.review", "Quiz review")}</h2>

          {quiz.items.map((item, idx) => (
            <article
              key={item.id}
              className={`panel animate-rise stagger p-5 ${item.isCorrect ? "" : "!border-error/50"}`}
              style={{ "--i": Math.min(idx, 8) }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-medium">
                  <span className="mr-2 font-mono text-base-content/40">{String(idx + 1).padStart(2, "0")}</span>
                  {item.question}
                </h3>
                <span className={`badge badge-outline badge-sm ${item.isCorrect ? "badge-success" : "badge-error"}`}>
                  {item.isCorrect
                    ? t("result.correct", "Correct")
                    : item.selected === null
                      ? t("result.unanswered", "Unanswered")
                      : t("result.incorrect", "Incorrect")}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="text-base-content/50">{isHost ? t("result.candAnswer", "Candidate's answer: ") : t("result.yourAnswer", "Your answer: ")}</span>
                  <span className={item.isCorrect ? "text-success" : "text-error"}>
                    {item.selected === null
                      ? t("result.noAnswer", "No answer")
                      : `${LETTERS[item.selected]}. ${item.options[item.selected]}`}
                  </span>
                </p>
                {!item.isCorrect && (
                  <p>
                    <span className="text-base-content/50">{t("result.correctAnswer", "Correct answer: ")}</span>
                    <span className="text-success">
                      {LETTERS[item.answer]}. {item.options[item.answer]}
                    </span>
                  </p>
                )}
                {item.explanation && <p className="pt-1 text-xs text-base-content/60">{item.explanation}</p>}
              </div>
            </article>
          ))}
        </section>

        {/* LAST CODE */}
        {code.lastRun && (
          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">{t("result.lastCode", "Last code submission ({lang})", { lang: code.lastRun.language })}</p>
              <span
                className={`badge badge-outline badge-sm ${code.lastRun.passed ? "badge-success" : "badge-error"}`}
              >
                {code.lastRun.passed ? t("result.passed", "Passed") : t("result.failed", "Failed")}
              </span>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg border hairline bg-base-200 p-4 font-mono text-xs">
              {code.lastRun.code}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}

export default ResultPage;
