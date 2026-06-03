/**
 * OAuth brand marks. One component per provider referenced by `providers.ts`.
 * Signature matches OAuthProvider["Mark"]: ({ size, className }) => JSX.Element.
 * Colored official marks where a single-path brand color reads well; GitHub/Apple
 * use currentColor so they adapt to light/dark.
 */
type MarkProps = { size?: number; className?: string };

export function GoogleMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function AppleMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.55 0 2 .83 3.36.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.86 1.41-2.93-.03-.01-2.71-1.04-2.74-4.13ZM14.5 4.92c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-3 1.54-.66.76-1.24 1.98-1.08 3.15 1.14.09 2.31-.58 3.02-1.44Z" />
    </svg>
  );
}

export function MicrosoftMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

export function GitHubMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.78c-2.93.64-3.55-1.25-3.55-1.25-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.42-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.08-2.83-.1-.27-.47-1.34.1-2.8 0 0 .88-.28 2.9 1.08a10 10 0 0 1 5.28 0c2-1.36 2.89-1.08 2.89-1.08.58 1.46.21 2.53.1 2.8.68.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.93-4.81 5.19.38.33.72.97.72 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

export function LinkedInMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M20.45 3H3.55C2.7 3 2 3.69 2 4.53v16.94C2 22.31 2.7 23 3.55 23h16.9c.85 0 1.55-.69 1.55-1.53V4.53C22 3.69 21.3 3 20.45 3ZM8.34 19.8H5.4V9.98h2.94v9.82ZM6.87 8.67a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Zm12.93 11.13h-2.93v-4.78c0-1.14-.02-2.6-1.59-2.6-1.59 0-1.83 1.24-1.83 2.52v4.86h-2.93V9.98h2.81v1.34h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.96 3.52 4.5v5.5Z"
      />
    </svg>
  );
}

export function FacebookMark({ size = 18, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1877F2"
        d="M23 12a11 11 0 1 0-12.72 10.87v-7.69H7.5V12h2.78V9.59c0-2.75 1.64-4.27 4.15-4.27 1.2 0 2.46.21 2.46.21v2.7h-1.39c-1.36 0-1.79.85-1.79 1.72V12h3.05l-.49 3.18h-2.56v7.69A11 11 0 0 0 23 12Z"
      />
    </svg>
  );
}
