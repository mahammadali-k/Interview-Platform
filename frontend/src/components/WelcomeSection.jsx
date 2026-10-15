import { useUser } from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";
import AuroraBackground from "./AuroraBackground";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <header className="relative isolate overflow-hidden border-b hairline bg-base-100">
      <AuroraBackground />

      <div className="animate-rise relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 py-12">
        <div>
          <p className="eyebrow mb-3">Dashboard</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {greeting()}, <span className="text-gradient">{user?.firstName || "there"}</span>
          </h1>
          <p className="mt-2 text-base-content/60">Start a session or rejoin one that is live.</p>
        </div>

        <button onClick={onCreateSession} className="btn btn-primary gap-2 shadow-lg shadow-primary/30">
          <PlusIcon className="size-4" />
          Create Session
        </button>
      </div>
    </header>
  );
}

export default WelcomeSection;
