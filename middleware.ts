import { type NextRequest, NextResponse } from "next/server";
import { catalogRedirectPath } from "@/lib/catalog-legacy-redirect";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const dest = catalogRedirectPath(request.nextUrl.searchParams);
    if (dest) {
      const url = request.nextUrl.clone();
      url.pathname = dest;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
