import { useEffect, useState } from "react";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// animates a number from its previous value to `target` using a single rAF loop
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame;
    let start;
    const from = value;

    const tick = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `value` is intentionally read only as the animation start point
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

export default useCountUp;
