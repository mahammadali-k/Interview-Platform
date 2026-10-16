import { useEffect, useRef, useState } from "react";

const Recognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// the locale the browser's speech service wants for each interface language
const SPEECH_LOCALES = { en: "en-US", az: "az-AZ", ru: "ru-RU" };

export const isSpeechRecognitionSupported = Boolean(Recognition);

// errors where retrying would never help
const FATAL_ERRORS = new Set(["not-allowed", "service-not-allowed", "language-not-supported", "audio-capture"]);

/**
 * Turns the local microphone into text with the browser's built-in speech recognition.
 * `onText({ text, final })` fires for interim and final results. It restarts itself after the
 * silence timeouts Chrome enforces, and stops while `enabled` is false.
 *
 * @returns {{ state: "off" | "starting" | "listening" | "error", reason?: string }}
 */
function useSpeechRecognition({ enabled, lang, onText }) {
  const handler = useRef(onText);
  const [status, setStatus] = useState({ state: "off" });

  useEffect(() => {
    handler.current = onText;
  });

  useEffect(() => {
    if (!enabled) {
      setStatus({ state: "off" });
      return;
    }
    if (!Recognition) {
      setStatus({ state: "error", reason: "unsupported" });
      return;
    }

    const recognition = new Recognition();
    let stopped = false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LOCALES[lang] || "en-US";

    recognition.onstart = () => setStatus({ state: "listening" });

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (text) handler.current({ text, final: result.isFinal });
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are normal; anything else is worth telling the user about
      if (event.error === "no-speech" || event.error === "aborted") return;

      console.warn("Speech recognition error:", event.error);
      setStatus({ state: "error", reason: event.error });
      if (FATAL_ERRORS.has(event.error)) stopped = true;
    };

    recognition.onend = () => {
      if (stopped) return;

      try {
        recognition.start();
      } catch {
        // already started, nothing to do
      }
    };

    setStatus({ state: "starting" });

    try {
      recognition.start();
    } catch (error) {
      setStatus({ state: "error", reason: error.name || "start-failed" });
      return;
    }

    return () => {
      stopped = true;
      recognition.abort();
    };
  }, [enabled, lang]);

  return status;
}

export default useSpeechRecognition;
