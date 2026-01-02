import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifySessionCookie(token, true);
        return NextResponse.json(decodedToken);
    } catch (error) {
        console.error("Token verification error:", error);
        return new NextResponse("Unauthorized", { status: 401 });
    }
}
