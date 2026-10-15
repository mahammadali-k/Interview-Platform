import { useEffect, useRef } from "react";

const Recognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// locale the browser's speech service expects for each interface language
const SPEECH_LOCALES = { en: "en-US", az: "az-AZ", ru: "ru-RU" };

export const isSpeechRecognitionSupported = Boolean(Recognition);

/**
 * Transcribes the local microphone with the browser's built-in speech recognition.
 * `onText({ text, final })` fires for interim and final results. Recognition restarts itself
 * after the silence timeouts that Chrome enforces, and stops while `enabled` is false.
 */
function useSpeechRecognition({ enabled, lang, onText }) {
  const handler = useRef(onText);

  useEffect(() => {
    handler.current = onText;
  });

  useEffect(() => {
    if (!enabled || !Recognition) return;

    const recognition = new Recognition();
    let stopped = false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LOCALES[lang] || "en-US";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (text) handler.current({ text, final: result.isFinal });
      }
    };

    recognition.onerror = (event) => {
      // permission denied or no speech service: retrying would only loop
      if (event.error === "not-allowed" || event.error === "service-not-allowed") stopped = true;
    };

    recognition.onend = () => {
      if (stopped) return;

      try {
        recognition.start();
      } catch {
        // already started
      }
    };

    try {
      recognition.start();
    } catch {
      return;
    }

    return () => {
      stopped = true;
      recognition.abort();
    };
  }, [enabled, lang]);
}

export default useSpeechRecognition;
