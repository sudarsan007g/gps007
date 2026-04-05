import { Button } from "@/components/ui/button";
import {
  BatteryMedium,
  Clock,
  Power,
  PowerOff,
  RefreshCw,
  Signal,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session, User } from "../../types/auth";
import { useAppStore } from "../../store/appStore";
import { TRACKER_HINT_SEEN_KEY, ANIMATION_FAST_MS, TOAST_DEFAULT_DURATION_MS, ANIMATION_NORMAL_MS } from "../../constants";

interface DeviceStatus {
  battery: number;
  signal: number; // 0-4
  lastSeen: string;
}

function randomStatus(): DeviceStatus {
  return {
    battery: Math.floor(Math.random() * 100),
    signal: Math.floor(Math.random() * 5),
    lastSeen: new Date().toISOString(),
  };
}

function getBatteryBg(level: number): string {
  if (level >= 60) return "oklch(0.62 0.17 155)";
  if (level >= 30) return "oklch(0.78 0.15 75)";
  return "oklch(0.577 0.245 27.325)";
}

function getBatteryTrack(level: number): string {
  if (level >= 60) return "oklch(0.62 0.17 155 / 0.15)";
  if (level >= 30) return "oklch(0.78 0.15 75 / 0.15)";
  return "oklch(0.577 0.245 27.325 / 0.15)";
}

