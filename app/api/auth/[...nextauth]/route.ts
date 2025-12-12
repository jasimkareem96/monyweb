import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Export handlers for Next.js App Router
export { handler as GET, handler as POST }
