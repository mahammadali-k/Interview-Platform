import { Link } from "react-router";

// "IP" monogram with a text caret: a nod to code editing. The caret blinks via CSS (opacity only).
function LogoMark({ className = "size-9" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a9ad0" />
          <stop offset="1" stopColor="#355f96" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logo-gradient)" />
      <rect x="5" y="8" width="4" height="16" rx="1" fill="#fff" />
      <path
        fillRule="evenodd"
        fill="#fff"
        d="M11 8h8a5 5 0 0 1 0 10h-4v6h-4z M15 11.5v3h4a1.5 1.5 0 0 0 0-3z"
      />
      <rect
        x="26"
        y="17"
        width="2.4"
        height="7"
        rx="0.8"
        fill="#fff"
        className="animate-[blink_1.2s_steps(1)_infinite]"
      />
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="IP - Interview Platform, home">
      <span className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
        <LogoMark />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">IP</span>
        <span className="mt-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-base-content/55 transition-colors group-hover:text-primary">
          Interview Platform
        </span>
      </span>
    </Link>
  );
}

export default Logo;
