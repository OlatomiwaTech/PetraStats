import { NextResponse } from "next/server";

// POST /api/auth/logout - Logout and clear session token
export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.delete("session_token");

  return response;
}
