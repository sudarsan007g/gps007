import { get, ref, set } from "firebase/database";
import { firebaseDb } from "../lib/firebase";
import { ITEMS_PER_PAGE } from "../constants";

export interface CommandEntry {
  id: string;
  command: "lock" | "alert" | "wipe";
  note?: string;
  sentAt: string;
}

export interface LocationEntry {
  id: string;
  label: string;
  notes?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function toObjectById<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

function toArray<T>(snapshotValue: unknown): T[] {
  if (!snapshotValue || typeof snapshotValue !== "object") {
    return [];
  }
  return Object.values(snapshotValue as Record<string, T>);
}

export async function loadCommandHistory(): Promise<CommandEntry[]> {
  const snapshot = await get(ref(firebaseDb, "secureauth/commandHistory"));
  const entries = toArray<CommandEntry>(snapshot.val());
  return entries.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

/**
 * Load paginated command history
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of items per page
 */
export async function loadCommandHistoryPaginated(
  page: number = 0,
  pageSize: number = ITEMS_PER_PAGE,
  loadEntries: () => Promise<CommandEntry[]> = loadCommandHistory,
): Promise<PaginatedResult<CommandEntry>> {
  const allEntries = await loadEntries();
  const total = allEntries.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const items = allEntries.slice(start, end);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: end < total,
  };
}

export async function saveCommandHistory(entries: CommandEntry[]): Promise<void> {
  await set(
    ref(firebaseDb, "secureauth/commandHistory"),
    toObjectById(entries),
  );
}

export async function loadLocationEntries(): Promise<LocationEntry[]> {
  const snapshot = await get(ref(firebaseDb, "secureauth/locationHistory"));
  const entries = toArray<LocationEntry>(snapshot.val());
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Load paginated location entries
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of items per page
 */
export async function loadLocationEntriesPaginated(
  page: number = 0,
  pageSize: number = ITEMS_PER_PAGE,
  loadEntries: () => Promise<LocationEntry[]> = loadLocationEntries,
): Promise<PaginatedResult<LocationEntry>> {
  const allEntries = await loadEntries();
  const total = allEntries.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const items = allEntries.slice(start, end);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: end < total,
  };
}

export async function saveLocationEntries(
  entries: LocationEntry[],
): Promise<void> {
  await set(
    ref(firebaseDb, "secureauth/locationHistory"),
    toObjectById(entries),
  );
}
