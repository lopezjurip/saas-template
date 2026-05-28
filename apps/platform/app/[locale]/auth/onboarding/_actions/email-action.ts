// REFACTORED (Opus analysis): Moved to client-side hooks in ./hooks.ts
// Both sendEmailOtp and verifyEmailOtp are pure Supabase SDK calls (anon key, no server-only dependency).
// Use `useOnboardingEmailOtp` from ./hooks.ts instead.
