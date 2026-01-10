import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/auth/verify-session';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('__session')?.value;

  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/sites') ||
    req.nextUrl.pathname.startsWith('/billing') ||
    req.nextUrl.pathname.startsWith('/settings') ||
    req.nextUrl.pathname.startsWith('/support');

  const isAuthPath = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decodedToken = await verifySessionCookie(token);

    if (!decodedToken) {
      throw new Error('Invalid session cookie');
    }
    
    // Admin check
    const isAdmin = decodedToken.admin === true;
    if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
      // For non-admins trying to access /admin, you might want to redirect
      // to a specific page or just back to the dashboard.
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
      
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-ID', decodedToken.uid);
    requestHeaders.set('X-User-Is-Admin', String(isAdmin));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    // Clear the potentially invalid cookie
    response.cookies.delete('__session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/stripe/webhook (Stripe webhooks are public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (image files)
     */
    '/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
