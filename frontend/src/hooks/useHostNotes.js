import { useEffect, useRef, useState } from "react";
import { sessionApi } from "../api/sessions";

const SAVE_DELAY_MS = 800;

/**
 * The interviewer's private notes: loaded once from the session, then autosaved (debounced) to the
 * server so they follow the host from device to device.
 * @param {string} sessionId
 * @param {string | undefined} savedNotes  `hostNotes` of the polled session (host only)
 */
function useHostNotes(sessionId, savedNotes) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const loaded = useRef(false);
  const timer = useRef(null);

  // take the server's copy once; later polls mustn't overwrite what the host is typing
  useEffect(() => {
    if (loaded.current || savedNotes === undefined) return;

    loaded.current = true;
    setNotes(savedNotes);
  }, [savedNotes]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (value) => {
    setNotes(value);
    setStatus("saving");

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await sessionApi.saveNotes({ id: sessionId, notes: value });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, SAVE_DELAY_MS);
  };

  return { notes, status, update };
}

export default useHostNotes;
