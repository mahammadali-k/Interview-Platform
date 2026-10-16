import { useState } from "react";
import { AlertTriangleIcon, Loader2Icon, UserMinusIcon } from "lucide-react";
import Modal from "./Modal";
import { PROBLEM_LIST } from "../data/problems";
import { TIME_LIMITS } from "../lib/constants";
import { useManageSession } from "../hooks/useSessions";
import { t } from "../lib/i18n";

// Host only: swap the problem, change the time limit, or remove the candidate from a running interview
function EditSessionModal({ session, onClose }) {
  const { update, removeCandidate } = useManageSession();
  const [problem, setProblem] = useState(session.problem);
  const [timeLimit, setTimeLimit] = useState(session.timeLimitMinutes || 0);
  const [proctoring, setProctoring] = useState(session.proctoring ?? true);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const problemChanged = problem !== session.problem;
  const changed =
    problemChanged ||
    timeLimit !== (session.timeLimitMinutes || 0) ||
    proctoring !== (session.proctoring ?? true);
  const hasProgress = session.quizSubmittedAt || session.codeRuns?.length > 0;
  const busy = update.isPending || removeCandidate.isPending;

  const handleSave = () =>
    update.mutate(
      { id: session._id, ...(problemChanged && { problem }), timeLimitMinutes: timeLimit, proctoring },
      { onSuccess: onClose }
    );

  return (
    <Modal
      eyebrow={t("edit.eyebrow", "Manage live session")}
      title={t("session.edit", "Edit session")}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            {t("common.close", "Close")}
          </button>
          <button className="btn btn-primary gap-2" disabled={!changed || busy} onClick={handleSave}>
            {update.isPending && <Loader2Icon className="size-4 animate-spin" />}
            {t("edit.save", "Save changes")}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="eyebrow mb-2 block" htmlFor="edit-problem">
            {t("edit.problem", "Problem")}
          </label>
          <select
            id="edit-problem"
            className="select w-full"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          >
            {PROBLEM_LIST.map((p) => (
              <option key={p.id} value={p.title}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>

          {problemChanged && (
            <p className="mt-3 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                {t("edit.warn", "Switching the problem loads its questions and clears the candidate's quiz answers and code runs.")}
                {hasProgress ? ` ${t("edit.warnProgress", "(they already have progress)")}` : ""}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="eyebrow mb-2 block" htmlFor="edit-time-limit">
            {t("create.limit", "Time limit")}
          </label>
          <select
            id="edit-time-limit"
            className="select w-full"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          >
            {TIME_LIMITS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes ? t("create.minutes", "{n} minutes", { n: minutes }) : t("create.noLimit", "No limit")}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border hairline p-4">
          <input
            type="checkbox"
            className="toggle toggle-primary mt-0.5"
            checked={proctoring}
            onChange={(e) => setProctoring(e.target.checked)}
          />
          <span>
            <span className="block font-medium">{t("proctor.setting", "Device detection")}</span>
            <span className="block text-sm text-base-content/60">
              {t("proctor.settingHint", "Detects phones and laptops on the candidate's camera and removes the candidate after a warning. Earphones can not be detected automatically: use \"Report device\" in the call. The candidate is told that it is on.")}
            </span>
          </span>
        </label>

        {session.participant && (
          <div className="border-t hairline pt-6">
            <p className="eyebrow mb-2">{t("session.candidate", "Candidate")}</p>
            <p className="mb-3 text-sm text-base-content/70">
              {t("edit.removeText", "{name} is in this interview. Removing them frees the seat and blocks them from rejoining.", { name: session.participant.name })}
            </p>

            {confirmingRemoval ? (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-error btn-sm gap-2"
                  onClick={() => removeCandidate.mutate(session._id, { onSuccess: onClose })}
                  disabled={busy}
                >
                  {removeCandidate.isPending && <Loader2Icon className="size-4 animate-spin" />}
                  {t("edit.yesRemove", "Yes, remove")}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingRemoval(false)}>
                  {t("edit.keep", "Keep")}
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline btn-error btn-sm gap-2"
                onClick={() => setConfirmingRemoval(true)}
              >
                <UserMinusIcon className="size-4" />
                {t("edit.remove", "Remove candidate")}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default EditSessionModal;
