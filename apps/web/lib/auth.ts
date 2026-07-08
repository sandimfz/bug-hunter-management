/**
 * Auth helpers — JWT-based session stored in localStorage.
 */

interface StoredUser {
  id: number
  email: string
  name: string
  plan: string
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function setAuth(user: StoredUser, token: string) {
  localStorage.setItem("user", JSON.stringify(user))
  localStorage.setItem("token", token)
}

export function isAuthenticated() {
  return getToken() !== null
}

export function logout() {
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}
