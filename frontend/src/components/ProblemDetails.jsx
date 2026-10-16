import { memo } from "react";
import { t } from "../lib/i18n";

function Section({ title, children }) {
  return (
    <section className="panel animate-rise p-5">
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </section>
  );
}

// Description, examples and constraints, shared by the practice page and the live session
function ProblemDetails({ problem }) {
  if (!problem) return null;

  const { description, examples, constraints } = problem;

  return (
    <div className="space-y-4 p-5">
      {description && (
        <Section title={t("problem.description", "Description")}>
          <div className="space-y-3 leading-relaxed text-base-content/90">
            <p>{description.text}</p>
            {description.notes?.map((note, idx) => (
              <p key={idx}>{note}</p>
            ))}
          </div>
        </Section>
      )}

      {examples?.length > 0 && (
        <Section title={t("problem.examples", "Examples")}>
          <div className="space-y-4">
            {examples.map((example, idx) => (
              <div key={idx}>
                <p className="mb-2 text-sm font-medium">{t("problem.example", "Example {n}", { n: idx + 1 })}</p>
                <div className="space-y-1.5 rounded-lg border hairline bg-base-200 p-4 font-mono text-sm">
                  <div className="flex gap-3">
                    <span className="min-w-[64px] text-base-content/50">{t("problem.input", "Input")}</span>
                    <span>{example.input}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="min-w-[64px] text-base-content/50">{t("problem.output", "Output")}</span>
                    <span>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <p className="mt-2 border-t hairline pt-2 font-sans text-xs text-base-content/60">
                      {example.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {constraints?.length > 0 && (
        <Section title={t("problem.constraints", "Constraints")}>
          <ul className="space-y-2">
            {constraints.map((constraint, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="text-base-content/40">—</span>
                <code>{constraint}</code>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default memo(ProblemDetails);
