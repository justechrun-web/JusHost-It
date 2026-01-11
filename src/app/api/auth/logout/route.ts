
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  const options = {
    name: "__session",
    value: "",
    maxAge: -1,
  };

  cookies().set(options);
  
  return NextResponse.json({}, { status: 200 });
}
