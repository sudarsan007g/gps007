/**
 * Paginated Location History Page
 * Efficiently loads locations with pagination instead of all at once
 */
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  loadLocationEntriesPaginated,
  saveLocationEntries,
  type LocationEntry,
} from "../../utils/firebaseDataStore";
import { logger } from "../../services/logger";
import { ITEMS_PER_PAGE } from "../../constants";
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

export default function LocationHistoryPagePaginated() {
  const [pageItems, setPageItems] = useState<LocationEntry[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Load paginated locations
  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        const result = await loadLocationEntriesPaginated(page, ITEMS_PER_PAGE);
        if (!active) return;
        setPageItems(result.items);
        setTotal(result.total);
        logger.info(
          `Loaded locations page ${page + 1}/${Math.ceil(result.total / ITEMS_PER_PAGE)}`
        );
      } catch (err) {
        logger.error("Failed to load locations", err as Error);
        toast.error("Failed to load locations");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPage();

    return () => {
      active = false;
    };
  }, [page]);

  const handleClearHistory = async () => {
    try {
      await saveLocationEntries([]);
      setPage(0);
      setPageItems([]);
      setTotal(0);
      setClearConfirmOpen(false);
      toast.success("Location history cleared");
    } catch (err) {
      logger.error("Failed to clear locations", err as Error);
      toast.error("Failed to clear locations");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Location History
        </h2>
        <div className="text-sm text-muted-foreground">
          Total: {total} entries
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl border border-border/60 bg-card shadow-sm p-6"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground/80 animate-spin" />
          </div>
        ) : pageItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No location history available
          </p>
        ) : (
          <div className="space-y-8">
            {pageItems.map((entry, idx) => (
              <motion.div
                key={entry.id}
                className="relative flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
              >
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-foreground/40 bg-card"
                    style={{
                      borderColor: "oklch(0.58 0.19 145)",
                    }}
                  />
                  {idx < pageItems.length - 1 && (
                    <div
                      className="w-0.5 h-16 my-2"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.58 0.19 145), oklch(0.58 0.19 145 / 0))",
                      }}
                    />
                  )}
                </div>

                {/* Entry Content */}
                <div className="flex-1 pt-0.5">
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground break-words">
                          {entry.label}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {entry.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-3">
                          {formatRelative(entry.createdAt)} •{" "}
                          {formatFull(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground">
              Page {page + 1} / {totalPages}
            </div>

            <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive text-xs px-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Location History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All {total} location entries will be deleted.
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
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
