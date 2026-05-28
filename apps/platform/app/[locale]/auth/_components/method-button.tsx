"use client";

const STORAGE_KEY = "humane:last_auth_method";

export type AuthMethod =
  | "email"
  | "phone"
  | "document"
  | "passkey"
  | "password"
  | "oauth:google"
  | "oauth:azure"
  | "oauth:linkedin_oidc"
  | "oauth:github"
  | "oauth:facebook";

export function rememberAuthMethod(method: AuthMethod) {
  try {
    window.localStorage.setItem(STORAGE_KEY, method);
  } catch {
    // best-effort
  }
}
