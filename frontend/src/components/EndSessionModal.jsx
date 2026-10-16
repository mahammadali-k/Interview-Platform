import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import Modal from "./Modal";
import DecisionPicker from "./DecisionPicker";
import StarRating from "./StarRating";
import { t } from "../lib/i18n";

function Row({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-base-content/60">{label}</span>
      <span className={`font-medium ${ok === undefined ? "" : ok ? "text-success" : "text-error"}`}>
        {value}
      </span>
    </div>
  );
}

// Host only: look at how the candidate did, make the final call and leave a note
function EndSessionModal({ onClose, onConfirm, isEnding, summary, initialNotes = "" }) {
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState(initialNotes);
  const [rating, setRating] = useState(null);

  const chosen = decision ?? summary.suggested;

  return (
    <Modal
      eyebrow={t("end.eyebrow", "Finish interview")}
      title={t("end.title", "End this session?")}
      onClose={onClose}
      busy={isEnding}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={isEnding}>
            {t("common.cancel", "Cancel")}
          </button>
          <button
            className="btn btn-error gap-2"
            disabled={isEnding}
            onClick={() => onConfirm({ decision: chosen, notes, rating })}
          >
            {isEnding && <Loader2Icon className="size-4 animate-spin" />}
            {isEnding ? t("end.ending", "Ending...") : t("end.submit", "End interview")}
          </button>
        </>
      }
    >
      <div className="divide-y divide-base-content/10 rounded-lg border hairline px-4">
        <Row
          label={t("result.coding", "Coding task")}
          value={summary.testsPassed ? t("end.testsPassed", "Tests passed") : t("end.testsNot", "Tests not passed")}
          ok={summary.testsPassed}
        />
        <Row
          label={t("tab.quiz", "Quiz")}
          value={
            summary.quizSubmitted
              ? t("end.nCorrect", "{a}/{b} correct", { a: summary.quizCorrect, b: summary.quizTotal })
              : t("end.notSubmitted", "Not submitted")
          }
          ok={summary.quizSubmitted ? summary.quizPassed : false}
        />
      </div>

      <p className="eyebrow mb-2 mt-6">{t("end.decision", "Final decision")}</p>
      <DecisionPicker value={chosen} onChange={setDecision} suggested={summary.suggested} />

      <p className="eyebrow mb-2 mt-6">{t("end.rating", "Overall rating (optional)")}</p>
      <StarRating value={rating} onChange={setRating} />

      <label className="eyebrow mb-2 mt-6 block" htmlFor="interview-notes">
        {t("end.notes", "Notes for the candidate (optional)")}
      </label>
      <textarea
        id="interview-notes"
        className="textarea textarea-bordered h-24 w-full"
        placeholder={t("end.notesPlaceholder", "Strengths, areas to improve, next steps...")}
        maxLength={2000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <p className="mt-3 text-xs text-base-content/50">
        {t("end.hint", "The candidate receives a PDF feedback report with their mistakes, the correct answers and this decision.")}
      </p>
    </Modal>
  );
}

export default EndSessionModal;
