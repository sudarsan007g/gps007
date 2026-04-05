// ── Geolocation ──
export const GEOLOCATION_INTERVAL_MS = 30000; // 30 seconds (was 1s = 86,400/day)
export const GEOLOCATION_TIMEOUT_MS = 8000;
export const GEOLOCATION_HIGH_ACCURACY = true;

// ── Locations & Defaults ──
export const FALLBACK_HQ_LOCATION = { lat: 12.9716, lng: 77.5946 };
export const FALLBACK_MAP_LOCATION = { lat: 28.6139, lng: 77.209 };
export const GEOFENCE_RADIUS_KM = 2;

// ── Pagination ──
export const ITEMS_PER_PAGE = 15;
export const VIRTUAL_SCROLL_OVERSCAN = 5;

// ── Session & Storage ──
export const SESSION_KEY = "secureauth_session";
export const USER_KEY = "secureauth_user";
export const TRACKER_HINT_SEEN_KEY = "secureauth_tracker_hint_seen";

// ── Query Settings ──
export const QUERY_STALE_TIME_MS = 60000; // 1 minute
export const QUERY_CACHE_TIME_MS = 300000; // 5 minutes

// ── Firebase Paths ──
export const FIREBASE_COMMANDS_PATH = "commands";
export const FIREBASE_LOCATIONS_PATH = "locations";
export const FIREBASE_USERS_PATH = "users";

// ── Toast Durations ──
export const TOAST_DEFAULT_DURATION_MS = 4500;
export const TOAST_ACTION_DURATION_MS = 2000;

// ── Animation Timings ──
export const ANIMATION_FAST_MS = 200;
export const ANIMATION_NORMAL_MS = 400;
export const ANIMATION_SLOW_MS = 600;

// ── UI Borders & Radius ──
export const BORDER_RADIUS_LG = "16px";
export const BORDER_RADIUS_XL = "24px";
