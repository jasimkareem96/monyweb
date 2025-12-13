import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials")
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            // Log failed login attempt (IP will be logged separately if needed)
            try {
              const { logFailedLogin } = await import("@/lib/security-logger")
              await logFailedLogin(credentials.email, "unknown", "unknown", "User not found")
            } catch (logError) {
              console.error("Failed to log failed login:", logError)
            }
            console.error("User not found:", credentials.email)
            return null
          }

          if (user.isBlocked) {
            // Log blocked user attempt
            try {
              const { logFailedLogin } = await import("@/lib/security-logger")
              await logFailedLogin(credentials.email, "unknown", "unknown", "User is blocked")
            } catch (logError) {
              console.error("Failed to log blocked user:", logError)
            }
            console.error("User is blocked:", credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            // Log failed login attempt
            try {
              const { logFailedLogin } = await import("@/lib/security-logger")
              await logFailedLogin(credentials.email, "unknown", "unknown", "Invalid password")
            } catch (logError) {
              console.error("Failed to log failed login:", logError)
            }
            console.error("Invalid password for user:", credentials.email)
            return null
          }

          // Log successful login (IP will be logged in route handler)
          try {
            const { logSuccessfulLogin } = await import("@/lib/security-logger")
            await logSuccessfulLogin(user.id, user.email, "unknown", "unknown")
          } catch (logError) {
            console.error("Failed to log successful login:", logError)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone ?? undefined,
            profileImage: user.profileImage ?? undefined,
          }
        } catch (error: any) {
          console.error("Authorization error:", error)
          console.error("Error details:", {
            code: error.code,
            message: error.message,
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (user) {
          token.id = user.id || ""
          token.role = user.role || "BUYER"
          token.email = user.email || ""
          token.name = user.name ?? undefined
          token.phone = user.phone ?? undefined
          token.profileImage = user.profileImage ?? undefined
        }
        // Ensure token always has required fields
        if (!token.id) token.id = ""
        if (!token.role) token.role = "BUYER"
        if (!token.email) token.email = ""
        return token
      } catch (error: any) {
        console.error("JWT callback error:", error)
        console.error("Error stack:", error?.stack)
        // Return a minimal valid token even if there's an error
        return {
          ...token,
          id: token?.id || "",
          role: token?.role || "BUYER",
          email: token?.email || "",
        }
      }
    },
    async session({ session, token }) {
      try {
        // Ensure session exists
        if (!session) {
          console.error("Session is null in session callback")
          return {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            user: {
              id: "",
              email: "",
              role: "BUYER",
              name: undefined,
            }
          } as any
        }
        
        // Ensure session.user exists
        if (!session.user) {
          console.error("Session.user is null in session callback")
          session.user = {
            id: "",
            email: "",
            role: "BUYER",
            name: undefined,
          } as any
        }
        
        // If no token, return session as-is (might be initial load)
        if (!token) {
          console.warn("Token is null in session callback")
          return session
        }

        // Safely assign token values to session
        if (token.id) {
          session.user.id = token.id as string
        }
        if (token.role) {
          session.user.role = token.role as string
        }
        if (token.email) {
          session.user.email = token.email as string
        }
        if (token.name !== undefined) {
          session.user.name = token.name as string | undefined
        }
        if (token.phone !== undefined) {
          ;(session.user as any).phone = token.phone as string | undefined
        }
        if (token.profileImage !== undefined) {
          ;(session.user as any).profileImage = token.profileImage as string | undefined
        }
        
        return session
      } catch (error: any) {
        console.error("Session callback error:", error)
        console.error("Error stack:", error?.stack)
        // Return a minimal valid session even if there's an error
        return {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "",
            email: "",
            role: "BUYER",
            name: undefined,
          }
        } as any
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Custom error page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET
    // Only enforce in production runtime, not during build
    if (!secret && process.env.NODE_ENV === "production" && typeof window === "undefined" && process.env.VERCEL && !process.env.NEXT_PHASE) {
      throw new Error("NEXTAUTH_SECRET must be set in production environment")
    }
    return secret || "dev-secret-key-change-in-production-12345"
  })(),
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

