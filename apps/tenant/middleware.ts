import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const parts = hostname.split(".");

  // bare localhost (e.g. "localhost:8002") has no subdomain — skip
  if (parts.length === 1) {
    return NextResponse.next();
  }

  // Extract slug from {slug}.humane.cl or {slug}.localhost:8002
  const slug = parts[0] ?? "";
  if (!slug) return NextResponse.next();

  const response = NextResponse.next();
  response.headers.set("x-tenant-slug", slug);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
