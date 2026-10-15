import { capitalize } from "../lib/utils";

const TONES = {
  easy: "badge-success",
  medium: "badge-warning",
  hard: "badge-error",
};

function DifficultyBadge({ difficulty, className = "" }) {
  if (!difficulty) return null;

  const tone = TONES[difficulty.toLowerCase()] || "badge-neutral";

  return (
    <span className={`badge badge-outline badge-sm font-medium ${tone} ${className}`}>
      {capitalize(difficulty)}
    </span>
  );
}

export default DifficultyBadge;
