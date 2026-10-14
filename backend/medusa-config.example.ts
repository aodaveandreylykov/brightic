/**
 * Copy these bits into the Medusa app's medusa-config.ts
 * (the backend that serves http://localhost:9000).
 *
 * 1. Add the storefront origin to http.storeCors / http.authCors.
 * 2. Copy backend/src/modules/yookassa-payment and
 *    backend/src/modules/cdek-fulfillment into the Medusa app.
 * 3. Copy backend/src/api/store/cdek/delivery-points/route.ts for the PVZ list.
 * 4. Put YOOKASSA_* and CDEK_* secrets in backend .env — never in the storefront.
 * 5. In Admin: region Russia / RUB / country `ru`. Enable Manual first, then
 *    YooKassa (`pp_yookassa_yookassa`). Do not enable Stripe on this region.
 * 6. YooKassa webhook URL: {BACKEND_URL}/hooks/payment/yookassa
 *    Return URL: {STOREFRONT_URL}/checkout?pay=yookassa
 */

import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const STOREFRONT = process.env.STOREFRONT_URL || "http://localhost:8000"

module.exports = defineConfig({
  projectConfig: {
    http: {
      storeCors: `${STOREFRONT},http://localhost:8000`,
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: `${STOREFRONT},http://localhost:8000,http://localhost:9000`,
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/yookassa-payment",
            id: "yookassa",
            options: {
              shopId: process.env.YOOKASSA_SHOP_ID,
              secretKey: process.env.YOOKASSA_SECRET_KEY,
              returnUrl: process.env.YOOKASSA_RETURN_URL || `${STOREFRONT}/checkout?pay=yookassa`,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/cdek-fulfillment",
            id: "cdek",
            options: {
              clientId: process.env.CDEK_CLIENT_ID,
              clientSecret: process.env.CDEK_CLIENT_SECRET,
              fromCity: process.env.CDEK_FROM_CITY || "Москва",
            },
          },
        ],
      },
    },
  ],
})
