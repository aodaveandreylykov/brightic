import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// Use sandbox when CDEK test credentials detected (client id starts with EMscd)
const IS_CDEK_TEST = (process.env.CDEK_CLIENT_ID || "").startsWith("EMscd")
const CDEK_BASE = IS_CDEK_TEST ? "https://api.edu.cdek.ru/v2" : "https://api.cdek.ru/v2"
const CDEK_API = CDEK_BASE
const CDEK_TOKEN_URL = `${CDEK_BASE}/oauth/token`

let cachedToken: { value: string; expiresAt: number } | null = null

async function getCdekToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const clientId = process.env.CDEK_CLIENT_ID
  const clientSecret = process.env.CDEK_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("CDEK_CLIENT_ID / CDEK_CLIENT_SECRET not set")
  }

  const res = await fetch(CDEK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    throw new Error(`CDEK OAuth failed: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cachedToken.value
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const city = String(req.query?.city || "").trim()

  if (!city) {
    return res.status(400).json({ error: "city is required", points: [] })
  }

  try {
    const token = await getCdekToken()

    const params = new URLSearchParams({
      city_name: city,
      type: "PVZ",
      is_handout: "true",
      size: "30",
    })

    const cdekRes = await fetch(`${CDEK_API}/deliverypoints?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!cdekRes.ok) {
      return res.status(200).json({ points: [] })
    }

    const raw = (await cdekRes.json()) as Array<{
      code?: string
      name?: string
      location?: { address?: string; city?: string }
    }>

    const points = (raw || [])
      .filter((p) => p.code && p.location?.address)
      .map((p) => ({
        code: p.code!,
        name: p.name || p.code!,
        address: p.location!.address!,
        city: p.location?.city || city,
      }))

    return res.status(200).json({ points })
  } catch (err) {
    // Never expose internal errors to the storefront
    console.error("[CDEK route]", err instanceof Error ? err.message : err)
    return res.status(200).json({ points: [] })
  }
}
