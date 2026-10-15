import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const STOREFRONT = process.env.STOREFRONT_URL || "http://localhost:8000"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: `${STOREFRONT},http://localhost:8000`,
      adminCors: process.env.ADMIN_CORS || "http://localhost:5173,http://localhost:9000",
      authCors: `${STOREFRONT},http://localhost:5173,http://localhost:9000`,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    // Payment: YooKassa (phase 3) + Manual cash-on-delivery fallback
    // Uncomment and configure after phase 3 setup:
    // {
    //   resolve: "@medusajs/medusa/payment",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "<yookassa-medusa-package>",
    //         id: "yookassa",
    //         options: {
    //           shopId: process.env.YOOKASSA_SHOP_ID,
    //           secretKey: process.env.YOOKASSA_SECRET_KEY,
    //           returnUrl: process.env.YOOKASSA_RETURN_URL,
    //         },
    //       },
    //     ],
    //   },
    // },
  ],
})
