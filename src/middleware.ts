'use server';

import {NextRequest, NextResponse} from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/sites',
  '/billing',
  '/support',
  '/settings',
];

const adminRoutes = ['/admin'];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string) {
  return adminRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const status = request.cookies.get('auth-status')?.value;
  const isAdmin = request.cookies.get('is-admin')?.value === 'true';

  // If user is trying to access a protected route without an active or trialing subscription
  if (isProtectedRoute(pathname)) {
    if (status !== 'active' && status !== 'trialing') {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
  }

  // If a non-admin user tries to access an admin route
  if (isAdminRoute(pathname) && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and root-level static pages like /pricing, /login, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|forgot-password|trust|sla|pricing).*)',
  ],
};
