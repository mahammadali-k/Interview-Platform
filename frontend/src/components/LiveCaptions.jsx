import { LanguagesIcon } from "lucide-react";
import { t } from "../lib/i18n";

// subtitles over the video: translated text large, the original quietly underneath
function LiveCaptions({ lines }) {
  if (!lines.length) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {lines.map((line) => {
        const translated = line.final && line.text !== line.original;

        return (
          <div
            key={line.key}
            className={`animate-pop max-w-[90%] rounded-lg bg-black/75 px-4 py-2 text-center text-white backdrop-blur-sm ${
              line.final ? "" : "opacity-80"
            }`}
          >
            <p className="flex items-center justify-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-white/60">
              {translated && <LanguagesIcon className="size-3" />}
              {line.speaker}
              {line.translating && ` · ${t("cc.translating", "translating...")}`}
            </p>
            <p className="text-base leading-snug">{line.text}</p>
            {translated && <p className="mt-0.5 text-xs text-white/50">{line.original}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default LiveCaptions;
