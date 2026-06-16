import "server-only";

import { NextResponse } from "next/server";

/**
 * Streams a public avatar's bytes through the app. Given the relative storage `src` from a
 * `storage_*` view, it fetches the object server-side and pipes it back with the upstream
 * content-type. We proxy rather than 307-redirect because in dev the Supabase storage origin is
 * plain `http://127.0.0.1:<port>`; a redirect from the HTTPS app gets auto-upgraded to HTTPS by
 * the browser and fails TLS. Proxying keeps the browser on the same HTTPS origin and works in dev
 * and prod alike. Returns 404 when there is no avatar (so a shadcn `AvatarFallback` shows initials).
 *
 * @example return streamPublicAvatar(data?.["src"]);
 */
export async function streamPublicAvatar(src: string | null | undefined): Promise<NextResponse> {
  if (!src) return new NextResponse(null, { status: 404 });

  const upstream = new URL(src, process.env["NEXT_PUBLIC_SUPABASE_URL"]!);
  const res = await fetch(upstream, { cache: "no-store" });
  if (!res.ok || !res.body) return new NextResponse(null, { status: 404 });

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/png",
      // Short cache so a fresh load re-resolves to the current file soon after an upload, while
      // avoiding a re-fetch on every render within a page session.
      "Cache-Control": "private, max-age=10",
    },
  });
}
