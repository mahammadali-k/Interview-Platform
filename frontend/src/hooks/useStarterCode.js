import { useCallback, useEffect, useState } from "react";

/**
 * Editor state shared by the practice page and the live session: the selected language, the code,
 * and the starter code of the current problem.
 *
 * - the code resets to the starter when the problem changes
 * - `changeLanguage` swaps in the starter code of the new language
 * - `setCode` / `setLanguage` are exposed for changes that come from somewhere else (the other person)
 */
function useStarterCode(problem, initialLanguage = "javascript") {
  const starterFor = useCallback((lang) => problem?.starterCode?.[lang] || "", [problem]);

  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(() => starterFor(initialLanguage));

  // load the starter code once the problem is known, and again whenever it changes
  useEffect(() => {
    if (problem) setCode(problem.starterCode?.[language] || "");
    // the language is left out on purpose: switching it goes through changeLanguage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  const changeLanguage = useCallback(
    (next) => {
      const starter = starterFor(next);

      setLanguage(next);
      setCode(starter);
      return starter;
    },
    [starterFor]
  );

  const reset = useCallback(() => {
    const starter = starterFor(language);

    setCode(starter);
    return starter;
  }, [starterFor, language]);

  return { language, code, setLanguage, setCode, changeLanguage, reset };
}

export default useStarterCode;
