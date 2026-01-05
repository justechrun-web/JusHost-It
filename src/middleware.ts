
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from '@/lib/firebase/admin';

async function verifyToken(token: string) {
    try {
        const decodedToken = await adminAuth.verifySessionCookie(token, true);
        return { decodedToken, error: null };
    } catch (error) {
        return { decodedToken: null, error };
    }
}


export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__session")?.value;
  
  const protectedPaths = ["/dashboard", "/sites", "/billing", "/settings", "/support", "/admin", "/api"];
  const isAuthPath = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  
  const isProtectedPath = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p));

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If it's not a protected path, let it through.
  // This also implicitly allows pages like /pricing, /trust, etc. to be public.
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Specific public API routes that don't require auth
  const publicApiRoutes = ['/api/stripe/webhook', '/api/slack/actions'];
  if (publicApiRoutes.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { decodedToken, error } = await verifyToken(token);

    if (error || !decodedToken) {
      throw error || new Error("Token verification failed");
    }
      
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-ID', decodedToken.uid);

    const isAdmin = decodedToken.admin === true;
    requestHeaders.set('X-User-Is-Admin', String(isAdmin));
    
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // NOTE: Full Read-Only enforcement for non-GET requests would require inspecting
    // the user/org document here, which adds latency. A better pattern is to enforce
    // this at the API/Server Action level. This middleware provides a basic check.
    // if (org.readOnly?.enabled && req.method !== 'GET') {
    //   return new NextResponse('{"error":"Organization is in read-only mode."}', { status: 403, headers: { 'Content-Type': 'application/json' } });
    // }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("__session");
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
