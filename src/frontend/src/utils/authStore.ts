import type { Session, User } from "../types/auth";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { get, ref, remove, set } from "firebase/database";
import { firebaseAuth, firebaseDb } from "../lib/firebase";
import { SESSION_KEY, USER_KEY } from "../constants";

// Constants now imported from constants/index.ts

export function cacheUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? "null") as User | null;
  } catch {
    return null;
  }
}

export function clearCachedUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── Simple hash (demo only, NOT production) ──────────────────────────────────
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ── Users ────────────────────────────────────────────────────────────────────

function buildMobileIndexFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const digits = Math.abs(hash).toString().padStart(10, "0");
  return digits.slice(-10);
}

export async function registerUserWithCredentials(params: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User> {
  const email = params.email.trim().toLowerCase();
  const mobile = buildMobileIndexFromEmail(email);
  const fullName = params.fullName.trim();

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    params.password,
  );

  const user: User = {
    id: credential.user.uid,
    fullName,
    mobile,
    email,
    passwordHash: "firebase-auth",
    createdAt: new Date().toISOString(),
  };

  try {
    await updateProfile(credential.user, { displayName: fullName });
    await set(ref(firebaseDb, `secureauth/users/${user.id}`), user);
    await set(ref(firebaseDb, `secureauth/mobileIndex/${mobile}`), user.id).catch(() => {
      // Best-effort index write.
    });
    cacheUser(user);
    return user;
  } catch (error) {
    await deleteUser(credential.user).catch(() => {
      // Best-effort rollback to avoid orphan auth users.
    });
    throw error;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return null;
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
  } catch {
    return null;
  }

  const derivedMobile = buildMobileIndexFromEmail(normalizedEmail);

  const fallbackUser: User = {
    id: credential.user.uid,
    fullName: credential.user.displayName ?? "User",
    mobile: derivedMobile,
    email: credential.user.email?.toLowerCase() ?? normalizedEmail,
    passwordHash: "firebase-auth",
    createdAt: new Date().toISOString(),
  };

  try {
    const authenticatedUserSnapshot = await get(
      ref(firebaseDb, `secureauth/users/${credential.user.uid}`),
    );
    const existingUser = (authenticatedUserSnapshot.val() as User | null) ?? null;
    if (existingUser) {
      if (!existingUser.mobile) {
        const patchedUser: User = { ...existingUser, mobile: derivedMobile };
        await set(ref(firebaseDb, `secureauth/users/${patchedUser.id}`), patchedUser).catch(() => {});
        await set(ref(firebaseDb, `secureauth/mobileIndex/${derivedMobile}`), patchedUser.id).catch(() => {});
        return patchedUser;
      }
      return existingUser;
    }

    // No profile in DB yet — create one.
    await set(ref(firebaseDb, `secureauth/users/${fallbackUser.id}`), fallbackUser);
    await set(ref(firebaseDb, `secureauth/mobileIndex/${derivedMobile}`), fallbackUser.id).catch(() => {});
  } catch {
    // Database unavailable or permission denied.
  }

  cacheUser(fallbackUser);
  return fallbackUser;
}

export async function getUsers(): Promise<User[]> {
  const snapshot = await get(ref(firebaseDb, "secureauth/users"));
  const value = snapshot.val();
  if (!value || typeof value !== "object") {
    return [];
  }
  return Object.values(value as Record<string, User>);
}

export async function saveUser(user: User): Promise<void> {
  await set(ref(firebaseDb, `secureauth/users/${user.id}`), user);
  if (user.mobile && /^\d{10}$/.test(user.mobile)) {
    await set(ref(firebaseDb, `secureauth/mobileIndex/${user.mobile}`), user.id);
  }
}

export async function findUserByCredential(
  identifier: string,
): Promise<User | null> {
  const users = await getUsers();
  return (
    users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.mobile === identifier,
    ) ?? null
  );
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const snapshot = await get(ref(firebaseDb, `secureauth/users/${id}`));
    const user = (snapshot.val() as User | null) ?? null;
    if (user) {
      cacheUser(user);
      return user;
    }
  } catch {
    // DB read failed — fall through to cached user.
  }

  // Fallback: use locally cached user if ID matches.
  const cached = getCachedUser();
  if (cached?.id === id) return cached;

  // Fallback: reconstruct from Firebase Auth if available.
  const authUser = firebaseAuth.currentUser;
  if (authUser?.uid === id) {
    const authEmail = authUser.email ?? "";
    return {
      id: authUser.uid,
      fullName: authUser.displayName ?? "User",
      mobile: buildMobileIndexFromEmail(authEmail),
      email: authEmail,
      passwordHash: "firebase-auth",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function emailOrMobileExists(
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return false;
  }
  const mobileIndex = buildMobileIndexFromEmail(normalizedEmail);

  // Check mobile index first for compatibility with existing records.
  try {
    const snapshot = await get(
      ref(firebaseDb, `secureauth/mobileIndex/${mobileIndex}`),
    );
    if (snapshot.val()) return true;
  } catch {
    // Ignore index failures.
  }

  // Check Firebase Auth directly by email.
  try {
    const methods = await fetchSignInMethodsForEmail(firebaseAuth, normalizedEmail);
    if (methods.length > 0) return true;
  } catch {
    // Ignore enumeration failures.
  }

  return false;
}

// ── Session ──────────────────────────────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_KEY) ?? "null",
    ) as Session | null;
    if (!session?.userId) {
      return null;
    }
    try {
      const snapshot = await get(
        ref(firebaseDb, `secureauth/sessions/${session.userId}`),
      );
      const remoteSession = (snapshot.val() as Session | null) ?? null;
      return remoteSession ?? session;
    } catch {
      return session;
    }
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<Session> {
  const session: Session = {
    userId,
    loginTime: new Date().toISOString(),
  };
  try {
    await set(ref(firebaseDb, `secureauth/sessions/${userId}`), session);
  } catch {
    // Keep local fallback when Firebase is unavailable or denied.
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function clearSession(): Promise<void> {
  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_KEY) ?? "null",
    ) as Session | null;
    if (session?.userId) {
      try {
        await remove(ref(firebaseDb, `secureauth/sessions/${session.userId}`));
      } catch {
        // Best-effort remote delete.
      }
    }
    try {
      await signOut(firebaseAuth);
    } catch {
      // Best-effort sign out.
    }
  } finally {
    localStorage.removeItem(SESSION_KEY);
    clearCachedUser();
  }
}

export async function deleteLoginAccount(user: User): Promise<void> {
  await remove(ref(firebaseDb, `secureauth/sessions/${user.id}`));
  if (user.mobile) {
    await remove(ref(firebaseDb, `secureauth/mobileIndex/${user.mobile}`));
  }
  await remove(ref(firebaseDb, `secureauth/users/${user.id}`));

  const authUser = firebaseAuth.currentUser;
  if (authUser?.uid === user.id) {
    await deleteUser(authUser);
  }

  localStorage.removeItem(SESSION_KEY);
  clearCachedUser();
}
