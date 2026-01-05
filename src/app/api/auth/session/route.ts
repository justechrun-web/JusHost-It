
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

// POST /api/auth/session
// Creates a session cookie from a client-provided ID token.
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return new NextResponse("ID token is required.", { status: 400 });
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
        name: "__session",
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
    };
    
    // Set cookie in the response.
    cookies().set(options);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Session cookie creation failed:", error);
    return new NextResponse("Failed to create session.", { status: 401 });
  }
}
