import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initLang } from "./lib/i18n";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Clerk's publishable key. It's safe to expose, it ends up in the browser anyway
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Data doesn't change much between page views, so skip refetching on every mount and tab focus.
// The live queries (sessions, quiz) switch polling on for themselves.
// Feeds the cursor spotlight on `.lift` cards: one delegated listener, throttled to once per frame
let spotlightFrame = 0;
document.addEventListener(
  "pointermove",
  (e) => {
    const card = e.target.closest?.(".lift");
    if (!card || spotlightFrame) return;

    spotlightFrame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      spotlightFrame = 0;
    });
  },
  { passive: true }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// Non-English dictionaries are separate chunks, so load the right one before the first paint
initLang().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
});
