import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  loadLocationEntries,
  saveLocationEntries,
  type LocationEntry,
} from "../../utils/firebaseDataStore";

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

export default function LocationHistoryPage() {
  const [entries, setEntries] = useState<LocationEntry[]>([]);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const loadedEntries = await loadLocationEntries();
      if (active) {
        setEntries(loadedEntries);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    const newEntry: LocationEntry = {
      id: `loc_${Date.now()}`,
      label: label.trim(),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    await saveLocationEntries(updated);
    setEntries(updated);
    setLabel("");
    setNotes("");
    setSubmitting(false);
    toast.success(`Location "${newEntry.label}" added`);
  };

  const handleDelete = async (id: string, entryLabel: string) => {
    const updated = entries.filter((e) => e.id !== id);
    await saveLocationEntries(updated);
    setEntries(updated);
    toast.success(`Removed "${entryLabel}"`);
  };

  return (
    <div className="space-y-6">
      {/* Add Entry Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border/60 bg-card shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.55 0.18 195 / 0.15)" }}
          >
            <Plus
              className="h-4 w-4"
              style={{ color: "oklch(0.55 0.18 195)" }}
            />
          </div>
          <h3 className="text-sm font-bold text-foreground font-display">
            Add Location Entry
          </h3>
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <Label
              htmlFor="loc-label"
              className="text-xs font-medium text-muted-foreground mb-1.5 block"
            >
              Location Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="loc-label"
              data-ocid="location.label_input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Location label e.g. Home, Office"
              required
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Label
              htmlFor="loc-notes"
              className="text-xs font-medium text-muted-foreground mb-1.5 block"
            >
              Notes <span className="text-muted-foreground/50">(optional)</span>
            </Label>
            <Textarea
              id="loc-notes"
              data-ocid="location.notes_textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="text-sm resize-none h-20"
            />
          </div>
          <Button
            type="submit"
            data-ocid="location.add_button"
            disabled={submitting || !label.trim()}
            className="w-full h-10 font-semibold gap-2"
          >
            {submitting ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Entry
          </Button>
        </form>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-1">
          Location History
        </h3>

        {entries.length === 0 ? (
          <div
            data-ocid="location.empty_state"
            className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-10 text-center"
          >
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "oklch(0.55 0.18 195 / 0.1)" }}
            >
              <MapPin
                className="h-6 w-6"
                style={{ color: "oklch(0.55 0.18 195 / 0.5)" }}
              />
            </div>
            <p className="text-sm font-medium text-foreground">
              No location entries yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first entry above.
            </p>
          </div>
        ) : (
          <div data-ocid="location.list" className="relative pl-7">
            {/* Vertical line */}
            <div
              className="absolute left-3 top-3 bottom-3 w-px"
              style={{ background: "oklch(var(--border))" }}
            />

            <AnimatePresence>
              {entries.map((entry, idx) => {
                const markerIdx = idx + 1;
                const isFirst3 = markerIdx <= 3;
                return (
                  <motion.div
                    key={entry.id}
                    data-ocid={
                      isFirst3 ? `location.item.${markerIdx}` : undefined
                    }
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10, height: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative mb-4 last:mb-0"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-4 top-4 w-2.5 h-2.5 rounded-full border-2 border-card"
                      style={{ background: "oklch(0.55 0.18 195)" }}
                    />

                    {/* Entry card */}
                    <div className="ml-1 rounded-xl border border-border/50 bg-card p-4 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin
                              className="h-3.5 w-3.5 shrink-0"
                              style={{ color: "oklch(0.55 0.18 195)" }}
                            />
                            <span className="text-sm font-semibold text-foreground truncate">
                              {entry.label}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {entry.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground/60" />
                            <span
                              className="text-xs text-muted-foreground/70"
                              title={formatFull(entry.createdAt)}
                            >
                              {formatRelative(entry.createdAt)} ·{" "}
                              {formatFull(entry.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-ocid={
                            isFirst3
                              ? `location.delete_button.${markerIdx}`
                              : undefined
                          }
                          onClick={() =>
                            void handleDelete(entry.id, entry.label)
                          }
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Delete ${entry.label}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
