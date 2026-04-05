/**
 * QUICK START GUIDE: Using the New Features
 */

// ============================================================================
// 1. LOGGING - Report errors and metrics anywhere in your app
// ============================================================================

import { logger } from "@/services/logger";

// Log errors
try {
  await riskyOperation();
} catch (err) {
  logger.error("Operation failed", err, { userId: user.id });
}

// Log warnings
logger.warn("Low disk space", { available: "100MB" });

// Log info (creates breadcrumb trail)
logger.info("User logged in", { method: "email" });

// Track performance
const start = Date.now();
doHeavyWork();
logger.performance("heavy-work", Date.now() - start, "ms");


// ============================================================================
// 2. PAGINATION - Load large lists efficiently
// ============================================================================

import {
  loadCommandHistoryPaginated,
  loadLocationEntriesPaginated,
} from "@/utils/firebaseDataStore";

// Load first page (15 items)
const page0 = await loadCommandHistoryPaginated(0, 15);
console.log(page0);
// {
//   items: [...15 items],
//   total: 142,
//   page: 0,
//   pageSize: 15,
//   hasMore: true
// }

// Load next page
const page1 = await loadCommandHistoryPaginated(1, 15);

// Use in component (see CommandsPagePaginated.tsx for full example)
const [page, setPage] = useState(0);
const result = await loadCommandHistoryPaginated(page);


// ============================================================================
// 3. GLOBAL STATE - Use Zustand for shared state
// ============================================================================

import { useAppStore } from "@/store/appStore";

// In components - read state
const { user, trackerOn, activePage } = useAppStore();

// In components - write state
const { setTrackerOn, setActivePage, setError } = useAppStore();

setTrackerOn(true);
setActivePage("map");
setError("Connection lost");


// ============================================================================
// 4. LAZY LOADING - Automatic code splitting
// ============================================================================

// Already done in App.tsx and Dashboard.tsx
// No changes needed - just use the app normally!

// Benefit: MapPage only loads when user clicks "Open Map"
// Benefit: Dashboard only loads after successful auth


// ============================================================================
// 5. CONSTANTS - Use predefined values
// ============================================================================

import { 
  GEOLOCATION_INTERVAL_MS,
  ITEMS_PER_PAGE,
  ANIMATION_FAST_MS,
  TOAST_DEFAULT_DURATION_MS,
} from "@/constants";

// Use instead of hardcoded values
setInterval(() => { ... }, GEOLOCATION_INTERVAL_MS);
const items = data.slice(0, ITEMS_PER_PAGE);


// ============================================================================
// 6. TESTING - Write tests for your code
// ============================================================================

import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    const result = myFunction(input);
    expect(result).toBe(expectedValue);
  });
});

// Run tests:
// npm run test
// npm run test:ui (open dashboard)
// npm run test:coverage (generate coverage report)


// ============================================================================
// 7. ERROR BOUNDARIES - Catch component errors gracefully
// ============================================================================

// Automatically wraps your entire app in ErrorBoundary
// If any component crashes, user sees friendly error message
// Instead of white screen of death

// Example: If HomePage crashes, user sees:
// "Something went wrong" + Try Again button


// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

// Create .env.local with:
VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/id

// Then errors are automatically tracked in Sentry dashboard


// ============================================================================
// MIGRATION CHECKLIST - Updating Old Code
// ============================================================================

// ❌ OLD: Hardcoded values everywhere
const interval = 1000;
const pageSize = 50;
const timeout = 200;

// ✅ NEW: Use constants
import { GEOLOCATION_INTERVAL_MS, ITEMS_PER_PAGE, ANIMATION_FAST_MS } from "@/constants";
const interval = GEOLOCATION_INTERVAL_MS;
const pageSize = ITEMS_PER_PAGE;
const timeout = ANIMATION_FAST_MS;

// ✅ OLD: Direct error logs to console
console.error("Something failed", error);

// ✅ NEW: Use centralized logger
import { logger } from "@/services/logger";
logger.error("Something failed", error);

// ❌ OLD: Load entire list at once
const commands = await loadCommandHistory();

// ✅ NEW: Load paginated
const result = await loadCommandHistoryPaginated(page, ITEMS_PER_PAGE);

// ❌ OLD: Scatter useState across components
const [user, setUser] = useState(null);
const [tracker, setTracker] = useState(false);

// ✅ NEW: Use Zustand global store
const { user, trackerOn, setUser, setTrackerOn } = useAppStore();
