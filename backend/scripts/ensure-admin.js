#!/usr/bin/env node
/**
 * Creates admin user directly in Postgres.
 * Runs via: node scripts/ensure-admin.js
 */
const { Client } = require("pg")
const { randomUUID } = require("crypto")

async function main() {
  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD
  if (!email || !password) {
    console.log("[admin] MEDUSA_ADMIN_EMAIL/PASSWORD not set, skipping")
    return
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  })
  await client.connect()

  try {
    // Check if Medusa user already exists
    const userRes = await client.query('SELECT id FROM "user" WHERE email = $1', [email])
    if (userRes.rows.length > 0) {
      console.log(`[admin] User ${email} already exists (${userRes.rows[0].id})`)
      return
    }

    const now = new Date().toISOString()
    const userId = `user_${randomUUID().replace(/-/g, "").slice(0, 26)}`

    // Create user
    await client.query(
      `INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, "Admin", "Brightic", now, now]
    )
    console.log(`[admin] Created user ${userId}`)

    // Link auth identity to user (update app_metadata)
    const authRes = await client.query(
      `SELECT id FROM auth_identity WHERE id IN (
         SELECT auth_identity_id FROM auth_identity_provider
         WHERE entity_id = $1 AND provider = 'emailpass'
       )`,
      [email]
    )

    if (authRes.rows.length > 0) {
      const authId = authRes.rows[0].id
      // Update app_metadata with user_id
      await client.query(
        `UPDATE auth_identity SET app_metadata = $1 WHERE id = $2`,
        [JSON.stringify({ user_id: userId }), authId]
      )
      console.log(`[admin] Linked auth identity ${authId} → user ${userId}`)
    } else {
      console.log(`[admin] No auth identity found for ${email} — run /auth/user/emailpass/register first`)
    }

    console.log(`[admin] ✅ Admin ${email} ready`)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error("[admin] Error:", e.message)
  process.exit(0) // Don't block startup
})
