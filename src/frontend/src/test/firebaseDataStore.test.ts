/**
 * Unit tests for firebaseDataStore pagination
 */
import {
  type CommandEntry,
  loadCommandHistoryPaginated,
  loadLocationEntriesPaginated,
} from "../utils/firebaseDataStore";

const commandSnapshotValue = {
  cmd1: {
    id: "cmd1",
    command: "lock",
    sentAt: "2026-03-27T00:00:00Z",
  },
  cmd2: {
    id: "cmd2",
    command: "alert",
    sentAt: "2026-03-27T01:00:00Z",
  },
  cmd3: {
    id: "cmd3",
    command: "wipe",
    sentAt: "2026-03-27T02:00:00Z",
  },
};

const locationSnapshotValue = {
  loc1: {
    id: "loc1",
    label: "Office",
    createdAt: "2026-03-27T00:00:00Z",
  },
  loc2: {
    id: "loc2",
    label: "Cafe",
    createdAt: "2026-03-27T01:00:00Z",
  },
  loc3: {
    id: "loc3",
    label: "Home",
    createdAt: "2026-03-27T02:00:00Z",
  },
};

const commandEntries: CommandEntry[] = Object.values(commandSnapshotValue);
const locationEntries = Object.values(locationSnapshotValue);
const sortedCommandEntries = [...commandEntries].sort((a, b) =>
  b.sentAt.localeCompare(a.sentAt),
);

describe("Firebase Data Store Pagination", () => {
  describe("loadCommandHistoryPaginated", () => {
    it("should return paginated results for first page", async () => {
      const result = await loadCommandHistoryPaginated(
        0,
        2,
        async () => sortedCommandEntries,
      );

      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(2);
      expect(result.hasMore).toBe(true);
      expect(result.items.length).toBe(2);
    });

    it("should return correct total count", async () => {
      const result = await loadCommandHistoryPaginated(
        0,
        2,
        async () => sortedCommandEntries,
      );

      expect(result.total).toBe(3);
    });

    it("should indicate no more pages on last page", async () => {
      const result = await loadCommandHistoryPaginated(
        1,
        2,
        async () => sortedCommandEntries,
      );

      expect(result.hasMore).toBe(false);
      expect(result.items.length).toBe(1);
    });

    it("should sort by descending date", async () => {
      const result = await loadCommandHistoryPaginated(
        0,
        10,
        async () => sortedCommandEntries,
      );

      expect(result.items[0].id).toBe("cmd3"); // Most recent first
      expect(result.items[1].id).toBe("cmd2");
      expect(result.items[2].id).toBe("cmd1");
    });

    it("should handle empty page", async () => {
      const result = await loadCommandHistoryPaginated(
        10,
        10,
        async () => sortedCommandEntries,
      );

      expect(result.items.length).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe("loadLocationEntriesPaginated", () => {
    it("should return paginated location results", async () => {
      const result = await loadLocationEntriesPaginated(
        0,
        2,
        async () => locationEntries,
      );

      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(2);
      expect(result.total).toBe(3);
    });

    it("should handle pagination correctly", async () => {
      const page0 = await loadLocationEntriesPaginated(
        0,
        1,
        async () => locationEntries,
      );
      const page1 = await loadLocationEntriesPaginated(
        1,
        1,
        async () => locationEntries,
      );

      expect(page0.items.length).toBe(1);
      expect(page1.items.length).toBe(1);
      expect(page0.items[0].id).not.toBe(page1.items[0].id);
    });
  });
});
