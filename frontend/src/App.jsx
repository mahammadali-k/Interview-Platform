import { lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner";
import { useLang } from "./lib/i18n";

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";

// Only the landing page ships in the first bundle. Every other page loads when someone opens it,
// so a first visit stays snappy (and the heavy Monaco / video bits stay out of the way).
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"));
const HomeHubPage = lazy(() => import("./pages/HomeHubPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const QuestionsPage = lazy(() => import("./pages/QuestionsPage"));

const PageLoader = () => <Spinner fullScreen />;

function App() {
  useLang(); // subscribing here re-renders the whole tree when the language changes
  const { isSignedIn, isLoaded } = useUser();
  const { pathname, search } = useLocation();

  // wait until Clerk knows who is signed in, otherwise the wrong screen flashes for a moment
  if (!isLoaded) return null;

  // remember where the visitor was heading (an invite link, say) so we can send them back after sign-in
  const protect = (element) =>
    isSignedIn ? element : <Navigate to={`/?redirect=${encodeURIComponent(pathname)}`} replace />;

  const redirect = new URLSearchParams(search).get("redirect");
  const redirectTarget = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={
              !isSignedIn ? (
                <HomePage />
              ) : redirectTarget ? (
                <Navigate to={redirectTarget} replace />
              ) : (
                <HomeHubPage />
              )
            } />
          <Route path="/dashboard" element={protect(<DashboardPage />)} />
          <Route path="/problems" element={protect(<ProblemsPage />)} />
          <Route path="/history" element={protect(<HistoryPage />)} />
          <Route path="/questions" element={protect(<QuestionsPage />)} />
          <Route path="/problem/:id" element={protect(<ProblemPage />)} />
          <Route path="/session/:id" element={protect(<SessionPage />)} />
          <Route path="/session/:id/result" element={protect(<ResultPage />)} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Toaster toastOptions={{ duration: 3000 }} />
    </ErrorBoundary>
  );
}

export default App;
