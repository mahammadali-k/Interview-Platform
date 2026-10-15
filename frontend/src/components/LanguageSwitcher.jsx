import { CheckIcon, GlobeIcon } from "lucide-react";
import { LANGUAGES, setLang, t, useLang } from "../lib/i18n";

// AZ / EN / RU dropdown (daisyUI dropdown works with focus, so no extra state is needed)
function LanguageSwitcher() {
  const { lang } = useLang();
  const active = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-1.5"
        aria-label={t("lang.label", "Language")}
        title={t("lang.label", "Language")}
      >
        <GlobeIcon className="size-4" />
        <span className="font-mono text-xs">{active.short}</span>
      </button>

      <ul tabIndex={0} className="dropdown-content panel z-[60] mt-2 w-44 p-1 shadow-xl">
        {LANGUAGES.map(({ code, label }) => (
          <li key={code}>
            <button
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-base-200"
              onClick={() => {
                setLang(code);
                document.activeElement?.blur();
              }}
            >
              {label}
              {code === lang && <CheckIcon className="size-4 text-primary" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;
