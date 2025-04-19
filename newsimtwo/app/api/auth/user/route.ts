import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/auth-store"

// Get current user info
export async function GET(request: Request) {
  try {
    // In a real app, you would verify the JWT token
    // For this demo, we'll extract the username from the auth-token cookie
    const cookies = request.headers.get("cookie") || ""
    const tokenCookie = cookies.split(";").find((c) => c.trim().startsWith("auth-token="))

    if (!tokenCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const token = tokenCookie.split("=")[1]

    // Decode token (in a real app, verify JWT)
    const decoded = Buffer.from(token, "base64").toString()
    const username = decoded.split(":")[0]

    // Get user info
    const user = getUserByUsername(username)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user info (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 })
  }
}
