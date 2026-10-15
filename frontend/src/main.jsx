import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initLang } from "./lib/i18n";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// data rarely changes between page views, so avoid refetching on every mount and tab focus;
// the live queries (sessions, quiz) opt in to polling themselves
// feeds the cursor spotlight of `.lift` cards (one delegated listener, coalesced per frame)
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

// the dictionary of a non-English language is a separate chunk: have it ready before the first paint
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