function getBatteryTextColor(level: number): string {
  if (level >= 60) return "text-success";
  if (level >= 30) return "text-warning";
  return "text-destructive";
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface HomePageProps {
  onOpenMap?: () => void;
  user?: User;
  session?: Session;
}

export default function HomePage({ onOpenMap, user, session }: HomePageProps) {
  const { trackerOn, setTrackerOn } = useAppStore();
  
  const [status, setStatus] = useState<DeviceStatus>({
    battery: 73,
    signal: 3,
    lastSeen: new Date().toISOString(),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [batteryKey, setBatteryKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(TRACKER_HINT_SEEN_KEY) === "1") {
      return;
    }

    sessionStorage.setItem(TRACKER_HINT_SEEN_KEY, "1");
    toast("Device tracking is ready", {
      description: "Use Commands and tap ON to trigger live device tracking.",
      duration: TOAST_DEFAULT_DURATION_MS,
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, ANIMATION_NORMAL_MS));
    setStatus(randomStatus());
    setBatteryKey((k) => k + 1);
    setRefreshing(false);
    toast.success("Status refreshed");
  };

  const handleOn = () => {
    setPanelOpen(false);
    setTrackerOn(true);
    onOpenMap?.();
    setTimeout(() => {
      toast.success("Tracker activated", {
        description: "Opening map view for live location.",
      });
    }, ANIMATION_FAST_MS);
  };

  const handleOff = () => {
    setPanelOpen(false);
    setTrackerOn(false);
    setTimeout(() => {
      toast.warning("Tracker deactivated", {
        description: "Device status updates are paused.",
      });
    }, ANIMATION_FAST_MS);
  };



  return (
    <div className="space-y-4">
      {/* Status Card */}
      <motion.div
        data-ocid="home.status_card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-[320px] rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "oklch(0.62 0.17 155)" }}
            />
            <span className="text-[11px] font-semibold text-foreground font-display uppercase tracking-wide">
              Device Status
            </span>

            {/* Tracking badge */}
            <div
              data-ocid="home.tracker_badge"
              className="flex items-center gap-1 ml-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all duration-500 shrink-0"
              style={{
                background: trackerOn
                  ? "oklch(0.58 0.19 145 / 0.15)"
                  : "oklch(var(--muted) / 0.5)",
                border: trackerOn
                  ? "1px solid oklch(0.58 0.19 145 / 0.4)"
                  : "1px solid oklch(var(--border) / 0.4)",
              }}
            >
              {trackerOn ? (
                <>
                  <span
                    className="w-1 h-1 rounded-full animate-pulse"
                    style={{ background: "oklch(0.58 0.19 145)" }}
                  />
                  <span style={{ color: "oklch(0.52 0.19 145)" }}>
                    Tracking Live
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "oklch(var(--muted-foreground))" }}
                  />
                  <span className="text-muted-foreground">Offline</span>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            data-ocid="home.refresh_button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-foreground px-1.5 shrink-0"
          >
            <RefreshCw
              className={`h-2.5 w-2.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="p-3 space-y-3">
          {/* Battery */}
          <div data-ocid="home.battery_progress">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <BatteryMedium className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Battery Level
                </span>
              </div>
              <span
                className={`text-[11px] font-bold ${getBatteryTextColor(status.battery)}`}
              >
                {status.battery}%
              </span>
            </div>
            {/* Progress track */}
            <div
              className="relative h-1.5 rounded-full overflow-hidden"
              style={{ background: getBatteryTrack(status.battery) }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={batteryKey}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: getBatteryBg(status.battery) }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${status.battery}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </AnimatePresence>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground/60">0%</span>
              <span className="text-[9px] text-muted-foreground/60">100%</span>
            </div>
          </div>

          {/* Signal Strength */}
          <div data-ocid="home.signal_display">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Signal className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Signal Strength
                </span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {status.signal}/4
              </span>
            </div>
            <div className="flex items-end gap-1 h-6">
              {[1, 2, 3, 4].map((bar) => {
                const active = bar <= status.signal;
                const height =
                  bar === 1
                    ? "h-1.5"
                    : bar === 2
                      ? "h-3"
                      : bar === 3
                        ? "h-4"
                        : "h-6";
                return (
                  <motion.div
                    key={bar}
                    className={`flex-1 rounded-sm transition-all duration-300 ${height}`}
                    style={{
                      background: active
                        ? status.signal >= 3
                          ? "oklch(0.62 0.17 155)"
                          : status.signal >= 2
                            ? "oklch(0.78 0.15 75)"
                            : "oklch(0.577 0.245 27.325)"
                        : "oklch(var(--muted))",
                      opacity: active ? 1 : 0.3,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: bar * 0.07, duration: 0.35 }}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {status.signal === 0
                ? "No signal"
                : status.signal === 1
                  ? "Weak signal"
                  : status.signal === 2
                    ? "Fair signal"
                    : status.signal === 3
                      ? "Good signal"
                      : "Excellent signal"}
            </p>
          </div>

          {/* Last Seen */}
          <div
            data-ocid="home.lastseen_display"
            className="flex items-center gap-2 rounded-lg p-2"
            style={{ background: "oklch(var(--muted) / 0.5)" }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "oklch(var(--accent) / 0.2)" }}
            >
              <Clock className="h-3 w-3 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">
                Last Seen
              </p>
              <p className="text-[11px] font-semibold text-foreground">
                {formatDateTime(status.lastSeen)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

{/* ── Quick Commands Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground self-start px-1">
          Quick Commands
        </h3>

        {/* Central trigger button */}
        <div className="relative flex flex-col items-center gap-2">
          {/* Pulsing halo (only when closed) */}
          <AnimatePresence>
            {!panelOpen && (
              <motion.div
                key="halo"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 80,
                  height: 80,
                  background:
                    "radial-gradient(circle, oklch(0.55 0.18 195 / 0.25) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{
                  duration: 2.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <motion.button
            data-ocid="quickcmd.toggle_button"
            type="button"
            aria-label={
              panelOpen ? "Close quick commands" : "Open quick commands"
            }
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
            className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{
              background: panelOpen
                ? "linear-gradient(135deg, oklch(0.42 0.15 265), oklch(0.35 0.12 220))"
                : "linear-gradient(135deg, oklch(0.55 0.18 195), oklch(0.45 0.18 265))",
              boxShadow: panelOpen
                ? "0 0 0 3px oklch(0.45 0.18 265 / 0.5), 0 8px 32px oklch(0.45 0.18 265 / 0.4)"
                : "0 0 0 3px oklch(0.55 0.18 195 / 0.4), 0 8px 32px oklch(0.55 0.18 195 / 0.35)",
            }}
            animate={{
              rotate: panelOpen ? 45 : 0,
              scale: panelOpen ? 1.08 : 1,
            }}
            whileHover={{ scale: panelOpen ? 1.1 : 1.06 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            {/* Inner ring */}
            <div
              className="absolute inset-2 rounded-full opacity-30"
              style={{ border: "1.5px solid white" }}
            />
            <Zap className="h-7 w-7 text-white drop-shadow" />
          </motion.button>

          {/* Label */}
          <motion.span
            className="text-xs font-bold uppercase tracking-widest"
            style={{
              color: panelOpen
                ? "oklch(0.55 0.18 265)"
                : "oklch(0.55 0.18 195)",
            }}
            animate={{ opacity: 1 }}
          >
            {panelOpen ? "Close" : "Commands"}
          </motion.span>
        </div>

        {/* On / Off button pair — slides in below trigger when open */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="cmd-panel"
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              className="w-full"
            >
              {/* Subtle card container */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border) / 0.6)",
                  boxShadow: "0 4px 24px oklch(0 0 0 / 0.06)",
                }}
              >
                <p className="text-[11px] text-muted-foreground text-center mb-4 uppercase tracking-widest font-medium">
                  Tracker Control
                </p>

                <div className="flex justify-center">
                  {/* Morphing Blob ON Button */}
                  <motion.div
                    className="relative flex items-center justify-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    {/* Particle burst container */}
                    {trackerOn && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={`particle-${i}`}
                            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                            style={{
                              background: "oklch(0.58 0.19 145)",
                              left: "50%",
                              top: "50%",
                            }}
                            animate={{
                              x: Math.cos((i * Math.PI) / 3) * 40,
                              y: Math.sin((i * Math.PI) / 3) * 40,
                              opacity: [1, 0],
                              scale: [1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* Main morphing button */}
                    <motion.button
                      data-ocid="quickcmd.on_button"
                      type="button"
                      aria-label="Turn tracker on"
                      onClick={handleOn}
                      className="relative w-14 h-14 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center justify-center font-bold text-white shadow-lg"
                      style={{
                        background: trackerOn
                          ? "linear-gradient(135deg, oklch(0.58 0.19 145), oklch(0.60 0.18 150))"
                          : "oklch(0.58 0.19 145 / 0.2)",
                        borderRadius: trackerOn ? "40%" : "50%",
                        border: trackerOn
                          ? "2px solid oklch(0.58 0.19 145 / 0.6)"
                          : "2px solid oklch(0.58 0.19 145 / 0.2)",
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        borderRadius: trackerOn ? ["40%", "60%", "40%", "50%"] : "50%",
                      }}
                      whileHover={{
                        scale: 1.2,
                        boxShadow: trackerOn
                          ? "0 0 40px oklch(0.58 0.19 145 / 0.8)"
                          : "0 0 20px oklch(0.58 0.19 145 / 0.4)",
                      }}
                      whileTap={{
                        scale: 0.88,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 18,
                        borderRadius: trackerOn
                          ? { duration: 2, repeat: Number.POSITIVE_INFINITY }
                          : undefined,
                      }}
                    >
                      {/* Animated gradient overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-full opacity-40"
                        style={{
                          background: trackerOn
                            ? "linear-gradient(45deg, transparent, oklch(1 0 0 / 0.5), transparent)"
                            : "transparent",
                        }}
                        animate={{
                          backgroundPosition: trackerOn ? ["0% 0%", "200% 200%"] : "0% 0%",
                        }}
                        transition={{
                          duration: 3,
                          repeat: trackerOn ? Number.POSITIVE_INFINITY : 0,
                          ease: "linear",
                        }}
                      />

                      {/* Icon text */}
                      <motion.div
                        animate={{
                          y: trackerOn ? [0, -4, 0] : 0,
                          rotate: trackerOn ? [0, 360] : 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: trackerOn ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        <Power
                          className="h-6 w-6"
                          style={{
                            color: trackerOn ? "white" : "oklch(0.58 0.19 145)",
                            filter: trackerOn ? "drop-shadow(0 0 8px oklch(0.58 0.19 145 / 0.8))" : "none",
                          }}
                        />
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </div>

                {/* Status hint */}
                <p
                  className="text-[11px] text-center mt-4 font-medium"
                  style={{
                    color: trackerOn
                      ? "oklch(0.52 0.19 145)"
                      : "oklch(0.5 0.22 27.325)",
                  }}
                >
                  {trackerOn
                    ? "Tracker is running"
                    : "Tracker is off — tap ON to start"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
