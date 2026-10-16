import { LanguagesIcon, MicIcon, MicOffIcon, TriangleAlertIcon } from "lucide-react";
import useLiveCaptions from "../hooks/useLiveCaptions";
import { LANGUAGES, t } from "../lib/i18n";

const langLabel = (code) => LANGUAGES.find((l) => l.code === code)?.short || code.toUpperCase();

// Says what speech recognition is up to, in words you can act on
function statusOf({ enabled, muted, speech, spokenLang }) {
  if (!enabled) return null;
  if (muted) return { tone: "muted", icon: MicOffIcon, text: t("cc.status.muted", "Microphone is off: unmute to send captions") };

  if (speech.state === "error") {
    const text =
      {
        unsupported: t("cc.status.unsupported", "This browser can't recognise speech (use Chrome, Edge or Safari)"),
        "not-allowed": t("cc.status.denied", "Microphone access for speech recognition was blocked"),
        "service-not-allowed": t("cc.status.denied", "Microphone access for speech recognition was blocked"),
        "language-not-supported": t("cc.status.lang", "This browser can't recognise {lang} speech", { lang: langLabel(spokenLang) }),
        network: t("cc.status.network", "The speech service is unreachable"),
      }[speech.reason] || t("cc.status.error", "Speech recognition error: {reason}", { reason: speech.reason });

    return { tone: "error", icon: TriangleAlertIcon, text };
  }

  return {
    tone: "ok",
    icon: MicIcon,
    text: t("cc.status.listening", "Listening ({lang})", { lang: langLabel(spokenLang) }),
  };
}

const TONES = {
  ok: "text-success",
  muted: "text-warning",
  error: "text-error",
};

// Subtitles over the video: the translation big, the original small underneath.
// The caption state lives in here (not in the call UI), so each new caption only re-renders this little block.
function LiveCaptions({ muted, enabled, spokenLang, ...rest }) {
  const { lines, speech } = useLiveCaptions({ muted, enabled, spokenLang, ...rest });
  const status = statusOf({ enabled, muted, speech, spokenLang });

  return (
    <>
      {status && (
        <div
          className={`pointer-events-none absolute left-3 top-3 z-10 flex max-w-[80%] items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs backdrop-blur-sm ${TONES[status.tone]}`}
          role="status"
        >
          <status.icon className="size-3.5 shrink-0" />
          <span className="truncate text-white/90">{status.text}</span>
        </div>
      )}

      {lines.length > 0 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2 px-4"
          aria-live="polite"
        >
          {lines.map((line) => {
            const translated = line.final && !line.self && line.text !== line.original;

            return (
              <div
                key={line.key}
                className={`animate-pop max-w-[90%] rounded-lg px-4 py-2 text-center text-white backdrop-blur-sm ${
                  line.self ? "bg-black/45 text-sm italic" : "bg-black/75"
                } ${line.final ? "" : "opacity-80"}`}
              >
                <p className="flex items-center justify-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-white/60">
                  {translated && <LanguagesIcon className="size-3" />}
                  {line.self ? t("cc.you", "You") : line.speaker}
                  {line.translating && ` · ${t("cc.translating", "translating...")}`}
                  {line.failed && ` · ${t("cc.failed", "translation unavailable")}`}
                </p>
                <p className={line.self ? "leading-snug" : "text-base leading-snug"}>{line.text}</p>
                {translated && <p className="mt-0.5 text-xs text-white/50">{line.original}</p>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default LiveCaptions;
