import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BellRing,
  Clock,
  Copy,
  Lock,
  ShieldOff,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  loadCommandHistory,
  loadLocationEntries,
  saveCommandHistory,
  type CommandEntry,
  type LocationEntry,
} from "../../utils/firebaseDataStore";

type CommandType = "lock" | "alert" | "wipe";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const COMMAND_META: Record<
  CommandType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    borderHover: string;
  }
> = {
  lock: {
    label: "Lock Device",
    icon: Lock,
    color: "oklch(0.55 0.18 220)",
    bg: "oklch(0.62 0.17 220 / 0.12)",
    borderHover: "hover:border-blue-400/50",
  },
  alert: {
    label: "Trigger Alert",
    icon: BellRing,
    color: "oklch(0.68 0.18 75)",
    bg: "oklch(0.78 0.15 75 / 0.12)",
    borderHover: "hover:border-amber-400/50",
  },
  wipe: {
    label: "Remote Wipe",
    icon: ShieldOff,
    color: "oklch(0.577 0.245 27.325)",
    bg: "oklch(0.577 0.245 27.325 / 0.1)",
    borderHover: "hover:border-red-400/50",
  },
};

export default function CommandsPage() {
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [locationEntries, setLocationEntries] = useState<LocationEntry[]>([]);
  const [note, setNote] = useState("");
  const [stealthOpen, setStealthOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const stealthTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [commands, locations] = await Promise.all([
        loadCommandHistory(),
        loadLocationEntries(),
      ]);
      if (!active) return;
      setHistory(commands);
      setLocationEntries(locations);
    })();

    return () => {
      active = false;
    };
  }, []);

  // Keyboard shortcut: Ctrl+Shift+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        setStealthOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const sendCommand = async (cmd: CommandType) => {
    const entry: CommandEntry = {
      id: `cmd_${Date.now()}`,
      command: cmd,
      note: note.trim() || undefined,
      sentAt: new Date().toISOString(),
    };
    const updated = [entry, ...history];
    await saveCommandHistory(updated);
    setHistory(updated);
    setNote("");
    if (cmd === "lock")
      toast.success("Lock command sent", {
        description: note || "Device will lock shortly.",
      });
    else if (cmd === "alert")
      toast.warning("Alert triggered", {
        description: note || "Device alarm is now active.",
      });
    else
      toast.error("Remote wipe initiated", {
        description: note || "All device data will be erased.",
      });
  };

  const handleClearHistory = async () => {
    await saveCommandHistory([]);
    setHistory([]);
    setClearConfirmOpen(false);
    toast.success("Command history cleared");
  };

  const getStealthData = () => {
    return JSON.stringify(
      {
        locationHistory: locationEntries,
        commandHistory: history,
      },
      null,
      2,
    );
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getStealthData());
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden trigger for test automation */}
      <button
        ref={stealthTriggerRef}
        data-ocid="commands.command_palette_open"
        type="button"
        onClick={() => setStealthOpen(true)}
        className="sr-only"
        aria-label="Open stealth panel"
      />

      {/* Action Buttons Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border/60 bg-card shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.55 0.18 265 / 0.15)" }}
          >
            <Terminal
              className="h-4 w-4"
              style={{ color: "oklch(0.55 0.18 265)" }}
            />
          </div>
          <h3 className="text-sm font-bold text-foreground font-display">
            Send Command
          </h3>
        </div>

        {/* Three action buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Lock */}
          <motion.button
            type="button"
            data-ocid="commands.lock_button"
            onClick={() => void sendCommand("lock")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-2xl border border-border/60 bg-background p-4 flex flex-col items-center gap-2 transition-all ${COMMAND_META.lock.borderHover} hover:shadow-md cursor-pointer`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: COMMAND_META.lock.bg }}
            >
              <Lock
                className="h-5 w-5"
                style={{ color: COMMAND_META.lock.color }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              Lock Device
            </span>
          </motion.button>

          {/* Alert */}
          <motion.button
            type="button"
            data-ocid="commands.alert_button"
            onClick={() => void sendCommand("alert")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-2xl border border-border/60 bg-background p-4 flex flex-col items-center gap-2 transition-all ${COMMAND_META.alert.borderHover} hover:shadow-md cursor-pointer`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: COMMAND_META.alert.bg }}
            >
              <BellRing
                className="h-5 w-5"
                style={{ color: COMMAND_META.alert.color }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              Trigger Alert
            </span>
          </motion.button>

          {/* Wipe — with AlertDialog confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                type="button"
                data-ocid="commands.wipe_button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-2xl border border-border/60 bg-background p-4 flex flex-col items-center gap-2 transition-all ${COMMAND_META.wipe.borderHover} hover:shadow-md cursor-pointer`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: COMMAND_META.wipe.bg }}
                >
                  <ShieldOff
                    className="h-5 w-5"
                    style={{ color: COMMAND_META.wipe.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">
                  Remote Wipe
                </span>
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="commands.wipe_confirm_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Remote Wipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure? This will remotely wipe the device and
                  permanently erase all data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="commands.wipe_cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="commands.wipe_confirm_button"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void sendCommand("wipe")}
                >
                  Yes, Wipe Device
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Note field */}
        <div>
          <Label
            htmlFor="cmd-note"
            className="text-xs font-medium text-muted-foreground mb-1.5 block"
          >
            Optional Note
          </Label>
          <Input
            id="cmd-note"
            data-ocid="commands.note_input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to this command..."
            className="h-10 text-sm"
          />
        </div>
      </motion.div>

      {/* Command History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Command History
          </h3>
          {history.length > 0 && (
            <AlertDialog
              open={clearConfirmOpen}
              onOpenChange={setClearConfirmOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-ocid="commands.clear_history_button"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Command History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all command history entries.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="commands.wipe_cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="commands.wipe_confirm_button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void handleClearHistory()}
                  >
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {history.length === 0 ? (
          <div
            data-ocid="commands.history_empty_state"
            className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-10 text-center"
          >
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "oklch(0.55 0.18 265 / 0.1)" }}
            >
              <Terminal
                className="h-6 w-6"
                style={{ color: "oklch(0.55 0.18 265 / 0.4)" }}
              />
            </div>
            <p className="text-sm font-medium text-foreground">
              No commands sent yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use the buttons above to send commands to the device.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div data-ocid="commands.history_list" className="space-y-2">
              <AnimatePresence>
                {history.map((entry, idx) => {
                  const meta = COMMAND_META[entry.command];
                  const Icon = meta.icon;
                  const isFirst3 = idx < 3;
                  return (
                    <motion.div
                      key={entry.id}
                      data-ocid={
                        isFirst3
                          ? `commands.history_item.${idx + 1}`
                          : undefined
                      }
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className="rounded-xl border border-border/50 bg-card p-3.5 flex items-start gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: meta.bg }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: meta.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {meta.label}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground/50" />
                          <span
                            className="text-xs text-muted-foreground/60"
                            title={formatFull(entry.sentAt)}
                          >
                            {formatRelative(entry.sentAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </motion.div>

      {/* Stealth Panel */}
      <AnimatePresence>
        {stealthOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.85)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setStealthOpen(false);
            }}
          >
            <motion.div
              data-ocid="commands.stealth_panel"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.07 0.02 260)",
                border: "1px solid oklch(0.55 0.18 195 / 0.3)",
                boxShadow:
                  "0 0 40px oklch(0.55 0.18 195 / 0.15), 0 20px 60px rgba(0,0,0,0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid oklch(0.55 0.18 195 / 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.55 0.18 195 / 0.2)" }}
                  >
                    <Terminal
                      className="h-4 w-4"
                      style={{ color: "oklch(0.55 0.18 195)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold tracking-widest uppercase"
                      style={{
                        color: "oklch(0.55 0.18 195)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      STEALTH MODE
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.18 195 / 0.6)" }}
                    >
                      Firebase data dump · Ctrl+Shift+S to toggle
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-ocid="commands.stealth_copy_button"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: "oklch(0.55 0.18 195 / 0.15)",
                      color: "oklch(0.55 0.18 195)",
                      border: "1px solid oklch(0.55 0.18 195 / 0.3)",
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    type="button"
                    data-ocid="commands.stealth_close_button"
                    onClick={() => setStealthOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      color: "oklch(0.65 0.02 250)",
                      border: "1px solid oklch(0.28 0.04 260)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "oklch(0.577 0.245 27.325 / 0.2)";
                      e.currentTarget.style.color = "oklch(0.577 0.245 27.325)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "oklch(0.65 0.02 250)";
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <ScrollArea className="h-80">
                <pre
                  className="p-5 text-xs leading-relaxed overflow-auto"
                  style={{
                    color: "oklch(0.75 0.1 195)",
                    fontFamily: '"JetBrains Mono", "Geist Mono", monospace',
                  }}
                >
                  {getStealthData()}
                </pre>
              </ScrollArea>

              {/* Panel Footer */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid oklch(0.55 0.18 195 / 0.1)" }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: "oklch(0.45 0.04 260)",
                    fontFamily: "monospace",
                  }}
                >
                  {new Date().toISOString()}
                </span>
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "oklch(0.45 0.04 260)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "oklch(0.62 0.17 155)" }}
                  />
                  LIVE
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
