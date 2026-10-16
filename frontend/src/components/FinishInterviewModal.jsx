import { Loader2Icon } from "lucide-react";
import Modal from "./Modal";
import { t } from "../lib/i18n";

// Candidate side: send what you've answered so far and leave. Skipping questions is totally fine
function FinishInterviewModal({ answered, total, alreadySubmitted, isFinishing, onConfirm, onClose }) {
  const unanswered = total - answered;

  return (
    <Modal
      eyebrow={t("end.eyebrow", "Finish interview")}
      title={t("finish.title", "Submit and finish?")}
      size="max-w-md"
      onClose={onClose}
      busy={isFinishing}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={isFinishing}>
            {t("finish.keep", "Keep working")}
          </button>
          <button className="btn btn-primary gap-2" onClick={onConfirm} disabled={isFinishing}>
            {isFinishing && <Loader2Icon className="size-4 animate-spin" />}
            {isFinishing ? t("finish.finishing", "Finishing...") : t("finish.submit", "Submit & finish")}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-base-content/80">
        <p>
          {t("finish.answered", "You answered {a} of {b} questions.", { a: answered, b: total })}
          {alreadySubmitted ? ` ${t("finish.already", "(already submitted)")}` : ""}
        </p>
        {unanswered > 0 && !alreadySubmitted && (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3">
            {t("finish.unanswered", "{n} unanswered question(s) will count as incorrect. You can still go back and answer them.", { n: unanswered })}
          </p>
        )}
        <p>
          {t("finish.ends", "The interview ends for everyone and your feedback report is created right away. This cannot be undone.")}
        </p>
      </div>
    </Modal>
  );
}

export default FinishInterviewModal;
