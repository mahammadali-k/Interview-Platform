import { useCallback, useEffect, useRef, useState } from "react";
import { translateText } from "../lib/translate";
import useSpeechRecognition from "./useSpeechRecognition";

const LINE_TTL_MS = 9000;
const MAX_LINES = 3;
const INTERIM_THROTTLE_MS = 400;
const SEEN_LIMIT = 80;

/**
 * Live translated captions for a call. Every participant transcribes their own microphone and
 * shares only the text; the receiving side translates it into the page language and shows it as
 * subtitles. Captions travel over BOTH the chat channel and the call's custom events (the first
 * one that works wins, duplicates are dropped), and the speaker also sees their own words.
 *
 * @param {object} options
 * @param {object | null} options.channel   Stream chat channel of the session
 * @param {object | null} options.call      Stream video call
 * @param {string} options.userId           the local Clerk user id
 * @param {boolean} options.enabled         captions switched on
 * @param {boolean} options.muted           microphone muted in the call: nothing is transcribed
 * @param {string} options.spokenLang       language the local user speaks
 * @param {string} options.targetLang       language to display captions in (the page language)
 */
function useLiveCaptions({ channel, call, userId, enabled, muted, spokenLang, targetLang }) {
  const [lines, setLines] = useState([]);
  const utterance = useRef(0);
  const lastInterim = useRef(0);
  const timers = useRef(new Map());
  const seen = useRef(new Set());
  const target = useRef(targetLang);

  useEffect(() => {
    target.current = targetLang;
  });

  const expire = useCallback((key) => {
    clearTimeout(timers.current.get(key));
    timers.current.set(
      key,
      setTimeout(() => setLines((prev) => prev.filter((line) => line.key !== key)), LINE_TTL_MS)
    );
  }, []);

  const upsert = useCallback((key, patch) => {
    setLines((prev) => {
      const next = prev.some((line) => line.key === key)
        ? prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
        : [...prev, { key, ...patch }];

      return next.slice(-MAX_LINES);
    });
  }, []);

  // ---- send my own speech (and echo it locally so it is visible that recognition works) ----
  const handleSpeech = useCallback(
    ({ text, final }) => {
      const id = utterance.current;
      const now = Date.now();

      upsert(`me:${id}`, { speaker: "", self: true, text, original: text, lang: spokenLang, final, translating: false });
      expire(`me:${id}`);

      if (!final && now - lastInterim.current < INTERIM_THROTTLE_MS) return;
      lastInterim.current = now;

      const payload = { type: "caption", id, text, lang: spokenLang, final };

      channel?.sendEvent(payload).catch(() => {});
      call?.sendCustomEvent?.(payload).catch?.(() => {});

      if (final) utterance.current += 1;
    },
    [channel, call, spokenLang, upsert, expire]
  );

  const speech = useSpeechRecognition({
    enabled: enabled && !muted,
    lang: spokenLang,
    onText: handleSpeech,
  });

  // ---- show what the other side says ----
  useEffect(() => {
    if (!enabled || (!channel && !call)) return;

    const receive = async ({ speakerId, speaker, id, text, lang, final }) => {
      if (!text || speakerId === userId) return;

      // the same caption can arrive through both transports
      const signature = `${speakerId}:${id}:${final}:${text}`;
      if (seen.current.has(signature)) return;
      seen.current.add(signature);
      if (seen.current.size > SEEN_LIMIT) seen.current.delete(seen.current.values().next().value);

      const key = `${speakerId}:${id}`;

      // interim text is shown as spoken; only finished sentences are translated
      upsert(key, { speaker, original: text, lang, final, text, translating: false, failed: false });
      expire(key);

      if (final && lang !== target.current) {
        upsert(key, { translating: true });
        const translated = await translateText(text, lang, target.current);
        upsert(key, translated ? { text: translated, translating: false } : { translating: false, failed: true });
      }
    };

    const onChat = (event) => {
      if (event.type !== "caption") return;
      receive({
        speakerId: event.user?.id,
        speaker: event.user?.name || "",
        id: event.id,
        text: event.text,
        lang: event.lang,
        final: event.final,
      });
    };

    const onCall = (event) => {
      const data = event.custom;
      if (data?.type !== "caption") return;
      receive({
        speakerId: event.user?.id,
        speaker: event.user?.name || "",
        id: data.id,
        text: data.text,
        lang: data.lang,
        final: data.final,
      });
    };

    const chatSubscription = channel?.on(onChat);
    const unsubscribeCall = call?.on?.("custom", onCall);
    const activeTimers = timers.current;

    return () => {
      chatSubscription?.unsubscribe();
      unsubscribeCall?.();
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
      setLines([]);
    };
  }, [channel, call, enabled, userId, upsert, expire]);

  return { lines, speech };
}

export default useLiveCaptions;
