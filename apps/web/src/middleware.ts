import { NextRequest, NextFetchEvent, NextResponse } from "next/server";

const PUBLIC_ROUTES = ['/login', '/register'];

export function middleware(req: NextRequest, _: NextFetchEvent) {
  const token     = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;
  const isPublic  = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
