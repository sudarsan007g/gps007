import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Session, User } from "../types/auth";

interface AppState {
  // Auth
  user: User | null;
  session: Session | null;
  isAuthLoading: boolean;
  
  // Tracker
  trackerOn: boolean;
  currentLocation: { lat: number; lng: number; accuracy: number } | null;
  lastGeolocateTime: number;
  
  // UI
  activePage: "home" | "map" | "profile";
  isPageLoading: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setTrackerOn: (on: boolean) => void;
  setCurrentLocation: (loc: { lat: number; lng: number; accuracy: number } | null) => void;
  setLastGeolocateTime: (time: number) => void;
  setActivePage: (page: "home" | "map" | "profile") => void;
  setPageLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Helpers
  clearAuth: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    // Default state
    user: null,
    session: null,
    isAuthLoading: true,
    trackerOn: false,
    currentLocation: null,
    lastGeolocateTime: 0,
    activePage: "home",
    isPageLoading: false,
    error: null,

    // Actions
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setAuthLoading: (loading) => set({ isAuthLoading: loading }),
    setTrackerOn: (on) => set({ trackerOn: on }),
    setCurrentLocation: (loc) => set({ currentLocation: loc }),
    setLastGeolocateTime: (time) => set({ lastGeolocateTime: time }),
    setActivePage: (page) => set({ activePage: page }),
    setPageLoading: (loading) => set({ isPageLoading: loading }),
    setError: (error) => set({ error }),

    // Helpers
    clearAuth: () => set({ 
      user: null, 
      session: null, 
      trackerOn: false,
      currentLocation: null 
    }),
  }))
);
