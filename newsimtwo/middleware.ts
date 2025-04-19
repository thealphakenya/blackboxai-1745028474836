import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware for demonstration
// In a real app, you would verify JWT tokens properly
export function middleware(request: NextRequest) {
  // Check if the request is for the dashboard or other protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Get the token from the request cookies
    const token = request.cookies.get("auth-token")?.value

    // If there's no token, redirect to the login page
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // In a real app, you would verify the token here
    // For this demo, we'll just let the request through
  }

  // Allow public routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
}
