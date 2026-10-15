import { useCallback, useEffect, useRef, useState } from "react";
import { translateText } from "../lib/translate";
import useSpeechRecognition from "./useSpeechRecognition";

const LINE_TTL_MS = 9000;
const MAX_LINES = 3;
const INTERIM_THROTTLE_MS = 450;

/**
 * Live translated captions for a call. Every participant transcribes their own microphone and
 * shares only the text over the chat channel; the receiving side translates it into the page
 * language and shows it as subtitles.
 *
 * @param {object} options
 * @param {object | null} options.channel   Stream chat channel of the session
 * @param {string} options.userId           the local Clerk user id (own events are ignored)
 * @param {boolean} options.enabled         captions switched on
 * @param {boolean} options.muted           microphone muted in the call: nothing is transcribed
 * @param {string} options.spokenLang       language the local user speaks
 * @param {string} options.targetLang       language to display captions in (the page language)
 */
function useLiveCaptions({ channel, userId, enabled, muted, spokenLang, targetLang }) {
  const [lines, setLines] = useState([]);
  const utterance = useRef(0);
  const lastInterim = useRef(0);
  const timers = useRef(new Map());
  const target = useRef(targetLang);

  useEffect(() => {
    target.current = targetLang;
  });

  // ---- send my own speech ----
  const handleSpeech = useCallback(
    ({ text, final }) => {
      if (!channel) return;

      const now = Date.now();
      if (!final && now - lastInterim.current < INTERIM_THROTTLE_MS) return;
      lastInterim.current = now;

      channel
        .sendEvent({ type: "caption", id: utterance.current, text, lang: spokenLang, final })
        .catch(() => {});

      if (final) utterance.current += 1;
    },
    [channel, spokenLang]
  );

  useSpeechRecognition({ enabled: enabled && !muted && Boolean(channel), lang: spokenLang, onText: handleSpeech });

  // ---- show what the other side says ----
  useEffect(() => {
    if (!channel || !enabled) return;

    const expire = (key) => {
      clearTimeout(timers.current.get(key));
      timers.current.set(
        key,
        setTimeout(() => setLines((prev) => prev.filter((line) => line.key !== key)), LINE_TTL_MS)
      );
    };

    const upsert = (key, patch) =>
      setLines((prev) => {
        const next = prev.some((line) => line.key === key)
          ? prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
          : [...prev, { key, ...patch }];

        return next.slice(-MAX_LINES);
      });

    const subscription = channel.on(async (event) => {
      if (event.type !== "caption" || event.user?.id === userId) return;

      const key = `${event.user?.id}:${event.id}`;
      const base = {
        speaker: event.user?.name || "",
        original: event.text,
        lang: event.lang,
        final: event.final,
      };

      // interim text is shown as spoken; only finished sentences are translated
      upsert(key, { ...base, text: event.text, translating: false });
      expire(key);

      if (event.final && event.lang !== target.current) {
        upsert(key, { translating: true });
        const translated = await translateText(event.text, event.lang, target.current);
        upsert(key, { text: translated, translating: false });
      }
    });

    const activeTimers = timers.current;

    return () => {
      subscription.unsubscribe();
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
      setLines([]);
    };
  }, [channel, enabled, userId]);

  return { lines };
}

export default useLiveCaptions;
