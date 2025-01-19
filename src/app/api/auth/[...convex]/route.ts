import { ConvexHttpClient } from "convex/browser";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  const token = await auth.getToken({ template: "convex" });
  return new NextResponse(JSON.stringify({ token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  const token = await auth.getToken({ template: "convex" });
  return new NextResponse(JSON.stringify({ token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
} 