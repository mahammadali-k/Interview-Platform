import { lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import HomeHubPage from "./pages/HomeHubPage";

// heavy pages (Monaco editor, video SDK) are loaded on demand
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const QuestionsPage = lazy(() => import("./pages/QuestionsPage"));

const PageLoader = () => <Spinner fullScreen />;

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const { pathname, search } = useLocation();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  // remember where the visitor was heading (e.g. an invite link) so sign-in can return there
  const protect = (element) =>
    isSignedIn ? element : <Navigate to={`/?redirect=${encodeURIComponent(pathname)}`} replace />;

  const redirect = new URLSearchParams(search).get("redirect");
  const redirectTarget = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  return (
    <>
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
        </Routes>
      </Suspense>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
