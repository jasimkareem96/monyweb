"use client"

/**
 * Client-side CSRF token management
 */
let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

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
  tokenPromise = fetch("/api/csrf-token")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to get CSRF token")
      }
      return res.json()
    })
    .then((data) => {
      const token = data.csrfToken
      if (!token || typeof token !== "string") {
        throw new Error("Invalid CSRF token received")
      }
      csrfToken = token
      tokenPromise = null
      return token
    })
    .catch((error) => {
      tokenPromise = null
      csrfToken = null
      throw error
    }) as Promise<string>

  return tokenPromise
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
  const token = await getCSRFToken()
  return {
    ...headers,
    "X-CSRF-Token": token,
  }
}

/**
 * Add CSRF token to form data
 */
export async function addCSRFToFormData(formData: FormData): Promise<FormData> {
  const token = await getCSRFToken()
  formData.append("_csrf", token)
  return formData
}

/**
 * Add CSRF token to JSON body
 */
export async function addCSRFToBody(body: any): Promise<any> {
  const token = await getCSRFToken()
  return {
    ...body,
    _csrf: token,
  }
}
