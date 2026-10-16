import { useEffect, useState } from "react";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 1500;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Types a phrase, holds it for a moment, erases it, then moves on to the next one
function Typewriter({ phrases }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(() => (reducedMotion() ? phrases[0] : ""));
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;

    const phrase = phrases[index];
    let timer;

    if (!erasing && text === phrase) {
      timer = setTimeout(() => setErasing(true), HOLD_MS);
    } else if (erasing && text === "") {
      setErasing(false);
      setIndex((i) => (i + 1) % phrases.length);
    } else {
      timer = setTimeout(
        () => setText(erasing ? phrase.slice(0, text.length - 1) : phrase.slice(0, text.length + 1)),
        erasing ? ERASE_MS : TYPE_MS
      );
    }

    return () => clearTimeout(timer);
  }, [text, erasing, index, phrases]);

  return (
    <span aria-live="off">
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-[blink_1s_steps(1)_infinite] bg-primary align-middle" style={{ height: "1em" }} />
    </span>
  );
}

export default Typewriter;
