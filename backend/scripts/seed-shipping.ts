/**
 * Run after Medusa backend is started:
 *   npx ts-node -e "require('./scripts/seed-shipping.ts')"
 *   or: npx medusa exec ./scripts/seed-shipping.ts
 *
 * What this does:
 *   1. Ensures a RUB region exists (creates it if missing)
 *   2. Creates a Flat Rate shipping profile
 *   3. Adds 4 shipping options for Russia:
 *      - СДЭК — ПВЗ       290 ₽
 *      - СДЭК — Курьер    490 ₽
 *      - Почта России     250 ₽
 *      - Курьер по Москве 390 ₽
 */

const ADMIN_URL = process.env.MEDUSA_ADMIN_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "admin@brightic.local"
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || ""

const SHIPPING_OPTIONS = [
  { name: "СДЭК — ПВЗ",        amount: 29000 },  // amounts in kopecks
  { name: "СДЭК — Курьер",     amount: 49000 },
  { name: "Почта России",       amount: 25000 },
  { name: "Курьер по Москве",   amount: 39000 },
]

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${ADMIN_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${options.method || "GET"} ${path} → ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

async function main() {
  console.log("🔑 Logging in to Medusa Admin...")
  const { token } = await request<{ token: string }>("/auth/user/emailpass", {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  console.log("✓ Authenticated")

  // ── 1. Ensure RUB region ──────────────────────────────────────────────────
  const { regions } = await request<{ regions: Array<{ id: string; currency_code: string; name: string }> }>(
    "/admin/regions?limit=50",
    {},
    token
  )

  let regionId = regions.find((r) => r.currency_code === "rub")?.id

  if (regionId) {
    console.log(`✓ RUB region already exists (${regionId})`)
  } else {
    console.log("Creating RUB region...")
    const { region } = await request<{ region: { id: string } }>("/admin/regions", {
      method: "POST",
      body: JSON.stringify({
        name: "Russia",
        currency_code: "rub",
        countries: ["ru"],
        tax_rate: 0,
      }),
    }, token)
    regionId = region.id
    console.log(`✓ Created RUB region (${regionId})`)
  }

  // ── 2. Ensure shipping profile ────────────────────────────────────────────
  const { shipping_profiles } = await request<{
    shipping_profiles: Array<{ id: string; name: string; type: string }>
  }>("/admin/shipping-profiles?limit=50", {}, token)

  let profileId = shipping_profiles.find((p) => p.type === "default")?.id

  if (!profileId) {
    const { shipping_profile } = await request<{ shipping_profile: { id: string } }>(
      "/admin/shipping-profiles",
      { method: "POST", body: JSON.stringify({ name: "Default", type: "default" }) },
      token
    )
    profileId = shipping_profile.id
    console.log(`✓ Created shipping profile (${profileId})`)
  } else {
    console.log(`✓ Shipping profile exists (${profileId})`)
  }

  // ── 3. Get fulfillment providers ──────────────────────────────────────────
  const { fulfillment_providers } = await request<{
    fulfillment_providers: Array<{ id: string }>
  }>("/admin/fulfillment-providers", {}, token)

  const providerId = fulfillment_providers[0]?.id
  if (!providerId) throw new Error("No fulfillment providers found — ensure manual provider is installed")
  console.log(`✓ Using fulfillment provider: ${providerId}`)

  // ── 4. Create shipping options ────────────────────────────────────────────
  const { shipping_options: existing } = await request<{
    shipping_options: Array<{ name: string }>
  }>("/admin/shipping-options?limit=100", {}, token)

  const existingNames = new Set(existing.map((o) => o.name))

  for (const opt of SHIPPING_OPTIONS) {
    if (existingNames.has(opt.name)) {
      console.log(`  ⏭  "${opt.name}" already exists, skipping`)
      continue
    }

    await request("/admin/shipping-options", {
      method: "POST",
      body: JSON.stringify({
        name: opt.name,
        region_id: regionId,
        profile_id: profileId,
        provider_id: providerId,
        price_type: "flat_rate",
        amount: opt.amount,
        is_return: false,
        data: {},
      }),
    }, token)
    console.log(`  ✓ Created "${opt.name}" — ${opt.amount / 100} ₽`)
  }

  console.log("\n✅ Phase 2 shipping seed complete")
  console.log(`   Region ID: ${regionId}`)
  console.log("   Next: start Medusa, open Admin, verify options are visible in checkout")
}

main().catch((err) => {
  console.error("❌", err.message)
  process.exit(1)
})
