/**
 * Unit tests for Zustand app store
 */
import { useAppStore } from "../store/appStore";
import type { User, Session } from "../types/auth";

describe("App Store (Zustand)", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { clearAuth } = useAppStore.getState();
    clearAuth();
  });

  describe("Auth state", () => {
    it("should initialize with null user and session", () => {
      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthLoading).toBe(true);
    });

    it("should set user", () => {
      const mockUser: User = {
        id: "user1",
        fullName: "Test User",
        mobile: "1234567890",
        email: "test@example.com",
        passwordHash: "test-hash",
        createdAt: new Date().toISOString(),
      };

      const { setUser } = useAppStore.getState();
      setUser(mockUser);

      expect(useAppStore.getState().user).toEqual(mockUser);
    });

    it("should set session", () => {
      const mockSession: Session = {
        userId: "user1",
        loginTime: new Date().toISOString(),
      };

      const { setSession } = useAppStore.getState();
      setSession(mockSession);

      expect(useAppStore.getState().session).toEqual(mockSession);
    });

    it("should clear auth", () => {
      const mockUser: User = {
        id: "user1",
        fullName: "Test User",
        mobile: "1234567890",
        email: "test@example.com",
        passwordHash: "test-hash",
        createdAt: new Date().toISOString(),
      };

      const { setUser, setTrackerOn, clearAuth } = useAppStore.getState();
      setUser(mockUser);
      setTrackerOn(true);

      clearAuth();

      const state = useAppStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.trackerOn).toBe(false);
    });
  });

  describe("Tracker state", () => {
    it("should toggle tracker on/off", () => {
      const { setTrackerOn } = useAppStore.getState();

      setTrackerOn(true);
      expect(useAppStore.getState().trackerOn).toBe(true);

      setTrackerOn(false);
      expect(useAppStore.getState().trackerOn).toBe(false);
    });

    it("should set current location", () => {
      const loc = { lat: 28.6139, lng: 77.209, accuracy: 10 };
      const { setCurrentLocation } = useAppStore.getState();

      setCurrentLocation(loc);

      expect(useAppStore.getState().currentLocation).toEqual(loc);
    });
  });

  describe("UI state", () => {
    it("should change active page", () => {
      const { setActivePage } = useAppStore.getState();

      setActivePage("map");
      expect(useAppStore.getState().activePage).toBe("map");

      setActivePage("profile");
      expect(useAppStore.getState().activePage).toBe("profile");

      setActivePage("home");
      expect(useAppStore.getState().activePage).toBe("home");
    });

    it("should set page loading state", () => {
      const { setPageLoading } = useAppStore.getState();

      setPageLoading(true);
      expect(useAppStore.getState().isPageLoading).toBe(true);

      setPageLoading(false);
      expect(useAppStore.getState().isPageLoading).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should set and clear errors", () => {
      const { setError } = useAppStore.getState();

      setError("Something went wrong");
      expect(useAppStore.getState().error).toBe("Something went wrong");

      setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });
  });
});
