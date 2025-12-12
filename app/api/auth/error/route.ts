import { NextRequest, NextResponse } from "next/server"

/**
 * NextAuth error route handler
 * Redirects to the custom error page
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const error = url.searchParams.get("error") || "Default"
  
  // Redirect to custom error page
  return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url))
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const error = url.searchParams.get("error") || "Default"
  
  // Redirect to custom error page
  return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url))
}
