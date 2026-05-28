// REFACTORED (Opus analysis): Moved to client-side hooks in ./hooks.ts
// Both sendPhoneOtp and verifyPhoneOtp are pure Supabase SDK calls (anon key, no server-only dependency).
// Use `useOnboardingPhoneOtp` from ./hooks.ts instead.
