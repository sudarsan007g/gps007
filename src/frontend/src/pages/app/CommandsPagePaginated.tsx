/**
 * Paginated Commands Page with virtual scroll support
 * Replaces the old unbounded list with efficient pagination
 */
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
import {
  BellRing,
  Lock,
  ShieldOff,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  loadCommandHistoryPaginated,
  loadLocationEntries,
  saveCommandHistory,
  type CommandEntry,
  type LocationEntry,
} from "../../utils/firebaseDataStore";
import { logger } from "../../services/logger";
import { ITEMS_PER_PAGE } from "../../constants";

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
  }
> = {
  lock: {
    label: "Lock Device",
    icon: Lock,
    color: "oklch(0.55 0.18 220)",
    bg: "oklch(0.62 0.17 220 / 0.12)",
  },
  alert: {
    label: "Trigger Alert",
    icon: BellRing,
    color: "oklch(0.68 0.18 75)",
    bg: "oklch(0.78 0.15 75 / 0.12)",
  },
  wipe: {
    label: "Remote Wipe",
    icon: ShieldOff,
    color: "oklch(0.577 0.245 27.325)",
    bg: "oklch(0.577 0.245 27.325 / 0.1)",
  },
};

export default function CommandsPagePaginated() {
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageItems, setPageItems] = useState<CommandEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Load paginated history
  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        const result = await loadCommandHistoryPaginated(page, ITEMS_PER_PAGE);
        if (!active) return;
        setPageItems(result.items);
        setTotal(result.total);
        logger.info(`Loaded commands page ${page + 1}/${Math.ceil(result.total / ITEMS_PER_PAGE)}`);
      } catch (err) {
        logger.error("Failed to load commands", err as Error);
        toast.error("Failed to load commands");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPage();

    return () => {
      active = false;
    };
  }, [page]);

  const sendCommand = async (cmd: CommandType) => {
    try {
      const entry: CommandEntry = {
        id: `cmd_${Date.now()}`,
        command: cmd,
        note: note.trim() || undefined,
        sentAt: new Date().toISOString(),
      };
      const updated = [entry, ...history];
      await saveCommandHistory(updated);
      setHistory(updated);
      setPage(0); // Reset to first page
      setNote("");

      const messages = {
        lock: { title: "Lock command sent", desc: note || "Device will lock shortly." },
        alert: {
          title: "Alert triggered",
          desc: note || "Device alarm is now active.",
        },
        wipe: {
          title: "Remote wipe initiated",
          desc: note || "All device data will be erased.",
        },
      };

      toast.success(messages[cmd].title, {
        description: messages[cmd].desc,
      });
    } catch (err) {
      logger.error("Failed to send command", err as Error);
      toast.error("Failed to send command");
    }
  };

  const handleClearHistory = async () => {
    try {
      await saveCommandHistory([]);
      setHistory([]);
      setPage(0);
      setClearConfirmOpen(false);
      toast.success("Command history cleared");
    } catch (err) {
      logger.error("Failed to clear history", err as Error);
      toast.error("Failed to clear history");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="space-y-6">
      {/* Send Command Card */}
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
          <h3 className="text-sm font-bold text-foreground">Send Command</h3>
        </div>

        {/* Command buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(Object.entries(COMMAND_META) as [CommandType, any][]).map(
            ([cmd, meta]) => {
              const Icon = meta.icon;
              return (
                <motion.button
                  key={cmd}
                  type="button"
                  onClick={() => void sendCommand(cmd)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border border-border/60 bg-background p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: meta.color }} />
                  </div>
                  <span className="text-xs font-semibold text-center">
                    {meta.label}
                  </span>
                </motion.button>
              );
            },
          )}
        </div>

        {/* Note input */}
        <div className="space-y-2">
          <Label htmlFor="cmd-note" className="text-xs">
            Note (optional)
          </Label>
          <Input
            id="cmd-note"
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm"
          />
        </div>
      </motion.div>

      {/* Paginated History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl border border-border/60 bg-card shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Command History</h3>
          <div className="text-xs text-muted-foreground">
            Page {page + 1} of {Math.max(1, totalPages)}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground/80 animate-spin" />
          </div>
        ) : pageItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No commands sent yet
          </p>
        ) : (
          <div className="space-y-2">
            {pageItems.map((entry) => {
              const meta = COMMAND_META[entry.command];
              const Icon = meta.icon;

              return (
                <motion.div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {meta.label}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatRelative(entry.sentAt)} •{" "}
                      {formatFull(entry.sentAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive text-xs px-2">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Command History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All {total} command entries will be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={!hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
