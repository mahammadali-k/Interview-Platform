import { Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import {
  BookOpenIcon,
  ClockIcon,
  HistoryIcon,
  ListChecksIcon,
  PlusIcon,
  RadioIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import AuroraBackground from "../components/AuroraBackground";
import Typewriter from "../components/Typewriter";
import JoinByLink from "../components/JoinByLink";
import StatTile from "../components/StatTile";
import IconTile from "../components/IconTile";
import DailyChallenge from "../components/DailyChallenge";
import ActivityHeatmap from "../components/ActivityHeatmap";
import TipCarousel from "../components/TipCarousel";
import { useActiveSessions, useHistory } from "../hooks/useSessions";
import { formatDuration } from "../lib/utils";

const PHRASES = [
  "run technical interviews.",
  "review every answer.",
  "send feedback in one click.",
  "build your question bank.",
];

const SHORTCUTS = [
  { to: "/dashboard?new=1", label: "New interview", text: "Pick a problem and invite a candidate", icon: PlusIcon },
  { to: "/questions", label: "Question bank", text: "Write and edit your own quiz questions", icon: ListChecksIcon },
  { to: "/history", label: "History", text: "Results, time spent and mistakes", icon: HistoryIcon },
  { to: "/problems", label: "Practice", text: "Solve problems on your own", icon: BookOpenIcon },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

// the signed-in landing page: greeting, live numbers, a daily problem and an activity calendar
function HomeHubPage() {
  const { user } = useUser();
  const { data: history } = useHistory();
  const { data: active } = useActiveSessions();

  const interviews = history?.interviews || [];
  const accepted = interviews.filter((item) => item.verdict === "accepted").length;
  const totalSeconds = interviews.reduce((sum, item) => sum + item.durationSeconds, 0);

  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <Navbar />

      {/* HERO */}
      <header className="relative isolate overflow-hidden border-b hairline bg-base-100">
        <AuroraBackground />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="eyebrow animate-rise">Home</p>

            <h1 className="animate-rise stagger text-4xl font-semibold leading-tight tracking-tight lg:text-5xl" style={{ "--i": 1 }}>
              {greeting()}, <span className="text-gradient">{user?.firstName || "there"}</span>
            </h1>

            <p className="animate-rise stagger min-h-8 text-xl text-base-content/70" style={{ "--i": 2 }}>
              Let&apos;s <Typewriter phrases={PHRASES} />
            </p>

            <div className="animate-rise stagger flex flex-wrap gap-3" style={{ "--i": 3 }}>
              <Link to="/dashboard?new=1" className="btn btn-primary gap-2 shadow-lg shadow-primary/30">
                <PlusIcon className="size-4" />
                Create session
              </Link>
              <Link to="/dashboard" className="btn btn-ghost gap-2">
                <RadioIcon className="size-4" />
                Live sessions
              </Link>
            </div>

            <div className="animate-rise stagger" style={{ "--i": 4 }}>
              <JoinByLink />
            </div>
          </div>

          <div className="animate-rise stagger relative" style={{ "--i": 2 }}>
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/30 via-transparent to-accent/30 blur-2xl" />
            <img
              src="/home-illustration.svg"
              alt="An interviewer and a candidate working on code together"
              width="640"
              height="480"
              fetchPriority="high"
              className="w-full rounded-3xl border hairline shadow-2xl shadow-black/40"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        {/* LIVE NUMBERS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Live now" value={active?.sessions.length ?? 0} icon={RadioIcon} live />
          <StatTile label="Interviews" value={interviews.length} icon={UsersIcon} />
          <StatTile
            label="Accepted"
            value={accepted}
            tone="success"
            icon={TrophyIcon}
            hint={interviews.length ? `${Math.round((accepted / interviews.length) * 100)}% of finished` : undefined}
          />
          <StatTile label="Time interviewing" value={formatDuration(totalSeconds)} icon={ClockIcon} />
        </div>

        {/* DAILY CHALLENGE + ACTIVITY */}
        <div className="grid gap-6 lg:grid-cols-3">
          <DailyChallenge />

          <section className="panel p-6 lg:col-span-2">
            <p className="eyebrow mb-5">Your activity</p>
            <ActivityHeatmap dates={interviews.map((item) => item.endedAt)} />
          </section>
        </div>

        <TipCarousel />

        {/* SHORTCUTS */}
        <section>
          <p className="eyebrow mb-4">Jump to</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHORTCUTS.map(({ to, label, text, icon: Icon }, idx) => (
              <Link
                key={to}
                to={to}
                className="panel lift group animate-rise stagger flex flex-col gap-3 p-5"
                style={{ "--i": idx }}
              >
                <IconTile
                  icon={Icon}
                  className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                />
                <span className="font-semibold">{label}</span>
                <span className="text-sm text-base-content/60">{text}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomeHubPage;
