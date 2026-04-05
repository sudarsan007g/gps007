export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  loginTime: string;
}

export type AuthScreen =
  | { view: "auth"; tab: "login" | "register" }
  | { view: "dashboard" };
