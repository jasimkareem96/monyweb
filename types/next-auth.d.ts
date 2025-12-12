import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      phone?: string
      profileImage?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    phone?: string
    profileImage?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    email?: string
    name?: string
    phone?: string
    profileImage?: string
  }
}

