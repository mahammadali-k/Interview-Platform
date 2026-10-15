import { useEffect, useState } from "react";
import { LightbulbIcon } from "lucide-react";

const TIPS = [
  "Start with an easy warm-up question so the candidate relaxes before the real problem.",
  "Ask candidates to talk through their thinking: the reasoning matters more than the syntax.",
  "Give a time limit up front. A countdown keeps the interview focused and fair for everyone.",
  "Use the quiz for quick fundamentals, and the editor for how they actually solve problems.",
  "Write notes while the candidate codes. They are offered as feedback when you end the interview.",
  "Rate every interview. Over time the history shows who interviews consistently.",
  "End on a question from the candidate: it tells you what they care about.",
];

const ROTATE_MS = 3000;

function TipCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % TIPS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="panel relative overflow-hidden p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="eyebrow mb-4 flex items-center gap-2">
        <LightbulbIcon className="size-4 text-warning" />
        Interview tip
      </p>

      {/* key restarts the fade-in whenever the tip changes */}
      <p key={index} className="animate-rise min-h-16 text-lg leading-relaxed">
        {TIPS[index]}
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        {TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Tip ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-base-content/20 hover:bg-base-content/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default TipCarousel;
