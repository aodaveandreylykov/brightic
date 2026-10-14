# Brightic Medusa backend (Russia)

This folder is a **copy kit** for the Medusa app that serves `http://localhost:9000`.
The live Admin/backend may live outside this repository — paste these files into that app.

## Admin checklist (Russia / RUB)

1. **Region** — Settings → Regions → Russia, currency `RUB`, country `ru`. Link the sales channel used by the storefront publishable key.
2. **Prices** — every product variant needs a RUB amount (same major units as the storefront catalog: `1100` → `1 100 ₽`).
3. **Location** — warehouse in Russia → fulfillment set → service zone covering only `ru`.
4. **Flat shipping options** (phase 1, Manual fulfillment):
   - Курьер по городу
   - СДЭК до пункта выдачи
   - Почта России
5. **Payments** on the RUB region:
   - enable Manual (`pp_system_default`) — «оплата при получении»
   - then YooKassa (`pp_yookassa_yookassa`) after env keys are set
   - do **not** enable Stripe on this region

## Install into your Medusa app

1. Copy `src/modules/yookassa-payment` and `src/modules/cdek-fulfillment` into the Medusa project.
2. Copy `src/api/store/cdek/delivery-points/route.ts`.
3. Merge `medusa-config.example.ts` into your `medusa-config.ts`.
4. Copy secrets from `.env.example` into the backend `.env` (never into the storefront).

### YooKassa

- Webhook URL: `{BACKEND_URL}/hooks/payment/yookassa`
- Return URL: `{STOREFRONT_URL}/checkout?pay=yookassa`
- Storefront calls `initiatePaymentSession` with `return_url`, then redirects to `confirmation_url`.

### CDEK (phase 3)

- Flat Admin options work without API keys.
- With `CDEK_CLIENT_ID` / `CDEK_CLIENT_SECRET`, the fulfillment provider can quote PVZ/courier rates and `/store/cdek/delivery-points?city=` feeds the checkout PVZ list.
- Set variant weight (grams) / metadata `weight_g` so quotes are accurate.

## Storefront contract

See `storefront/src/lib/admin-catalog.ts` for handles, metadata, and the RUB/shipping/payment contract.
