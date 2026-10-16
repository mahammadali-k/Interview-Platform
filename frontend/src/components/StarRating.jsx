import { StarIcon } from "lucide-react";
import { t } from "../lib/i18n";

// 1-5 stars. Click the selected star again to clear the rating
function StarRating({ value, onChange, readOnly = false, size = "size-6" }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={t("rating.label", "Rating")}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && value !== undefined && star <= value;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={t("rating.stars", "{n} / 5", { n: star })}
            disabled={readOnly}
            onClick={() => onChange?.(value === star ? null : star)}
            className="transition-transform enabled:hover:scale-110 disabled:cursor-default"
          >
            <StarIcon
              className={`${size} ${filled ? "fill-warning text-warning" : "text-base-content/30"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
