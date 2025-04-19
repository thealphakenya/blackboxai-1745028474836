// This is a simple in-memory user store for demonstration purposes
// In a real application, you would use a database

// Define user type
export type User = {
  id: string
  username: string
  email: string
  password: string
  name: string
  createdAt: string
}

// Initialize with a demo user
let users: User[] = [
  {
    id: "1",
    username: "demo",
    email: "demo@example.com",
    password: "password",
    name: "Demo User",
    createdAt: new Date().toISOString(),
  },
]

// Get all users
export function getUsersStore(): User[] {
  return users
}

// Save a new user
export function saveUser(user: User): void {
  users.push(user)
}

// Find user by ID
export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id)
}

// Find user by username
export function getUserByUsername(username: string): User | undefined {
  return users.find((user) => user.username === username)
}

// Find user by email
export function getUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email)
}

// Update user
export function updateUser(id: string, userData: Partial<User>): User | undefined {
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return undefined

  users[index] = { ...users[index], ...userData }
  return users[index]
}

// Delete user
export function deleteUser(id: string): boolean {
  const initialLength = users.length
  users = users.filter((user) => user.id !== id)
  return users.length < initialLength
}
