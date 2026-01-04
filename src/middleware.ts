import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__session")?.value;
  
  const protectedPaths = ["/dashboard", "/sites", "/billing", "/settings", "/support", "/admin"];
  const isAuthPath = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  
  const isProtectedPath = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If it's not a protected path, let it through.
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verifyUrl = new URL('/api/auth/verify-token', req.url);
    const verifyRes = await fetch(verifyUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!verifyRes.ok) {
        throw new Error('Token verification failed');
    }

    const decodedToken = await verifyRes.json();
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-ID', decodedToken.uid);

    const isAdmin = decodedToken.admin === true;
    requestHeaders.set('X-User-Is-Admin', String(isAdmin));
    
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
       return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error("Middleware Auth Error:", error);
    // Redirect to login on any auth error (e.g., expired cookie)
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Clear the invalid cookie
    response.cookies.delete("__session");
    return response;
  }
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
    '/((?!_next/static|_next/image|favicon.ico|trust|sla|pricing|api/slack/actions|api/stripe/webhook|api/auth/verify-token).*)',
  ],
};
