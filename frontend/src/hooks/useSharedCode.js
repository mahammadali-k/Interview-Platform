import { useCallback, useEffect, useRef } from "react";

const SEND_DELAY_MS = 250;

/**
 * Keeps the code editor and selected language in sync between the interviewer and the
 * candidate using custom events on the session's Stream chat channel (no extra backend).
 *
 * - local edits are sent explicitly through `broadcast` (debounced) as `code.update`
 * - a joining client sends `code.request`; the peer answers with its current code
 * - last write wins, which is fine for a 1-on-1 interview
 *
 * Nothing is broadcast on load or when a remote change is applied, so a late joiner can
 * never overwrite the code that is already in the room.
 */
function useSharedCode({ channel, userId, code, language, onRemoteChange }) {
  const current = useRef({ code, language });
  const synced = useRef({ code, language });
  const onRemote = useRef(onRemoteChange);
  const timer = useRef(null);

  current.current = { code, language };
  onRemote.current = onRemoteChange;

  useEffect(() => {
    if (!channel) return;

    const subscription = channel.on((event) => {
      if (event.user?.id === userId) return;

      if (event.type === "code.update") {
        synced.current = { code: event.code, language: event.language };
        onRemote.current({ code: event.code, language: event.language });
      } else if (event.type === "code.request") {
        channel.sendEvent({ type: "code.update", ...current.current }).catch(() => {});
      }
    });

    // ask whoever is already in the room for the current code
    channel.sendEvent({ type: "code.request" }).catch(() => {});

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer.current);
    };
  }, [channel, userId]);

  const broadcast = useCallback(
    (nextCode, nextLanguage) => {
      if (!channel) return;
      if (nextCode === synced.current.code && nextLanguage === synced.current.language) return;

      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        synced.current = { code: nextCode, language: nextLanguage };
        channel.sendEvent({ type: "code.update", code: nextCode, language: nextLanguage }).catch(() => {});
      }, SEND_DELAY_MS);
    },
    [channel]
  );

  return { broadcast };
}

export default useSharedCode;
