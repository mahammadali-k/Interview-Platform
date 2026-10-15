import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import Modal from "./Modal";
import { PROBLEM_LIST } from "../data/problems";
import { TIME_LIMITS } from "../lib/constants";
import { t } from "../lib/i18n";

function CreateSessionModal({ onClose, roomConfig, setRoomConfig, onCreateRoom, isCreating }) {
  const handleSelect = (e) => {
    const selected = PROBLEM_LIST.find((p) => p.title === e.target.value);
    setRoomConfig((prev) => ({ ...prev, difficulty: selected.difficulty, problem: selected.title }));
  };

  return (
    <Modal
      eyebrow={t("create.eyebrow", "New session")}
      title={t("create.title", "Create New Session")}
      size="max-w-xl"
      onClose={onClose}
      busy={isCreating}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={isCreating}>
            {t("common.cancel", "Cancel")}
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}
          >
            {isCreating ? <LoaderIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
            {isCreating ? t("create.creating", "Creating...") : t("create.submit", "Create")}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="label" htmlFor="create-problem">
            <span className="label-text font-medium">{t("create.problem", "Select Problem")}</span>
            <span className="label-text-alt text-error">*</span>
          </label>

          <select
            id="create-problem"
            className="select w-full"
            value={roomConfig.problem}
            onChange={handleSelect}
          >
            <option value="" disabled>
              {t("create.choose", "Choose a coding problem...")}
            </option>
            {PROBLEM_LIST.map((problem) => (
              <option key={problem.id} value={problem.title}>
                {problem.title} ({problem.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="label" htmlFor="create-limit">
            <span className="label-text font-medium">{t("create.limit", "Time limit")}</span>
          </label>
          <select
            id="create-limit"
            className="select w-full"
            value={roomConfig.timeLimitMinutes}
            onChange={(e) => setRoomConfig((prev) => ({ ...prev, timeLimitMinutes: Number(e.target.value) }))}
          >
            {TIME_LIMITS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes ? t("create.minutes", "{n} minutes", { n: minutes }) : t("create.noLimit", "No limit")}
              </option>
            ))}
          </select>
        </div>

        {roomConfig.problem && (
          <div className="flex gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
            <Code2Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{t("create.summary", "Room summary")}</p>
              <p className="text-base-content/70">{t("create.summaryProblem", "Problem: {name}", { name: roomConfig.problem })}</p>
              <p className="text-base-content/70">{t("create.summaryMax", "Max participants: 2 (1-on-1 session)")}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CreateSessionModal;
