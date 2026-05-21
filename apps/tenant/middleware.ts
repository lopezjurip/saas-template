import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  // In development, hostname is localhost:3002 — skip slug extraction
  if (hostname.startsWith("localhost")) {
    return NextResponse.next();
  }

  // Extract slug from {slug}.humane.cl
  const slug = hostname.split(".")[0] ?? "";
  if (!slug) return NextResponse.next();

  const response = NextResponse.next();
  response.headers.set("x-tenant-slug", slug);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
