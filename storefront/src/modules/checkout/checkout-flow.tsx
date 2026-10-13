"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/lib/money"
import {
  addShippingMethod,
  completeCart,
  completeCartError,
  forgetCart,
  initiatePaymentSession,
  listPaymentProviders,
  listShippingOptions,
  rememberOrder,
  updateCart,
  type PaymentProvider,
  type ShippingOption,
} from "@/lib/store-cart"
import { useCart } from "@/modules/cart/cart-provider"
import { StripePayment } from "@/modules/checkout/stripe-payment"
import "@/modules/checkout/checkout.css"

type Step = "contact" | "address" | "shipping" | "payment"

function providerLabel(id: string) {
  if (id.startsWith("pp_system_default")) return "Pay later (manual)"
  if (id.startsWith("pp_stripe_")) return "Card (Stripe)"
  return id
}

export default function CheckoutFlow() {
  const router = useRouter()
  const { cart, items, total, applyCart, refreshCart, closeCart, ready } = useCart()
  const [step, setStep] = useState<Step>("contact")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [phone, setPhone] = useState("")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingId, setShippingId] = useState("")
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [providerId, setProviderId] = useState("")

  useEffect(() => {
    closeCart()
  }, [closeCart])

  useEffect(() => {
    if (cart?.email && !email) setEmail(cart.email)
    const address = cart?.shipping_address
    if (address?.first_name && !firstName) setFirstName(address.first_name)
    if (address?.last_name && !lastName) setLastName(address.last_name)
    if (address?.address_1 && !address1) setAddress1(address.address_1)
    if (address?.city && !city) setCity(address.city)
    if (address?.postal_code && !postalCode) setPostalCode(address.postal_code)
    if (address?.phone && !phone) setPhone(address.phone)
    const nextCountry =
      address?.country_code || cart?.region?.countries?.[0]?.iso_2 || "us"
    if (nextCountry && !countryCode) setCountryCode(nextCountry)
  }, [cart, email, firstName, lastName, address1, city, postalCode, phone, countryCode])

  const countries = cart?.region?.countries?.filter((item) => item.iso_2) ?? []
  const activeSession = cart?.payment_collection?.payment_sessions?.[0]
  const shippingTotal = Number(cart?.shipping_total) || 0
  const grandTotal = Number(cart?.total) || total + shippingTotal

  const canPay = useMemo(() => {
    return Boolean(cart?.email && cart?.shipping_address?.address_1 && (cart?.shipping_methods?.length || !shippingOptions.length))
  }, [cart, shippingOptions.length])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError("")
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout failed")
    } finally {
      setBusy(false)
    }
  }

  if (!ready) {
    return (
      <div className="checkout-empty">
        <p className="checkout-lead">Loading your basket…</p>
      </div>
    )
  }

  if (!cart || items.length === 0) {
    return (
      <div className="checkout-empty">
        <p className="checkout-lead">Your basket is empty.</p>
        <a className="checkout-btn checkout-btn--dark" href="/catalog">
          View catalogue
        </a>
      </div>
    )
  }

  return (
    <div className="checkout-grid">
      <div>
        <section className="checkout-step" aria-labelledby="checkout-contact">
          <h2 id="checkout-contact">1. Contact</h2>
          <div className="checkout-fields">
            <label className="field-wide">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          </div>
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn checkout-btn--dark"
              disabled={busy || !email}
              onClick={() =>
                void run(async () => {
                  applyCart(await updateCart({ email }))
                  setStep("address")
                })
              }
            >
              Continue
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-address">
          <h2 id="checkout-address">2. Shipping address</h2>
          <div className="checkout-fields">
            <label>
              First name
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" />
            </label>
            <label>
              Last name
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" />
            </label>
            <label className="field-wide">
              Address
              <input value={address1} onChange={(event) => setAddress1(event.target.value)} autoComplete="address-line1" />
            </label>
            <label>
              City
              <input value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" />
            </label>
            <label>
              Postal code
              <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} autoComplete="postal-code" />
            </label>
            <label>
              Country
              <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                {(countries.length ? countries : [{ iso_2: "us", display_name: "United States" }]).map((country) => (
                  <option key={country.iso_2 || "us"} value={country.iso_2 || "us"}>
                    {country.display_name || country.iso_2}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Phone
              <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
            </label>
          </div>
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn checkout-btn--dark"
              disabled={busy || step === "contact" || !address1 || !city || !postalCode}
              onClick={() =>
                void run(async () => {
                  const address = {
                    first_name: firstName,
                    last_name: lastName,
                    address_1: address1,
                    city,
                    postal_code: postalCode,
                    country_code: countryCode || "us",
                    phone,
                  }
                  applyCart(await updateCart({ shipping_address: address, billing_address: address }))
                  const options = await listShippingOptions()
                  setShippingOptions(options)
                  setShippingId(options[0]?.id || "")
                  setStep("shipping")
                })
              }
            >
              Save address
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-shipping">
          <h2 id="checkout-shipping">3. Delivery</h2>
          {shippingOptions.length === 0 ? (
            <p className="checkout-note">
              No shipping options yet. In Admin, add a location, fulfillment set, service zone, and
              shipping option for this region.
            </p>
          ) : (
            <div className="checkout-options">
              {shippingOptions.map((option) => (
                <label key={option.id} className="checkout-option">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === option.id}
                    onChange={() => setShippingId(option.id)}
                  />
                  <span>{option.name || "Shipping"}</span>
                  <strong>{formatMoney(option.amount)}</strong>
                </label>
              ))}
            </div>
          )}
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn checkout-btn--dark"
              disabled={busy || step === "contact" || step === "address" || !shippingId}
              onClick={() =>
                void run(async () => {
                  applyCart(await addShippingMethod(shippingId))
                  const regionId = cart.region_id || cart.region?.id || ""
                  const nextProviders = regionId ? await listPaymentProviders(regionId) : []
                  setProviders(nextProviders)
                  const preferred =
                    nextProviders.find((item) => item.id.startsWith("pp_system_default"))?.id ||
                    nextProviders[0]?.id ||
                    ""
                  setProviderId(preferred)
                  setStep("payment")
                })
              }
            >
              Use this delivery
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-payment">
          <h2 id="checkout-payment">4. Payment</h2>
          {providers.length === 0 ? (
            <p className="checkout-note">
              No payment providers on this region. Enable Manual in Admin, then Stripe.
            </p>
          ) : (
            <div className="checkout-options">
              {providers.map((provider) => (
                <label key={provider.id} className="checkout-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={providerId === provider.id}
                    onChange={() => setProviderId(provider.id)}
                  />
                  <span>{providerLabel(provider.id)}</span>
                </label>
              ))}
            </div>
          )}
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn"
              disabled={busy || !providerId || !canPay}
              onClick={() =>
                void run(async () => {
                  applyCart(await initiatePaymentSession(providerId))
                })
              }
            >
              Select payment
            </button>
            {activeSession?.provider_id?.startsWith("pp_system_default") ? (
              <button
                type="button"
                className="checkout-btn checkout-btn--dark"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const result = await completeCart()
                    if (result.type === "order" && result.order) {
                      rememberOrder(result.order)
                      forgetCart()
                      await refreshCart()
                      router.push(`/order/${result.order.id}`)
                      return
                    }
                    throw new Error(completeCartError(result))
                  })
                }
              >
                Place order
              </button>
            ) : null}
          </div>
          {activeSession?.provider_id?.startsWith("pp_stripe_") ? (
            <StripePayment
              cart={cart}
              onSuccess={async (orderId) => {
                await refreshCart()
                router.push(`/order/${orderId}`)
              }}
              onError={setError}
            />
          ) : null}
          {error ? <p className="checkout-error">{error}</p> : null}
        </section>
      </div>

      <aside className="checkout-summary">
        <h2>Order</h2>
        {items.map((item) => (
          <p key={item.id} className="checkout-line">
            <span>
              {item.title} × {item.qty}
            </span>
            <span>{formatMoney(item.price * item.qty)}</span>
          </p>
        ))}
        <p className="checkout-line">
          <span>Shipping</span>
          <span>{shippingTotal ? formatMoney(shippingTotal) : "—"}</span>
        </p>
        <p className="checkout-line checkout-line--total">
          <span>Total</span>
          <span>{formatMoney(grandTotal)}</span>
        </p>
      </aside>
    </div>
  )
}
