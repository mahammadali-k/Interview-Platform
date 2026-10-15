import { CheckCircle2Icon, Loader2Icon, PencilIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react";
import { OPTION_LETTERS as LETTERS } from "../lib/constants";
import { t } from "../lib/i18n";


function Option({ letter, text, state, onClick, disabled }) {
  const styles = {
    idle: "hairline hover:border-primary/50 hover:bg-base-200",
    selected: "border-primary bg-primary/10",
    correct: "border-success bg-success/10",
    wrong: "border-error bg-error/10",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${styles[state]}`}
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-lg border hairline font-mono text-xs">
        {letter}
      </span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <CheckCircle2Icon className="size-4 shrink-0 text-success" />}
    </button>
  );
}

/**
 * candidate: answers the questions (partial submission is allowed).
 * host: sees the answer key and the candidate's progress, and can add / edit / delete questions.
 *
 * `draft` is owned by the page so that "Submit & finish" can send the same answers.
 */
function QuizPanel({
  quiz,
  isLoading,
  isHost,
  draft,
  onSelect,
  isSubmitting,
  onSubmit,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  if (isLoading || !quiz) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton h-28 w-full" />
        ))}
      </div>
    );
  }

  const { questions, submitted } = quiz;
  const selectedOf = (q) => (submitted || isHost ? q.selected : (draft[q.id] ?? null));
  const answered = questions.filter((q) => selectedOf(q) !== null).length;

  return (
    <div className="space-y-4 p-5">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="eyebrow">{isHost ? t("quiz.progress", "Candidate progress") : t("tab.quiz", "Quiz")}</p>
          <p className="mt-1 text-sm text-base-content/70">
            {isHost
              ? submitted
                ? t("quiz.hostSubmitted", "The candidate has submitted the quiz.")
                : t("quiz.hostWaiting", "Waiting for the candidate. The answer key is shown below.")
              : submitted
                ? t("quiz.candSubmitted", "Answers submitted. Your feedback will be ready when the interview ends.")
                : t("quiz.candHint", "Answer what you can and submit. Skipped questions count as incorrect.")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-outline font-mono">
            {answered}/{questions.length}
          </span>
          {isHost && (
            <button className="btn btn-primary btn-sm gap-2" onClick={onAddQuestion}>
              <PlusIcon className="size-4" />
              {t("q.add", "Add question")}
            </button>
          )}
        </div>
      </div>

      {questions.length === 0 && (
        <p className="panel p-6 text-center text-sm text-base-content/60">
          {isHost ? t("quiz.noneHost", "No questions yet. Add one above.") : t("quiz.noneCand", "The interviewer has not added questions yet.")}
        </p>
      )}

      {questions.map((q, idx) => {
        const selected = selectedOf(q);

        return (
          <section key={q.id} className="panel space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium">
                <span className="mr-2 font-mono text-base-content/40">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {q.question}
              </h3>

              {isHost && (
                <div className="flex shrink-0 gap-1">
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => onEditQuestion(q)}
                    aria-label={t("q.edit", "Edit question")}
                  >
                    <PencilIcon className="size-3.5" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-square text-error"
                    onClick={() => onDeleteQuestion(q)}
                    aria-label={t("q.delete", "Delete question")}
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {q.options.map((text, optionIdx) => {
                let state = selected === optionIdx ? "selected" : "idle";

                if (isHost && q.answer !== undefined) {
                  if (optionIdx === q.answer) state = "correct";
                  else if (selected === optionIdx) state = "wrong";
                }

                return (
                  <Option
                    key={optionIdx}
                    letter={LETTERS[optionIdx]}
                    text={text}
                    state={state}
                    disabled={isHost || submitted}
                    onClick={() => onSelect(q.id, optionIdx)}
                  />
                );
              })}
            </div>

            {isHost && q.explanation && <p className="text-xs text-base-content/60">{q.explanation}</p>}
          </section>
        );
      })}

      {!isHost && !submitted && questions.length > 0 && (
        <button className="btn btn-primary w-full gap-2" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
          {isSubmitting
            ? t("quiz.submitting", "Submitting...")
            : answered === questions.length
              ? t("quiz.submit", "Submit answers")
              : t("quiz.submitPartial", "Submit {a} of {b} answers", { a: answered, b: questions.length })}
        </button>
      )}
    </div>
  );
}

export default QuizPanel;
