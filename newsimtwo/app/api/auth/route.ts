import { NextResponse } from "next/server"
import { getUsersStore } from "@/lib/auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // For demo purposes, allow login with any credentials
    // In a real app, you would validate against your database
    if (username === "demo" && password === "password") {
      // Generate token (in a real app, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

      // Return user info and token
      return NextResponse.json({
        user: {
          id: "1",
          username: "demo",
          email: "demo@example.com",
          name: "Demo User",
        },
        token,
      })
    }

    // Get users from store
    const users = getUsersStore()

    // Find user by username
    const user = users.find((u) => u.username === username)

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token (in a real app, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

    // Return user info (excluding password) and token
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
