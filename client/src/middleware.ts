import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isPublicPath = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/signup';
  
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');
  
  // Always allow auth callback to proceed
  if (isAuthCallback) {
    return NextResponse.next();
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};