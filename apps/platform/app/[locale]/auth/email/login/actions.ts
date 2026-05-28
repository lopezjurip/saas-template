// This file previously contained signInWithPassword, sendMagicLink, and verifyMagicOtp as server actions.
// REFACTORED (Opus analysis): All three are pure Supabase SDK calls (anon key, no secrets, no audit).
// Moved to client-side hooks in ./hooks.ts — zero server-side dependency.
// Migration: use `useLoginPassword`, `useLoginMagicLink`, `useVerifyMagicOtp` from ./hooks.ts instead.
