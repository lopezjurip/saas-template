// REFACTORED (Opus analysis): Moved to client-side hooks in ./hooks.ts
// actionSetPassword is a pure Supabase SDK call (anon key, no server-only dependency).
// Password is transmitted over TLS regardless of client/server location — server adds no protection.
// Use `useOnboardingPassword` from ./hooks.ts instead.
