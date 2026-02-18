export interface EmailVerifiedPayload {
  email: string
  verified: boolean
  firstName?: string
  lastName?: string
  error?: string
}

export function parseEmailVerifiedUrl(
  url: string
): EmailVerifiedPayload | null {
  if (!url || !url.includes('email-verified')) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const email = parsed.searchParams.get('email')
  const verifiedRaw = parsed.searchParams.get('verified')
  if (!email || !verifiedRaw) return null

  const verified = verifiedRaw === 'true'
  const firstName = parsed.searchParams.get('firstName') ?? undefined
  const lastName = parsed.searchParams.get('lastName') ?? undefined
  const error = parsed.searchParams.get('error') ?? undefined

  return {
    email,
    verified,
    firstName,
    lastName,
    error,
  }
}
