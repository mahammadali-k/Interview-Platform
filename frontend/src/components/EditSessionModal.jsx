import { useState } from "react";
import { AlertTriangleIcon, Loader2Icon, UserMinusIcon } from "lucide-react";
import Modal from "./Modal";
import { PROBLEM_LIST } from "../data/problems";
import { TIME_LIMITS } from "../lib/constants";
import { useManageSession } from "../hooks/useSessions";

// host-only: change the problem or time limit of a running interview, or remove the candidate
function EditSessionModal({ session, onClose }) {
  const { update, removeCandidate } = useManageSession();
  const [problem, setProblem] = useState(session.problem);
  const [timeLimit, setTimeLimit] = useState(session.timeLimitMinutes || 0);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const problemChanged = problem !== session.problem;
  const changed = problemChanged || timeLimit !== (session.timeLimitMinutes || 0);
  const hasProgress = session.quizSubmittedAt || session.codeRuns?.length > 0;
  const busy = update.isPending || removeCandidate.isPending;

  const handleSave = () =>
    update.mutate(
      { id: session._id, ...(problemChanged && { problem }), timeLimitMinutes: timeLimit },
      { onSuccess: onClose }
    );

  return (
    <Modal
      eyebrow="Manage live session"
      title="Edit session"
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary gap-2" disabled={!changed || busy} onClick={handleSave}>
            {update.isPending && <Loader2Icon className="size-4 animate-spin" />}
            Save changes
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="eyebrow mb-2 block" htmlFor="edit-problem">
            Problem
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
                Switching the problem loads its questions and clears the candidate&apos;s quiz answers and
                code runs{hasProgress ? " (they already have progress)" : ""}.
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="eyebrow mb-2 block" htmlFor="edit-time-limit">
            Time limit
          </label>
          <select
            id="edit-time-limit"
            className="select w-full"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          >
            {TIME_LIMITS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes ? `${minutes} minutes` : "No limit"}
              </option>
            ))}
          </select>
        </div>

        {session.participant && (
          <div className="border-t hairline pt-6">
            <p className="eyebrow mb-2">Candidate</p>
            <p className="mb-3 text-sm text-base-content/70">
              {session.participant.name} is in this interview. Removing them frees the seat and blocks them
              from rejoining.
            </p>

            {confirmingRemoval ? (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-error btn-sm gap-2"
                  onClick={() => removeCandidate.mutate(session._id, { onSuccess: onClose })}
                  disabled={busy}
                >
                  {removeCandidate.isPending && <Loader2Icon className="size-4 animate-spin" />}
                  Yes, remove
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingRemoval(false)}>
                  Keep
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline btn-error btn-sm gap-2"
                onClick={() => setConfirmingRemoval(true)}
              >
                <UserMinusIcon className="size-4" />
                Remove candidate
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default EditSessionModal;
