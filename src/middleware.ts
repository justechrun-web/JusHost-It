
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Initialize Firebase Admin SDK
let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0];
}
const auth = getAuth(app);
const db = getFirestore(app);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__session")?.value;
  
  const protectedPaths = ["/dashboard", "/sites", "/billing", "/settings", "/support"];
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isAuthPath = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (token) {
    if (isAuthPath) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // If it's not a protected path, let it through.
  if (!protectedPaths.some(p => req.nextUrl.pathname.startsWith(p)) && !isAdminPath) {
    return NextResponse.next();
  }
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { uid } = await auth.verifySessionCookie(token, true);
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
        throw new Error("User not found in Firestore.");
    }
    
    const userData = userDoc.data()!;
    const userRole = userData.role;
    const billingStatus = userData.subscriptionStatus;

    // Admins have access to everything.
    if (userRole === "admin") {
      const idTokenResult = await auth.getUser(uid);
      if(!idTokenResult.customClaims?.admin) {
        await auth.setCustomUserClaims(uid, { admin: true });
      }
      return NextResponse.next();
    }

    // If it's an admin path and user is not an admin, redirect.
    if (isAdminPath) {
       return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // For all other protected paths, check for active billing.
    if (billingStatus !== "active" && billingStatus !== "trialing") {
      return NextResponse.redirect(new URL("/billing-required", req.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Session verification failed:", error);
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
    '/((?!_next/static|_next/image|favicon.ico|trust|sla|pricing|api/stripe/webhook).*)',
  ],
};
