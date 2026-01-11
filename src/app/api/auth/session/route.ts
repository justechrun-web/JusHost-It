
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

// POST /api/auth/session
// Creates a session cookie from a client-provided ID token.
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
        name: "__session",
        value: sessionCookie,
        maxAge: expiresIn / 1000, // maxAge is in seconds
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax" as const,
    };
    
    // Set cookie in the response.
    cookies().set(options);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Session cookie creation failed:", error);
    return new NextResponse("Failed to create session.", { status: 401 });
  }
}
