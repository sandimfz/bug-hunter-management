import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          return {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            accessToken: data.token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken
        token.userId = user.id
        // Sync backend JWT to localStorage for api-client.ts
        if (typeof window !== "undefined" && token.accessToken) {
          localStorage.setItem("token", token.accessToken as string)
          localStorage.setItem("user", JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
          }))
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session as { accessToken?: string }).accessToken = token.accessToken as string
        ;(session.user as { id?: string }).id = token.userId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET ?? "bughunter-nextauth-secret-dev",
}
