import { useState } from "react";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import Modal from "./Modal";
import { OPTION_LETTERS as LETTERS } from "../lib/constants";
import { t } from "../lib/i18n";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const EMPTY = { question: "", options: ["", ""], answer: 0, explanation: "", problem: "*" };

/**
 * Add or edit a quiz question.
 * @param {object} props
 * @param {object | null} props.initial  existing question to edit, or null to create
 * @param {{value: string, label: string}[]} [props.problemOptions]  shows a "Problem" select
 * @param {boolean} [props.offerSaveToBank]  shows "also save to my question bank"
 */
function QuestionEditorModal({
  initial,
  title,
  problemOptions,
  offerSaveToBank = false,
  isSaving,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [saveToBank, setSaveToBank] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setOption = (idx, value) =>
    setField(
      "options",
      form.options.map((option, i) => (i === idx ? value : option))
    );

  const addOption = () => setField("options", [...form.options, ""]);

  const removeOption = (idx) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
      // keep the "correct" marker on the same option after one gets removed
      answer: prev.answer === idx ? 0 : prev.answer > idx ? prev.answer - 1 : prev.answer,
    }));
  };

  const filledOptions = form.options.filter((o) => o.trim()).length;
  const isValid =
    form.question.trim().length >= 5 &&
    filledOptions === form.options.length &&
    form.options.length >= MIN_OPTIONS &&
    form.options[form.answer]?.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || isSaving) return;

    onSave({
      question: form.question.trim(),
      options: form.options.map((o) => o.trim()),
      answer: form.answer,
      explanation: form.explanation.trim(),
      ...(problemOptions && { problem: form.problem }),
      ...(offerSaveToBank && { saveToBank }),
    });
  };

  return (
    <Modal
      eyebrow={t("q.eyebrow", "Quiz question")}
      title={title}
      size="max-w-2xl"
      onSubmit={handleSubmit}
      onClose={onClose}
      busy={isSaving}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
            {t("common.cancel", "Cancel")}
          </button>
          <button type="submit" className="btn btn-primary gap-2" disabled={!isValid || isSaving}>
            {isSaving && <Loader2Icon className="size-4 animate-spin" />}
            {t("q.save", "Save question")}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {problemOptions && (
          <div>
            <label className="eyebrow mb-2 block" htmlFor="question-problem">
              {t("edit.problem", "Problem")}
            </label>
            <select
              id="question-problem"
              className="select w-full"
              value={form.problem}
              onChange={(e) => setField("problem", e.target.value)}
            >
              {problemOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="eyebrow mb-2 block" htmlFor="question-text">
              {t("q.question", "Question")}
            </label>
          <textarea
            id="question-text"
            className="textarea textarea-bordered h-24 w-full"
            maxLength={500}
            placeholder={t("q.placeholder", "What is the time complexity of ...?")}
            value={form.question}
            onChange={(e) => setField("question", e.target.value)}
          />
        </div>

        <div>
          <p className="eyebrow mb-2">{t("q.options", "Options (select the correct one)")}</p>
          <div className="space-y-2">
            {form.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-option"
                  className="radio radio-primary radio-sm"
                  checked={form.answer === idx}
                  onChange={() => setField("answer", idx)}
                  aria-label={t("q.correctAria", "Option {l} is correct", { l: LETTERS[idx] })}
                />
                <span className="w-5 font-mono text-sm text-base-content/50">{LETTERS[idx]}</span>
                <input
                  className="input input-bordered w-full"
                  maxLength={200}
                  placeholder={t("q.optionPlaceholder", "Option {l}", { l: LETTERS[idx] })}
                  value={option}
                  onChange={(e) => setOption(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={form.options.length <= MIN_OPTIONS}
                  onClick={() => removeOption(idx)}
                  aria-label={t("q.removeOption", "Remove option {l}", { l: LETTERS[idx] })}
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {form.options.length < MAX_OPTIONS && (
            <button type="button" className="btn btn-ghost btn-sm mt-2 gap-2" onClick={addOption}>
              <PlusIcon className="size-4" />
              {t("q.addOption", "Add option")}
            </button>
          )}
        </div>

        <div>
          <label className="eyebrow mb-2 block" htmlFor="question-explanation">
              {t("q.explanation", "Explanation (shown in the candidate's feedback)")}
            </label>
          <textarea
            id="question-explanation"
            className="textarea textarea-bordered h-20 w-full"
            maxLength={500}
            value={form.explanation}
            onChange={(e) => setField("explanation", e.target.value)}
          />
        </div>

        {offerSaveToBank && (
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={saveToBank}
              onChange={(e) => setSaveToBank(e.target.checked)}
            />
            {t("q.saveBank", "Also save to my question bank for future interviews")}
          </label>
        )}
      </div>
    </Modal>
  );
}

export default QuestionEditorModal;
