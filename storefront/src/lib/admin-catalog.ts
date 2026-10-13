/**
 * Contract between Medusa Admin and the Brightic storefront.
 *
 * Create these products in Admin (http://localhost:9000/app) with matching
 * handles, a published variant, a RUB price, inventory, and the Default
 * Sales Channel tied to the storefront publishable key.
 *
 * Region: Russia, currency RUB, country `ru`.
 *
 * Product metadata:
 *   band            "best-sellers" | "most-popular"  — homepage rails
 *   blurb           short catalog subtitle
 *   material        PDP spec
 *   category        PDP spec
 *   color           PDP spec
 *   hide_on_mobile  "true" to hide a homepage card on small screens
 *   sort            number, lower first
 *   weight_g        grams, needed later for CDEK calculated rates
 *
 * Shipping: Settings → Locations (warehouse in Russia) → fulfillment set →
 * service zone covering only `ru` → flat shipping options:
 *   Курьер по городу
 *   СДЭК до пункта выдачи
 *   Почта России
 * Calculated CDEK rates use the backend CDEK fulfillment module.
 *
 * Payments: enable Manual (`pp_system_default`) on the RUB region first
 * («оплата при получении»), then YooKassa (`pp_yookassa_yookassa`) once
 * YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY are set on the backend.
 * Do not enable Stripe on the Russia region.
 */

export type AdminLamp = {
  handle: string
  title: string
  blurb: string
  price: number
  catalogImage: string
  band?: "best-sellers" | "most-popular"
  sort?: number
  hideOnMobile?: boolean
  material: string
  category: string
  color: string
}

export const ADMIN_LAMPS: AdminLamp[] = [
  {
    handle: "momentum-beam",
    title: "Momentum Beam",
    blurb: "dynamic directional flow",
    price: 1100,
    catalogImage: "/catalog/momentum.png",
    material: "metal",
    category: "living room",
    color: "graphite",
  },
  {
    handle: "flux-line",
    title: "Flux Line",
    blurb: "fluid modern light form",
    price: 750,
    catalogImage: "/catalog/flux.png",
    band: "best-sellers",
    sort: 1,
    material: "marble/metal",
    category: "living room",
    color: "beige",
  },
  {
    handle: "stria-nova",
    title: "Stria Nova",
    blurb: "clean linear design",
    price: 900,
    catalogImage: "/catalog/stria.png",
    band: "most-popular",
    sort: 2,
    material: "metal",
    category: "office",
    color: "brass",
  },
  {
    handle: "lumenweave",
    title: "Lumenweave",
    blurb: "textured layered glow",
    price: 650,
    catalogImage: "/catalog/lumenweave.png",
    band: "best-sellers",
    sort: 3,
    material: "textile/metal",
    category: "bedroom",
    color: "ivory",
  },
  {
    handle: "metal-beam",
    title: "Metal Beam",
    blurb: "sleek silhouette",
    price: 1100,
    catalogImage: "/catalog/metal.png",
    material: "steel",
    category: "living room",
    color: "silver",
  },
  {
    handle: "amethyst-vortex",
    title: "Amethyst Vortex",
    blurb: "shimmering violet hues",
    price: 1500,
    catalogImage: "/catalog/amethyst.png",
    band: "most-popular",
    sort: 1,
    material: "glass/metal",
    category: "living room",
    color: "violet",
  },
  {
    handle: "steel-petal",
    title: "Steel Petal",
    blurb: "delicate curved elements",
    price: 900,
    catalogImage: "/catalog/steel.png",
    band: "best-sellers",
    sort: 2,
    hideOnMobile: true,
    material: "steel",
    category: "bedroom",
    color: "steel",
  },
  {
    handle: "glowform",
    title: "Glowform",
    blurb: "sleek soft illumination",
    price: 700,
    catalogImage: "/catalog/glowform.png",
    band: "most-popular",
    sort: 3,
    material: "glass",
    category: "bedroom",
    color: "opal",
  },
  {
    handle: "echo-glow",
    title: "Echo Glow",
    blurb: "subtle reflective warmth",
    price: 1200,
    catalogImage: "/catalog/echo.png",
    band: "best-sellers",
    sort: 4,
    material: "metal",
    category: "living room",
    color: "amber",
  },
  {
    handle: "horizon-glow",
    title: "Horizon Glow",
    blurb: "calm even horizon light",
    price: 950,
    catalogImage: "/catalog/horizon.png",
    material: "glass/metal",
    category: "living room",
    color: "warm white",
  },
  {
    handle: "crystal-veil",
    title: "Crystal Veil",
    blurb: "elegant faceted softness",
    price: 800,
    catalogImage: "/catalog/crystal.png",
    band: "most-popular",
    sort: 4,
    material: "crystal",
    category: "living room",
    color: "clear",
  },
  {
    handle: "lunar-dome",
    title: "Lunar Dome",
    blurb: "soft diffused light",
    price: 750,
    catalogImage: "/catalog/lunar.png",
    material: "ceramic",
    category: "bedroom",
    color: "moon",
  },
  {
    handle: "striking-red-shade",
    title: "Striking red shade",
    blurb: "Crimson Accent",
    price: 1300,
    catalogImage: "/catalog/red.png",
    material: "textile/metal",
    category: "living room",
    color: "crimson",
  },
]

export const DEFAULT_CARE =
  "With its terrazzo base, gold-toned rods, and sleek matte shade, this stylish table lamp makes a striking statement in any interior. Its thoughtful design and high-quality materials ensure durability, allowing it to retain its aesthetic appeal for years to come. Maintenance is effortless, requiring only regular, gentle cleaning and adherence to simple care guidelines."

export const CARE_BULLETS = [
  "Do not place the lamp in humid areas or in direct sunlight",
  "The optimal indoor humidity level is 40–60%",
  "Do not exceed the recommended bulb wattage and use only LED bulbs",
  "When transporting or moving the lamp, hold it by its substantial base",
]

export function slugifyLamp(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function findAdminLamp(handleOrTitle: string) {
  const key = slugifyLamp(handleOrTitle)
  return (
    ADMIN_LAMPS.find((lamp) => lamp.handle === key) ||
    ADMIN_LAMPS.find((lamp) => slugifyLamp(lamp.title) === key) ||
    null
  )
}

export function lampHref(handleOrTitle: string) {
  return `/product/${findAdminLamp(handleOrTitle)?.handle || slugifyLamp(handleOrTitle)}`
}
