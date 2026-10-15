import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { BookOpenIcon, HistoryIcon, HouseIcon, LayoutDashboardIcon, ListChecksIcon, SearchIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import CommandPalette from "./CommandPalette";

const LINKS = [
  { to: "/", label: "Home", icon: HouseIcon },
  { to: "/problems", label: "Problems", icon: BookOpenIcon },
  { to: "/questions", label: "Questions", icon: ListChecksIcon },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function Navbar() {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Ctrl/Cmd + K toggles the command palette from anywhere
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b hairline">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Logo />

          <div className="flex items-center gap-1">
            {LINKS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex h-14 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors lg:px-4 ${
                    active
                      ? "border-primary text-base-content"
                      : "border-transparent text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}

            <button
              className="btn btn-ghost btn-sm ml-2 hidden gap-2 border hairline text-base-content/60 sm:flex"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
            >
              <SearchIcon className="size-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="kbd kbd-xs">{isMac ? "⌘" : "Ctrl"} K</kbd>
            </button>

            <div className="ml-3 flex items-center gap-2">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

export default Navbar;
