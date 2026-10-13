export function formatMoney(amount: unknown) {
  const value = typeof amount === "number" ? amount : Number(amount)
  if (!Number.isFinite(value)) return ""
  return `$ ${Math.round(value)}`
}

export function moneyAmount(amount: unknown, fallback = 0) {
  const value = typeof amount === "number" ? amount : Number(amount)
  return Number.isFinite(value) ? value : fallback
}
