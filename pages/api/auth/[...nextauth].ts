import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Pages Router API route (stable for NextAuth v4).
// This avoids App Router route handler incompatibilities (req.query.nextauth).
export default NextAuth(authOptions)

