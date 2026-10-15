import { useMemo, useState } from "react";
import { CheckCircle2Icon, CopyIcon, ListChecksIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import QuestionEditorModal from "../components/QuestionEditorModal";
import { useQuestionBank } from "../hooks/useSessions";
import { OPTION_LETTERS as LETTERS } from "../lib/constants";
import { t } from "../lib/i18n";

const GENERAL = "*";

const problemLabel = (problem) => (problem === GENERAL ? t("qb.general", "General (every problem)") : problem);

// the host's question bank: every new interview copies the questions of its problem
function QuestionsPage() {
  const bank = useQuestionBank();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(undefined); // undefined: closed, null: new
  const [template, setTemplate] = useState(null); // prefill for "duplicate"

  const problems = bank.data?.problems || [];
  const questions = useMemo(() => bank.data?.questions || [], [bank.data]);

  const visible = useMemo(
    () => (filter === "all" ? questions : questions.filter((q) => q.problem === filter)),
    [questions, filter]
  );

  const problemOptions = problems.map((value) => ({ value, label: problemLabel(value) }));
  const isSaving = bank.create.isPending || bank.update.isPending;

  const closeEditor = () => {
    setEditing(undefined);
    setTemplate(null);
  };

  const handleDuplicate = (question) => {
    setTemplate({ ...question, id: undefined, question: `${question.question} ${t("qb.copySuffix", "(copy)")}` });
    setEditing(null);
  };

  const handleSave = (values) => {
    const done = { onSuccess: closeEditor };

    if (editing) bank.update.mutate({ id: editing.id, ...values }, done);
    else bank.create.mutate(values, done);
  };

  const handleDelete = (question) => {
    if (confirm(t("qb.deleteConfirm", "Delete this question from your bank? Running interviews keep their copy."))) {
      bank.remove.mutate(question.id);
    }
  };

  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          eyebrow={t("qb.eyebrow", "Interview content")}
          title={t("palette.questions", "Question bank")}
          description={t("qb.desc", "Add your own questions or edit the existing ones. New interviews copy the questions of their problem.")}
          actions={
            <button className="btn btn-primary gap-2" onClick={() => setEditing(null)}>
              <PlusIcon className="size-4" />
              {t("q.add", "Add question")}
            </button>
          }
        />

        {/* FILTER */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ value: "all", label: t("prob.all", "All") }, ...problemOptions].map(({ value, label }) => {
            const count = value === "all" ? questions.length : questions.filter((q) => q.problem === value).length;

            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  filter === value
                    ? "border-primary bg-primary/10 text-base-content"
                    : "hairline text-base-content/70 hover:border-primary/50"
                }`}
              >
                {label} <span className="font-mono text-xs text-base-content/50">{count}</span>
              </button>
            );
          })}
        </div>

        {/* LIST */}
        {bank.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton h-32 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="panel">
            <EmptyState
              icon={ListChecksIcon}
              title={t("qb.none", "No questions here")}
              hint={t("qb.noneHint", "Add one with the button above.")}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((q, idx) => (
              <article
                key={q.id}
                className="panel lift animate-rise stagger p-5"
                style={{ "--i": Math.min(idx, 8) }}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="badge badge-outline badge-sm mb-2">{problemLabel(q.problem)}</span>
                    <h2 className="font-medium">{q.question}</h2>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => handleDuplicate(q)}
                      aria-label={t("qb.duplicate", "Duplicate question")}
                      title={t("qb.dup", "Duplicate")}
                    >
                      <CopyIcon className="size-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => setEditing(q)}
                      aria-label={t("q.edit", "Edit question")}
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square text-error"
                      onClick={() => handleDelete(q)}
                      aria-label={t("q.delete", "Delete question")}
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>

                <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                  {q.options.map((option, optionIdx) => (
                    <li
                      key={optionIdx}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                        optionIdx === q.answer ? "border-success/50 bg-success/10" : "hairline"
                      }`}
                    >
                      <span className="font-mono text-xs text-base-content/50">{LETTERS[optionIdx]}</span>
                      <span className="flex-1">{option}</span>
                      {optionIdx === q.answer && <CheckCircle2Icon className="size-4 shrink-0 text-success" />}
                    </li>
                  ))}
                </ul>

                {q.explanation && <p className="mt-3 text-xs text-base-content/60">{q.explanation}</p>}
              </article>
            ))}
          </div>
        )}
      </main>

      {editing !== undefined && (
        <QuestionEditorModal
          key={editing?.id ?? (template ? "copy" : "new")}
          title={editing ? t("q.edit", "Edit question") : t("q.add", "Add question")}
          initial={editing ?? template ?? { problem: filter === "all" ? GENERAL : filter }}
          problemOptions={problemOptions}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}

export default QuestionsPage;
