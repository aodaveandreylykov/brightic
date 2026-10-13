import { STORE_CURRENCY } from "@/lib/ru"

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: STORE_CURRENCY.toUpperCase(),
  maximumFractionDigits: 0,
})

export function formatMoney(amount: unknown) {
  const value = typeof amount === "number" ? amount : Number(amount)
  if (!Number.isFinite(value)) return ""
  return rub.format(Math.round(value))
}

export function moneyAmount(amount: unknown, fallback = 0) {
  const value = typeof amount === "number" ? amount : Number(amount)
  return Number.isFinite(value) ? value : fallback
}
