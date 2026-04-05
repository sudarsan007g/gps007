import { Toaster } from "@/components/ui/sonner";
import { onAuthStateChanged } from "firebase/auth";
import { Suspense, lazy, useEffect, useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { firebaseAuth } from "./lib/firebase";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { logger } from "./services/logger";
import AuthPage from "./pages/AuthPage";
import { findUserById, getSession } from "./utils/authStore";

// Lazy load Dashboard with performance tracking
const Dashboard = lazy(() => {
  logger.performance("Dashboard-lazy-load-start", 0);
  return import("./pages/Dashboard").then((module) => {
    logger.performance("Dashboard-lazy-load-complete", Date.now());
    return module;
  });
});

type Screen = "auth" | "dashboard";

// Loading fallback component
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.12 0.03 265)" }}
    >
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [ready, setReady] = useState(false);

  // On mount: wait for Firebase Auth to restore its session, then check ours.
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth, () => {
      // This fires once Auth has resolved the persisted user (or null).
      unsubscribe();
      void (async () => {
        try {
          const session = await getSession();
          if (session) {
            const user = await findUserById(session.userId);
            if (active && user) {
              setScreen("dashboard");
            }
          }
        } catch (err) {
          logger.error("Auth check failed", err as Error);
          // Ignore startup auth errors and continue to auth screen.
        } finally {
          if (active) {
            setReady(true);
          }
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!ready) {
    // Brief loading state while session check runs
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster position="top-center" richColors />
        {screen === "auth" ? (
          <AuthPage onLoginSuccess={() => setScreen("dashboard")} />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard onLogout={() => setScreen("auth")} />
          </Suspense>
        )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
