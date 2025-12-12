"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { getCSRFToken } from "@/lib/csrf-client"

function CSRFInitializer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // Initialize CSRF token when user is authenticated
    if (session?.user) {
      getCSRFToken().catch((error) => {
        console.error("Failed to initialize CSRF token:", error)
      })
    }
  }, [session])

  return <>{children}</>
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider 
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      <CSRFInitializer>{children}</CSRFInitializer>
    </SessionProvider>
  )
}

