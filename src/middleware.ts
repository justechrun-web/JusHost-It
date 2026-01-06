import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/auth/verify-session';

const PLAN_ORDER = ['free', 'starter', 'pro', 'business'];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('__session')?.value;

  const protectedPaths = ['/dashboard', '/sites', '/billing', '/settings', '/support', '/admin', '/api'];
  const isAuthPath = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');

  const isProtectedPath = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If it's not a protected path, let it through.
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Specific public API routes that don't require auth
  const publicApiRoutes = ['/api/stripe/webhook', '/api/slack/actions'];
  if (publicApiRoutes.some(p => req.nextUrl.pathname.startsWith(p))) {
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
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Plan-based access control
    const userPlan = (decodedToken.plan as string) || 'free';
    
    if (req.nextUrl.pathname.startsWith('/dashboard/pro')) {
        if (PLAN_ORDER.indexOf(userPlan) < PLAN_ORDER.indexOf('pro')) {
            return NextResponse.redirect(new URL('/billing?reason=upgrade_required', req.url));
        }
    }
    
    if (req.nextUrl.pathname.startsWith('/dashboard/team')) {
        if (PLAN_ORDER.indexOf(userPlan) < PLAN_ORDER.indexOf('business')) {
            return NextResponse.redirect(new URL('/billing?reason=upgrade_required', req.url));
        }
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
    response.cookies.delete('__session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
