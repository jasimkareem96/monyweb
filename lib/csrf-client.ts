"use client"

/**
 * Client-side CSRF token management
 */
let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

async function fetchCSRFToken(): Promise<string> {
  const res = await fetch("/api/csrf-token", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to get CSRF token")
  }
  const data = await res.json()
  const token = data.csrfToken
  if (!token || typeof token !== "string") {
    throw new Error("Invalid CSRF token received")
  }
  return token
}

/**
 * Get CSRF token (with caching)
 */
export async function getCSRFToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken
  }

  // Return existing promise if already fetching
  if (tokenPromise) {
    return tokenPromise
  }

  // Fetch new token
  tokenPromise = fetchCSRFToken()
    .then((token) => {
      csrfToken = token
      tokenPromise = null
      return token
    })
    .catch((error) => {
      tokenPromise = null
      csrfToken = null
      throw error
    })

  return tokenPromise
}

/**
 * Get a fresh CSRF token (bypasses cache)
 */
export async function getFreshCSRFToken(): Promise<string> {
  csrfToken = null
  tokenPromise = null
  const token = await fetchCSRFToken()
  csrfToken = token
  return token
}

/**
 * Clear CSRF token cache
 */
export function clearCSRFToken() {
  csrfToken = null
  tokenPromise = null
}

/**
 * Add CSRF token to request headers
 */
export async function addCSRFHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
  // Use fresh token for state-changing requests to avoid cookie/token desync across tabs.
  const token = await getFreshCSRFToken()
  return {
    ...headers,
    "X-CSRF-Token": token,
  }
}

/**
 * Add CSRF token to form data
 */
export async function addCSRFToFormData(formData: FormData): Promise<FormData> {
  // Use fresh token for state-changing requests to avoid cookie/token desync across tabs.
  const token = await getFreshCSRFToken()
  formData.append("_csrf", token)
  return formData
}

/**
 * Add CSRF token to JSON body
 */
export async function addCSRFToBody(body: any): Promise<any> {
  // Use fresh token for state-changing requests to avoid cookie/token desync across tabs.
  const token = await getFreshCSRFToken()
  return {
    ...body,
    _csrf: token,
  }
}
