import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CdekFulfillmentService from "../../../../modules/cdek-fulfillment/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const city = String(req.query.city || "").trim()
  if (!city) {
    res.json({ points: [] })
    return
  }

  const provider = new CdekFulfillmentService(
    {},
    {
      clientId: process.env.CDEK_CLIENT_ID || "",
      clientSecret: process.env.CDEK_CLIENT_SECRET || "",
      fromCity: process.env.CDEK_FROM_CITY || "Москва",
    }
  )
  const points = await provider.listDeliveryPoints(city)
  res.json({ points })
}
