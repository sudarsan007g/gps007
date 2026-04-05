import { Button } from "@/components/ui/button";
import { ShieldCheck, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import type { Session, User as UserType } from "../types/auth";
import {
  clearSession,
  findUserById,
  getSession,
} from "../utils/authStore";
import { useAppStore } from "../store/appStore";
import { logger } from "../services/logger";
import HomePage from "./app/HomePage";
import ProfilePage from "./app/ProfilePage";

// Lazy load MapPage for code splitting
const MapPage = lazy(() => {
  logger.info("Loading MapPage...");
  return import("./app/MapPage").then((module) => {
    logger.info("MapPage loaded");
    return module;
  });
});

// Fallback component while MapPage loads
function MapPageFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground/80 animate-spin" />
    </div>
  );
}

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  const {
    user,
    setUser,
    session,
    setSession,
    isAuthLoading,
    setAuthLoading,
    activePage,
    setActivePage,
    trackerOn,
    setTrackerOn,
  } = useAppStore();
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const s = await getSession();
        if (!active) return;
        if (!s) {
          onLogout();
          return;
        }
        const currentUser = await findUserById(s.userId);
        if (!active) return;
        if (!currentUser) {
          onLogout();
          return;
        }
        setSession(s);
        setUser(currentUser);
      } catch {
        if (!active) return;
        onLogout();
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [onLogout, setSession, setUser, setAuthLoading]);

  const handleLogout = async () => {
    await clearSession();
    onLogout();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-foreground/20 border-t-foreground/80 animate-spin" />
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Circuit Board Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.58 0.19 145 / 0.1)" />
              <stop offset="50%" stopColor="oklch(0.5 0.15 200 / 0.05)" />
              <stop offset="100%" stopColor="oklch(0.58 0.19 145 / 0.1)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Circuit line nodes and connections */}
        <motion.svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.12, 0.08] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {/* Horizontal circuit lines */}
          <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="10%" y1="40%" x2="90%" y2="40%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="10%" y1="80%" x2="90%" y2="80%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />

          {/* Vertical circuit lines */}
          <line x1="20%" y1="10%" x2="20%" y2="90%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="40%" y1="10%" x2="40%" y2="90%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />
          <line x1="80%" y1="10%" x2="80%" y2="90%" stroke="oklch(0.58 0.19 145)" strokeWidth="1" />

          {/* Connection nodes */}
          {[
            { x: 20, y: 20 },
            { x: 40, y: 40 },
            { x: 60, y: 60 },
            { x: 80, y: 20 },
            { x: 20, y: 80 },
            { x: 80, y: 80 },
          ].map((pos, i) => (
            <motion.circle
              key={i}
              cx={`${pos.x}%`}
              cy={`${pos.y}%`}
              r="3"
              fill="oklch(0.58 0.19 145)"
              animate={{
                r: [3, 5, 3],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.svg>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, oklch(0.58 0.19 145 / 0.05), transparent 60%)",
          }}
        />
      </div>

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header - Logo and Profile Button */}
              <motion.div
                className="flex items-center justify-between gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Logo + Name */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.18 195), oklch(0.45 0.15 265))",
                    }}
                  >
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-base text-foreground">
                    SecureAuth
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Profile Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    data-ocid="header.profile_button"
                    onClick={() => setActivePage("profile")}
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    aria-label="View profile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              {/* Welcome Banner */}
              <motion.div
                className="rounded-lg border border-border/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 mb-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-foreground">
                    Welcome to SecureAuth
                  </h2>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">
                      System active and ready to track
                    </span>
                  </div>
                </div>
              </motion.div>

              {activePage === "home" ? (
                <HomePage
                  onOpenMap={() => setActivePage("map")}
                  user={user}
                  session={session}
                />
              ) : activePage === "map" ? (
                <Suspense fallback={<MapPageFallback />}>
                  <MapPage onBack={() => setActivePage("home")} trackerOn={trackerOn} onTurnOff={() => setTrackerOn(false)} />
                </Suspense>
              ) : (
                <ProfilePage
                  user={user}
                  theme={theme}
                  onBack={() => setActivePage("home")}
                  onToggleTheme={toggleTheme}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            © {new Date().getFullYear()}.{" "}
            <a
              href="https://secureauth.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              SecureAuth
            </a>
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}
