// Brand marks for OAuth providers. These aren't licensed brand logos — they're the
// design canvas's approximations rendered as inline SVG so the bundle doesn't depend
// on an extra brand-icons package. Replace with real assets once we have brand-cleared SVGs.
//
// Everything else (Mail, Phone, Lock, ShieldCheck, ArrowRight, …) comes from
// `lucide-react`. Import directly from there in callers — don't re-export through here.

type IconProps = { size?: number; className?: string };

export function GoogleMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.6 8.1 22 12 22z"
      />
      <path
        fill="#FBBC04"
        d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l3.3-2.6z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.1 14.6 2 12 2 8.1 2 4.7 4.4 3.1 7.6L6.4 10.2C7.2 7.9 9.4 6.1 12 6.1z"
      />
    </svg>
  );
}

export function MicrosoftMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  );
}

export function AppleMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.4 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.9 1.4 0 2.3-1.2 3.2-2.5.7-1 1.2-2 1.5-3-.1 0-2.5-1-2.5-4.1zM13.6 4.7c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.6.7-1.2 1.9-1.1 3 1.2.1 2.3-.5 3-1.4z" />
    </svg>
  );
}

export function GitHubMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.84a9.56 9.56 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}

export function LinkedInMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2" className={className}>
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 18H5.7V9.7h2.8V18zm-1.4-9.4c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6zM18 18h-2.8v-4c0-1-.2-1.7-1.2-1.7s-1.4.7-1.4 1.6V18H9.8V9.7h2.7v1.1c.4-.6 1.2-1.3 2.5-1.3 2.6 0 3 1.7 3 4V18z" />
    </svg>
  );
}

export function FacebookMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" className={className}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.8l-.4 2.9H13.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

// WhatsApp brand mark — used by the phone OTP "send via WhatsApp" CTA.
export function WhatsAppMark({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 14.93L2 22l5.2-1.36A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.07-1.12l-.29-.17-3.09.81.82-3-.19-.31A8 8 0 1 1 12 20zm4.45-5.7c-.24-.12-1.43-.7-1.65-.78s-.38-.12-.55.12-.63.78-.77.94-.28.18-.52.06a6.55 6.55 0 0 1-1.94-1.2 7.21 7.21 0 0 1-1.34-1.67c-.14-.24 0-.37.1-.49s.24-.28.36-.42a1.5 1.5 0 0 0 .24-.4.45.45 0 0 0 0-.42c-.06-.12-.55-1.32-.76-1.81s-.4-.41-.55-.42h-.47a.91.91 0 0 0-.66.31 2.78 2.78 0 0 0-.86 2.06 4.83 4.83 0 0 0 1 2.55 11.06 11.06 0 0 0 4.23 3.74c.59.25 1.05.4 1.41.51a3.42 3.42 0 0 0 1.56.1 2.55 2.55 0 0 0 1.67-1.18 2.06 2.06 0 0 0 .14-1.18c-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}
