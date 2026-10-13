import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"

type Options = {
  clientId: string
  clientSecret: string
  fromCity: string
}

type CdekPoint = {
  code: string
  name: string
  address: string
  city: string
}

const TARIFF_PVZ = 136
const TARIFF_COURIER = 137

class CdekFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "cdek"

  protected options_: Options
  protected token: { value: string; expires: number } | null = null

  constructor(container: unknown, options: Options) {
    super()
    this.options_ = options
  }

  async getFulfillmentOptions() {
    return [
      { id: "cdek_pvz", name: "СДЭК до пункта выдачи" },
      { id: "cdek_courier", name: "СДЭК курьер" },
    ]
  }

  async validateOption(option: Record<string, unknown>) {
    return option.id === "cdek_pvz" || option.id === "cdek_courier"
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const shipping = (context.shipping_address || {}) as { city?: string; address_2?: string }
    const pvz = String(data.cdek_pvz || shipping.address_2 || "")
    if (optionData.id === "cdek_pvz" && !pvz.trim()) {
      throw new Error("Укажите пункт выдачи СДЭК")
    }
    return { ...data, cdek_pvz: pvz.replace(/^ПВЗ:\s*/, "") }
  }

  async canCalculate() {
    return true
  }

  async calculatePrice(
    optionData: { id?: string },
    data: Record<string, unknown>,
    context: {
      from_location?: { city?: string }
      to_address?: { city?: string; province?: string; postal_code?: string }
      items?: { quantity?: number; variant?: { weight?: number } }[]
    }
  ) {
    const toCity = context.to_address?.city
    if (!toCity) {
      return { calculated_amount: 0 }
    }
    const weightGrams = Math.max(
      500,
      (context.items || []).reduce((sum, item) => {
        const grams = Number(item.variant?.weight) || 1500
        return sum + grams * Math.max(1, Number(item.quantity) || 1)
      }, 0)
    )
    const tariff = optionData.id === "cdek_courier" ? TARIFF_COURIER : TARIFF_PVZ
    const quote = await this.quote(toCity, weightGrams, tariff)
    return { calculated_amount: quote }
  }

  async createFulfillment() {
    return { data: {} }
  }

  async cancelFulfillment() {
    return {}
  }

  async createReturnFulfillment() {
    return { data: {} }
  }

  async listDeliveryPoints(city: string): Promise<CdekPoint[]> {
    const token = await this.accessToken()
    const url = new URL("https://api.cdek.ru/v2/deliverypoints")
    url.searchParams.set("city", city)
    url.searchParams.set("type", "PVZ")
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return []
    const payload = (await response.json()) as {
      code?: string
      name?: string
      location?: { address?: string; city?: string }
    }[]
    return (Array.isArray(payload) ? payload : []).slice(0, 40).map((point) => ({
      code: String(point.code || ""),
      name: String(point.name || point.code || "ПВЗ"),
      address: String(point.location?.address || ""),
      city: String(point.location?.city || city),
    }))
  }

  private async quote(toCity: string, weightGrams: number, tariffCode: number) {
    const token = await this.accessToken()
    const response = await fetch("https://api.cdek.ru/v2/calculator/tariff", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tariff_code: tariffCode,
        from_location: { city: this.options_.fromCity || "Москва" },
        to_location: { city: toCity },
        packages: [{ weight: weightGrams }],
      }),
    })
    if (!response.ok) return 0
    const payload = (await response.json()) as { total_sum?: number }
    const major = Number(payload.total_sum) || 0
    // Storefront and Admin prices are major RUB units.
    return Math.round(major)
  }

  private async accessToken() {
    if (this.token && this.token.expires > Date.now() + 30_000) return this.token.value
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.options_.clientId,
      client_secret: this.options_.clientSecret,
    })
    const response = await fetch("https://api.cdek.ru/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    if (!response.ok) throw new Error("CDEK OAuth failed")
    const payload = (await response.json()) as { access_token?: string; expires_in?: number }
    if (!payload.access_token) throw new Error("CDEK OAuth failed")
    this.token = {
      value: payload.access_token,
      expires: Date.now() + (Number(payload.expires_in) || 3600) * 1000,
    }
    return this.token.value
  }
}

export default CdekFulfillmentService
