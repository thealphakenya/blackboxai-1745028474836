import { NextResponse } from "next/server"
import { getUsersStore, saveUser } from "@/lib/auth-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Check if username already exists
    const users = getUsersStore()
    if (users.some((user) => user.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Check if email already exists
    if (users.some((user) => user.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In a real app, you would hash this password
      name: username, // Default name to username
      createdAt: new Date().toISOString(),
    }

    // Save user
    saveUser(newUser)

    // Generate token (in a real app, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

    // Return user info (excluding password) and token
    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
