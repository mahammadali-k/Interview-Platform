import { useEffect, useState } from "react";
import { LightbulbIcon } from "lucide-react";
import { t } from "../lib/i18n";

const getTips = () => [
  t("tip.1", "Start with an easy warm-up question so the candidate relaxes before the real problem."),
  t("tip.2", "Ask candidates to talk through their thinking: the reasoning matters more than the syntax."),
  t("tip.3", "Give a time limit up front. A countdown keeps the interview focused and fair for everyone."),
  t("tip.4", "Use the quiz for quick fundamentals, and the editor for how they actually solve problems."),
  t("tip.5", "Write notes while the candidate codes. They are offered as feedback when you end the interview."),
  t("tip.6", "Rate every interview. Over time the history shows who interviews consistently."),
  t("tip.7", "End on a question from the candidate: it tells you what they care about."),
];

const ROTATE_MS = 3000;

function TipCarousel() {
  const tips = getTips();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % tips.length), ROTATE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <section
      className="panel relative overflow-hidden p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="eyebrow mb-4 flex items-center gap-2">
        <LightbulbIcon className="size-4 text-warning" />
        {t("tip.title", "Interview tip")}
      </p>

      {/* key restarts the fade-in whenever the tip changes */}
      <p key={index} className="animate-rise min-h-16 text-lg leading-relaxed">
        {tips[index]}
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={t("tip.n", "Tip {n}", { n: i + 1 })}
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
