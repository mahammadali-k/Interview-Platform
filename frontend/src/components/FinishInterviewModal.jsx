import { Loader2Icon } from "lucide-react";
import Modal from "./Modal";

// candidate-side: submit what has been answered so far and leave. Skipped questions are fine.
function FinishInterviewModal({ answered, total, alreadySubmitted, isFinishing, onConfirm, onClose }) {
  const unanswered = total - answered;

  return (
    <Modal
      eyebrow="Finish interview"
      title="Submit and finish?"
      size="max-w-md"
      onClose={onClose}
      busy={isFinishing}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={isFinishing}>
            Keep working
          </button>
          <button className="btn btn-primary gap-2" onClick={onConfirm} disabled={isFinishing}>
            {isFinishing && <Loader2Icon className="size-4 animate-spin" />}
            {isFinishing ? "Finishing..." : "Submit & finish"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-base-content/80">
        <p>
          You answered <strong>{answered}</strong> of <strong>{total}</strong> questions
          {alreadySubmitted ? " (already submitted)" : ""}.
        </p>
        {unanswered > 0 && !alreadySubmitted && (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3">
            {unanswered} unanswered question{unanswered === 1 ? "" : "s"} will count as incorrect. You can
            still go back and answer them.
          </p>
        )}
        <p>
          The interview ends for everyone and your feedback report is created right away. This cannot be
          undone.
        </p>
      </div>
    </Modal>
  );
}

export default FinishInterviewModal;
