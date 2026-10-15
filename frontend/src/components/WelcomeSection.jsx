import { useUser } from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";
import AuroraBackground from "./AuroraBackground";
import { t } from "../lib/i18n";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12
    ? t("greet.morning", "Good morning")
    : hour < 18
      ? t("greet.afternoon", "Good afternoon")
      : t("greet.evening", "Good evening");
};

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <header className="relative isolate overflow-hidden border-b hairline bg-base-100">
      <AuroraBackground />

      <div className="animate-rise relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 py-12">
        <div>
          <p className="eyebrow mb-3">{t("nav.dashboard", "Dashboard")}</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {greeting()}, <span className="text-gradient">{user?.firstName || "there"}</span>
          </h1>
          <p className="mt-2 text-base-content/60">{t("dash.subtitle", "Start a session or rejoin one that is live.")}</p>
        </div>

        <button onClick={onCreateSession} className="btn btn-primary gap-2 shadow-lg shadow-primary/30">
          <PlusIcon className="size-4" />
          {t("dash.create", "Create Session")}
        </button>
      </div>
    </header>
  );
}

export default WelcomeSection;
