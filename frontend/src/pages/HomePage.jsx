import { useSearchParams } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardCheckIcon,
  Code2Icon,
  FileTextIcon,
  MessagesSquareIcon,
  PlayIcon,
  ShieldCheckIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import AuroraBackground from "../components/AuroraBackground";
import IconTile from "../components/IconTile";
import Reveal from "../components/Reveal";

const HIGHLIGHTS = ["Live video & chat", "Shared code editor", "Instant PDF feedback"];

const LANGUAGES = [
  { name: "JavaScript", icon: "/javascript.svg" },
  { name: "Python", icon: "/python.svg" },
  { name: "Java", icon: "/java.svg" },
];

const FEATURES = [
  {
    icon: VideoIcon,
    title: "Face-to-face, built in",
    text: "HD video, screen sharing and chat live in the same room as the code. No extra tabs, no links to juggle.",
    span: "md:col-span-2",
  },
  {
    icon: Code2Icon,
    title: "Shared live editor",
    text: "Both sides edit the same code in real time and run it in a sandbox.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Quiz you control",
    text: "Write and edit your own questions, even during the interview. Answers are graded on the server.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Results you can trust",
    text: "Code is executed and judged server-side, so a result can not be faked from the browser.",
  },
  {
    icon: FileTextIcon,
    title: "Feedback that arrives",
    text: "A PDF with mistakes, corrections and the decision is generated and emailed automatically.",
  },
];

const STEPS = [
  { icon: UsersIcon, title: "Create a room", text: "Pick a problem and a time limit, then share the invite link." },
  { icon: MessagesSquareIcon, title: "Interview live", text: "Talk, code together and let the candidate answer the quiz." },
  { icon: FileTextIcon, title: "Decide and send", text: "End the session, add your notes and the candidate gets a PDF." },
];

function SignInCta({ children, className = "btn btn-primary" }) {
  // an invite link sends visitors here with ?redirect=/session/<id>
  const [params] = useSearchParams();
  const redirect = params.get("redirect");
  const target = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;

  return (
    <SignInButton mode="modal" forceRedirectUrl={target}>
      <button className={className}>{children}</button>
    </SignInButton>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen animate-fade bg-base-200">
      <header className="glass sticky top-0 z-50 border-b hairline">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Logo />

          <nav className="flex items-center gap-2">
            <a href="#features" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              Features
            </a>
            <a href="#how-it-works" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              How it works
            </a>
            <ThemeToggle />
            <SignInCta className="btn btn-primary btn-sm gap-2">
              Get Started
              <ArrowRightIcon className="size-4" />
            </SignInCta>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <AuroraBackground />
        <div className="hero-backdrop pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="space-y-8">
            <p
              className="animate-rise stagger inline-flex items-center gap-2 rounded-full border hairline bg-base-100/70 px-3 py-1 text-xs font-medium"
              style={{ "--i": 0 }}
            >
              <span className="size-1.5 rounded-full bg-success" />
              Technical interview platform
            </p>

            <h1
              className="animate-rise stagger text-4xl font-semibold leading-[1.08] tracking-tight lg:text-6xl"
              style={{ "--i": 1 }}
            >
              Run technical interviews in one <span className="text-gradient">shared workspace.</span>
            </h1>

            <p
              className="animate-rise stagger max-w-xl text-lg leading-relaxed text-base-content/70"
              style={{ "--i": 2 }}
            >
              Connect face-to-face, write and execute code together in real time, and evaluate candidates
              with a consistent, structured process.
            </p>

            <ul className="animate-rise stagger flex flex-wrap gap-x-6 gap-y-2" style={{ "--i": 3 }}>
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="animate-rise stagger flex flex-wrap items-center gap-3" style={{ "--i": 4 }}>
              <SignInCta className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/30">
                Start Coding Now
                <ArrowRightIcon className="size-5" />
              </SignInCta>
              <a href="#how-it-works" className="btn btn-ghost btn-lg gap-2">
                <PlayIcon className="size-4" />
                See how it works
              </a>
            </div>

            <div className="animate-rise stagger flex items-center gap-4" style={{ "--i": 5 }}>
              <span className="eyebrow">Run code in</span>
              <div className="flex gap-2">
                {LANGUAGES.map(({ name, icon }) => (
                  <img key={name} src={icon} alt={name} title={name} className="size-7 rounded-md" />
                ))}
              </div>
            </div>
          </div>

          <div className="animate-rise stagger relative" style={{ "--i": 3 }}>
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/30 via-transparent to-accent/30 blur-2xl" />
            <img
              src="/hero.svg"
              alt="Interview workspace with problem statement, code editor and video call"
              width="960"
              height="600"
              fetchPriority="high"
              className="animate-float w-full rounded-2xl border hairline shadow-2xl shadow-black/40"
            />
          </div>
        </div>
      </section>

      {/* FEATURES (bento) */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow mb-3">Capabilities</p>
          <h2 className="text-3xl font-semibold tracking-tight">Everything needed to run an interview</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, span = "" }, idx) => (
            <Reveal key={title} delay={idx * 80} className={span}>
            <article className="panel lift h-full p-7">
              <IconTile icon={Icon} className="mb-5" />
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-base-content/70">{text}</p>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-20 border-y hairline bg-base-100">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="text-3xl font-semibold tracking-tight">From invite to feedback in three steps</h2>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, idx) => (
              <li key={title} className="relative rounded-xl border hairline bg-base-200 p-6">
                <span className="absolute right-5 top-4 font-mono text-4xl font-bold text-base-content/10">
                  {idx + 1}
                </span>
                <Icon className="mb-4 size-6 text-primary" />
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-base-content/70">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="relative isolate overflow-hidden rounded-3xl border hairline bg-base-100 px-8 py-14 text-center">
          <AuroraBackground />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight">
            Ready to run your next interview?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base-content/70">
            Create a room in seconds and invite a candidate with a single link.
          </p>
          <div className="relative mt-8">
            <SignInCta className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/30">
              Get Started
              <ArrowRightIcon className="size-5" />
            </SignInCta>
          </div>
        </div>
      </section>

      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-base-content/50">
          <span>IP · Interview Platform</span>
          <span>Live video, shared code and feedback in one place.</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
