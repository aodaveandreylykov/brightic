export const STORE_CURRENCY = "rub"
export const STORE_COUNTRY = "ru"
export const RU_PHONE_PLACEHOLDER = "+7 (999) 000-00-00"

export const RU_PROVINCES = [
  "Москва",
  "Санкт-Петербург",
  "Севастополь",
  "Московская область",
  "Ленинградская область",
  "Республика Адыгея",
  "Республика Алтай",
  "Республика Башкортостан",
  "Республика Бурятия",
  "Республика Дагестан",
  "Донецкая Народная Республика",
  "Республика Ингушетия",
  "Кабардино-Балкарская Республика",
  "Республика Калмыкия",
  "Карачаево-Черкесская Республика",
  "Республика Карелия",
  "Республика Коми",
  "Республика Крым",
  "Луганская Народная Республика",
  "Республика Марий Эл",
  "Республика Мордовия",
  "Республика Саха (Якутия)",
  "Республика Северная Осетия — Алания",
  "Республика Татарстан",
  "Республика Тыва",
  "Удмуртская Республика",
  "Республика Хакасия",
  "Чеченская Республика",
  "Чувашская Республика",
  "Алтайский край",
  "Забайкальский край",
  "Камчатский край",
  "Краснодарский край",
  "Красноярский край",
  "Пермский край",
  "Приморский край",
  "Ставропольский край",
  "Хабаровский край",
  "Амурская область",
  "Архангельская область",
  "Астраханская область",
  "Белгородская область",
  "Брянская область",
  "Владимирская область",
  "Волгоградская область",
  "Вологодская область",
  "Воронежская область",
  "Запорожская область",
  "Ивановская область",
  "Иркутская область",
  "Калининградская область",
  "Калужская область",
  "Кемеровская область",
  "Кировская область",
  "Костромская область",
  "Курганская область",
  "Курская область",
  "Липецкая область",
  "Магаданская область",
  "Мурманская область",
  "Нижегородская область",
  "Новгородская область",
  "Новосибирская область",
  "Омская область",
  "Оренбургская область",
  "Орловская область",
  "Пензенская область",
  "Псковская область",
  "Ростовская область",
  "Рязанская область",
  "Самарская область",
  "Саратовская область",
  "Сахалинская область",
  "Свердловская область",
  "Смоленская область",
  "Тамбовская область",
  "Тверская область",
  "Томская область",
  "Тульская область",
  "Тюменская область",
  "Ульяновская область",
  "Херсонская область",
  "Челябинская область",
  "Ярославская область",
  "Еврейская автономная область",
  "Ненецкий автономный округ",
  "Ханты-Мансийский автономный округ — Югра",
  "Чукотский автономный округ",
  "Ямало-Ненецкий автономный округ",
]

export type ShippingKind = "cdek" | "post" | "courier" | "other"

export function pickRubRegion<T extends { id?: string; currency_code?: string }>(regions: T[]): T | undefined {
  return regions.find((item) => item.currency_code === STORE_CURRENCY) ?? regions[0]
}

export function ruPhoneDigits(raw: string) {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`
  if (!digits.startsWith("7")) digits = `7${digits}`
  return digits.slice(0, 11)
}

export function formatRuPhone(raw: string) {
  const digits = ruPhoneDigits(raw)
  const rest = digits.slice(1)
  let out = "+7"
  if (!rest) return out
  out += ` (${rest.slice(0, 3)}`
  if (rest.length < 3) return out
  out += ")"
  if (rest.length > 3) out += ` ${rest.slice(3, 6)}`
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`
  return out
}

export function isRuPhone(raw: string) {
  return ruPhoneDigits(raw).length === 11
}

export function isRuPostal(raw: string) {
  return /^\d{6}$/.test(raw.trim())
}

export function shippingKind(name?: string | null): ShippingKind {
  const value = (name || "").toLowerCase()
  if (/сдэк|cdek|пвз/.test(value)) return "cdek"
  if (/почт|pochta|post/.test(value)) return "post"
  if (/курьер|courier/.test(value)) return "courier"
  return "other"
}

export function isYookassaProvider(id?: string | null) {
  return Boolean(id && /yookassa|yoo_kassa|юkassa|yoo-kassa/i.test(id))
}

export function isManualProvider(id?: string | null) {
  return Boolean(id?.startsWith("pp_system_default"))
}

export function isStripeProvider(id?: string | null) {
  return Boolean(id?.startsWith("pp_stripe_"))
}

export function paymentProviderLabel(id: string) {
  if (isManualProvider(id)) return "Оплата при получении"
  if (isYookassaProvider(id)) return "Карта / СБП (ЮKassa)"
  return id
}
