import { ConvexHttpClient } from "convex/browser";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    const token = await auth.getToken({ template: "convex" });
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);
    const token = await auth.getToken({ template: "convex" });
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
} 