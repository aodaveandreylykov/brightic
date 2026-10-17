"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { withBase } from "@/lib/base-path"
import { formatMoney } from "@/lib/money"
import {
  RU_PHONE_PLACEHOLDER,
  RU_PROVINCES,
  STORE_COUNTRY,
  formatRuPhone,
  isManualProvider,
  isRuPhone,
  isRuPostal,
  isStripeProvider,
  isYookassaProvider,
  paymentProviderLabel,
  shippingKind,
} from "@/lib/ru"
import {
  addShippingMethod,
  completeCart,
  completeCartError,
  forgetCart,
  initiatePaymentSession,
  isLocalCart,
  listCdekPoints,
  listPaymentProviders,
  listShippingOptions,
  rememberOrder,
  updateCart,
  type CdekPoint,
  type PaymentProvider,
  type ShippingOption,
} from "@/lib/store-cart"
import { useCart } from "@/modules/cart/cart-provider"
import "@/modules/checkout/checkout.css"

const FALLBACK_COUNTRIES = [{ iso_2: STORE_COUNTRY, display_name: "Россия" }]

function preferredProvider(providers: PaymentProvider[]) {
  const enabled = providers.filter((p) => p.is_enabled !== false && !isStripeProvider(p.id))
  return (
    enabled.find((p) => isYookassaProvider(p.id))?.id ||
    enabled.find((p) => isManualProvider(p.id))?.id ||
    enabled[0]?.id ||
    ""
  )
}

function shippingDesc(name?: string | null) {
  const kind = shippingKind(name)
  if (kind === "cdek") return "Доставка до пункта выдачи СДЭК"
  if (kind === "courier") return "Курьерская доставка до двери"
  if (kind === "post") return "Доставка Почтой России"
  return "Доставка"
}

export default function CheckoutFlow() {
  const router = useRouter()
  const search = useSearchParams()
  const { cart, items, total, applyCart, refreshCart, closeCart, ready } = useCart()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [agreed, setAgreed] = useState(false)

  // Contact
  const [email, setEmail] = useState("")

  // Personal
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  // Shipping address
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode, setCountryCode] = useState("")

  // CDEK
  const [pvz, setPvz] = useState("")
  const [cdekPoints, setCdekPoints] = useState<CdekPoint[]>([])

  // Shipping options
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingId, setShippingId] = useState("")

  // Payment
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [providerId, setProviderId] = useState("")

  const yookassaReturn = useRef(false)

  // Restore from cart
  useEffect(() => {
    closeCart()
  }, [closeCart])

  useEffect(() => {
    if (!cart) return
    if (cart.email && !email) setEmail(cart.email)
    const a = cart.shipping_address
    if (a?.first_name && !firstName) setFirstName(a.first_name)
    if (a?.last_name && !lastName) setLastName(a.last_name)
    if (a?.address_1 && !address1) setAddress1(a.address_1)
    if (a?.city && !city) setCity(a.city)
    if (a?.province && !province) setProvince(a.province)
    if (a?.postal_code && !postalCode) setPostalCode(a.postal_code)
    if (a?.phone && !phone) setPhone(formatRuPhone(a.phone))
    if (a?.address_2?.startsWith("ПВЗ:") && !pvz) {
      setPvz(a.address_2.replace(/^ПВЗ:\s*/, ""))
    }
    const country = a?.country_code || cart.region?.countries?.[0]?.iso_2 || STORE_COUNTRY
    if (country && !countryCode) setCountryCode(country)
  }, [cart, email, firstName, lastName, address1, city, province, postalCode, phone, pvz, countryCode])

  // Load shipping options once cart is ready
  useEffect(() => {
    if (!ready || !cart || isLocalCart(cart)) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const load = (attempt = 0) => {
      void listShippingOptions()
        .then((opts) => {
          if (cancelled) return
          setShippingOptions(opts)
          if (opts[0] && !shippingId) setShippingId(opts[0].id)
          if (opts.length === 0 && attempt < 2) {
            timer = setTimeout(() => load(attempt + 1), 3000)
          }
        })
        .catch(() => {
          if (!cancelled && attempt < 2) {
            timer = setTimeout(() => load(attempt + 1), 3000)
          }
        })
    }
    load()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cart?.id])

  // Load payment providers once cart is ready
  useEffect(() => {
    if (!ready || !cart || isLocalCart(cart)) return
    const regionId = cart.region_id || cart.region?.id || ""
    if (!regionId || providers.length) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const load = (attempt = 0) => {
      void listPaymentProviders(regionId)
        .then((list) => {
          if (cancelled) return
          setProviders(list)
          if (!providerId) setProviderId(preferredProvider(list))
          if (list.length === 0 && attempt < 2) {
            timer = setTimeout(() => load(attempt + 1), 3000)
          }
        })
        .catch(() => {
          if (!cancelled && attempt < 2) {
            timer = setTimeout(() => load(attempt + 1), 3000)
          }
        })
    }
    load()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, cart?.id, cart?.region_id, cart?.region?.id, providers.length])

  // CDEK points
  useEffect(() => {
    if (!needsPvz || !city.trim() || isLocalCart(cart)) {
      setCdekPoints([])
      return
    }
    let cancelled = false
    void listCdekPoints(city).then((pts) => { if (!cancelled) setCdekPoints(pts) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, cart?.id])

  // YooKassa return
  useEffect(() => {
    if (search.get("pay") !== "yookassa" || !ready || !cart || isLocalCart(cart)) return
    if (yookassaReturn.current) return
    yookassaReturn.current = true
    void run(async () => {
      const result = await completeCart()
      if (result.type === "order" && result.order) {
        rememberOrder(result.order)
        forgetCart()
        await refreshCart()
        router.replace(`/order?id=${result.order.id}`)
        return
      }
      throw new Error(completeCartError(result))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ready, cart?.id])

  const countries = cart?.region?.countries?.filter((c) => c.iso_2) ?? []
  const countryOptions = countries.length ? countries : FALLBACK_COUNTRIES
  const activeSession = cart?.payment_collection?.payment_sessions?.[0]
  const shippingTotal = Number(cart?.shipping_total) || 0
  const grandTotal = Number(cart?.total) || total + shippingTotal
  const selectedShipping = shippingOptions.find((o) => o.id === shippingId)
  const needsPvz = shippingKind(selectedShipping?.name) === "cdek"
  const visibleProviders = providers.filter((p) => !isStripeProvider(p.id))

  const formValid =
    Boolean(email.trim()) &&
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    Boolean(address1.trim()) &&
    Boolean(city.trim()) &&
    Boolean(province) &&
    isRuPostal(postalCode) &&
    isRuPhone(phone) &&
    agreed

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError("")
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось оформить заказ")
    } finally {
      setBusy(false)
    }
  }

  function requireLiveCart() {
    if (isLocalCart(cart)) {
      throw new Error(
        "Для оформления заказа нужен подключённый Medusa Backend с регионом RUB."
      )
    }
  }

  async function handlePay() {
    if (!formValid) {
      setError("Заполните все обязательные поля")
      return
    }
    void run(async () => {
      requireLiveCart()

      const address = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address_1: address1.trim(),
        address_2: needsPvz && pvz.trim() ? `ПВЗ: ${pvz.trim()}` : undefined,
        city: city.trim(),
        province,
        postal_code: postalCode,
        country_code: countryCode || STORE_COUNTRY,
        phone: formatRuPhone(phone),
      }

      applyCart(
        await updateCart({
          email,
          shipping_address: address,
          billing_address: address,
          metadata: needsPvz ? { cdek_pvz: pvz.trim() } : { cdek_pvz: null },
        })
      )

      // Reload shipping options after address is saved (for accurate CDEK prices)
      let opts = shippingOptions
      if (!opts.length) {
        opts = await listShippingOptions()
        setShippingOptions(opts)
        if (opts[0] && !shippingId) setShippingId(opts[0].id)
      }

      const sid = shippingId || opts[0]?.id || ""
      if (sid) applyCart(await addShippingMethod(sid))

      // Ensure payment providers
      let provList = providers
      if (!provList.length) {
        const regionId = cart?.region_id || cart?.region?.id || ""
        if (regionId) {
          provList = await listPaymentProviders(regionId)
          setProviders(provList)
        }
      }

      const pid = providerId || preferredProvider(provList)
      if (!pid) throw new Error("Нет доступных способов оплаты. Настройте провайдер в Medusa Admin.")

      const origin = window.location.origin
      const returnUrl = `${origin}${withBase("/checkout")}?pay=yookassa`
      const sessionData = isYookassaProvider(pid)
        ? { confirmation: { type: "redirect", return_url: returnUrl } }
        : { return_url: returnUrl }
      const updatedCart = await initiatePaymentSession(pid, sessionData)
      applyCart(updatedCart)

      if (isManualProvider(pid)) {
        const result = await completeCart()
        if (result.type === "order" && result.order) {
          rememberOrder(result.order)
          forgetCart()
          await refreshCart()
          router.push(`/order?id=${result.order.id}`)
          return
        }
        throw new Error(completeCartError(result))
      }

      if (isYookassaProvider(pid)) {
        const sess = updatedCart.payment_collection?.payment_sessions?.[0]
        const confirmUrl =
          sess?.data?.confirmation?.confirmation_url ?? sess?.data?.confirmation_url
        if (confirmUrl) {
          window.location.assign(confirmUrl)
          return
        }
        // confirmation_url not yet ready — user will see it rendered below
      }
    })
  }

  // ── States ───────────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="checkout-empty">
        <p>Загружаем корзину…</p>
      </div>
    )
  }

  if (!cart || items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Корзина пуста.</p>
        <a href="/catalog">В каталог</a>
      </div>
    )
  }

  // ── YooKassa session active — show redirect button
  const yookassaConfirmUrl = isYookassaProvider(activeSession?.provider_id)
    ? (activeSession?.data?.confirmation?.confirmation_url ?? activeSession?.data?.confirmation_url ?? null)
    : null

  return (
    <div className="checkout-wrap">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        {/* ── LEFT: form ────────────────────────────────────── */}
        <div className="co-form">

          {/* 1. Information */}
          <section className="co-section">
            <div className="co-section-head">
              <span>Information</span>
            </div>

            <p className="co-sub">Personal information</p>
            <div className="co-fields">
              <label className="co-field">
                <span>First name</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </label>
              <label className="co-field">
                <span>Last name</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </label>
              <label className="co-field">
                <span>Phone number</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatRuPhone(e.target.value))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={RU_PHONE_PLACEHOLDER}
                />
              </label>
              <label className="co-field">
                <span>E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
            </div>

            <p className="co-sub">Shipping information</p>
            <div className="co-fields">
              <label className="co-field">
                <span>Country / Region</span>
                <select value={province} onChange={(e) => setProvince(e.target.value)}>
                  <option value="">Select region</option>
                  {RU_PROVINCES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="co-field">
                <span>City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                />
              </label>
              <label className="co-field co-field--full">
                <span>Address</span>
                <input
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  autoComplete="address-line1"
                />
              </label>
              <label className="co-field">
                <span>Zip / Postal code</span>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="123456"
                />
              </label>
              {countryOptions.length > 1 ? (
                <label className="co-field">
                  <span>Country</span>
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                    {countryOptions.map((c) => (
                      <option key={c.iso_2 || STORE_COUNTRY} value={c.iso_2 || STORE_COUNTRY}>
                        {c.display_name || c.iso_2}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </section>

          {/* 2. Delivery */}
          <section className="co-section">
            <div className="co-section-head"><span>Delivery</span></div>

            {shippingOptions.length === 0 ? (
              <p className="co-note">
                Варианты доставки появятся после подключения Medusa Backend (регион RUB, fulfillment set, зона ru).
              </p>
            ) : (
              <div className="co-options">
                {shippingOptions.map((opt) => (
                  <label key={opt.id} className="co-option">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingId === opt.id}
                      onChange={() => setShippingId(opt.id)}
                    />
                    <span className="co-option__body">
                      <span className="co-option__name">{opt.name || "Доставка"}</span>
                      <span className="co-option__desc">{shippingDesc(opt.name)}</span>
                    </span>
                    <span className="co-option__price">
                      {opt.amount ? formatMoney(opt.amount) : "Free"}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {needsPvz ? (
              <div className="co-pvz">
                <p className="co-sub">Пункт выдачи СДЭК</p>
                {cdekPoints.length ? (
                  <select value={pvz} onChange={(e) => setPvz(e.target.value)}>
                    <option value="">Выберите ПВЗ</option>
                    {cdekPoints.map((pt) => (
                      <option
                        key={pt.code || pt.address}
                        value={`${pt.code} ${pt.address}`.trim()}
                      >
                        {pt.name}{pt.address ? ` — ${pt.address}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={pvz}
                    onChange={(e) => setPvz(e.target.value)}
                    placeholder="Код или адрес ПВЗ, например MOS76"
                  />
                )}
                <span className="co-hint">
                  {cdekPoints.length
                    ? "Список пунктов выдачи из СДЭК по городу доставки."
                    : "Живой список ПВЗ появится, когда на бэкенде включён модуль СДЭК."}
                </span>
              </div>
            ) : null}
          </section>

          {/* 3. Payment */}
          <section className="co-section">
            <div className="co-section-head"><span>Payment</span></div>

            {visibleProviders.length === 0 ? (
              <p className="co-note">
                Нет способов оплаты. В Medusa Admin на регионе RUB включите Manual, затем YooKassa.
              </p>
            ) : (
              <div className="co-options">
                {visibleProviders.map((prov) => (
                  <label key={prov.id} className="co-option">
                    <input
                      type="radio"
                      name="payment"
                      checked={providerId === prov.id}
                      onChange={() => setProviderId(prov.id)}
                    />
                    <span className="co-option__body">
                      <span className="co-option__name">{paymentProviderLabel(prov.id)}</span>
                    </span>
                    {isYookassaProvider(prov.id) ? (
                      <span className="co-option__icons">
                        <span style={{ fontSize: 12, opacity: 0.7 }}>МИР · СБП</span>
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            )}

            {/* YooKassa: confirmation_url ready — show redirect button */}
            {yookassaConfirmUrl ? (
              <div className="co-yookassa">
                <p className="co-yookassa-note">
                  Оплата картой МИР, Visa, Mastercard или через СБП. После оплаты вернёмся на страницу заказа.
                </p>
                <button
                  type="button"
                  className="co-pay-btn"
                  style={{ width: "auto", padding: "0 32px" }}
                  onClick={() => window.location.assign(yookassaConfirmUrl)}
                >
                  Оплатить картой / СБП
                </button>
              </div>
            ) : null}
          </section>
        </div>

        {/* ── RIGHT: shopping bag ───────────────────────────── */}
        <aside className="checkout-bag">
          <h2>Shopping Bag ({items.reduce((s, i) => s + i.qty, 0)})</h2>

          {items.map((item) => (
            <div key={item.id} className="co-item">
              <img className="co-item__img" src={item.image} alt="" />
              <div>
                <p className="co-item__name">{item.title}</p>
                <p className="co-item__blurb">{item.blurb}</p>
                <p className="co-item__qty">Quantity: {item.qty}</p>
              </div>
              <span className="co-item__price">{formatMoney(item.price)}</span>
            </div>
          ))}

          {/* Promo code — UI placeholder */}
          <div className="co-promo">
            <input className="co-promo__input" placeholder="Promocode" />
            <button type="button" className="co-promo__btn">Apply</button>
          </div>

          <div className="co-totals">
            <div className="co-total-row">
              <span>Shipping</span>
              <span>{shippingTotal ? formatMoney(shippingTotal) : "Free"}</span>
            </div>
            <div className="co-total-row">
              <span>Discount</span>
              <span>—</span>
            </div>
          </div>

          <div className="co-total-final">
            <strong>Total:</strong>
            <strong>{formatMoney(grandTotal)}</strong>
          </div>

          <label className="co-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I agree to{" "}
            <a href="/#contact">data processing</a>
          </label>

          {error ? <p className="co-error">{error}</p> : null}

          <button
            type="button"
            className="co-pay-btn"
            disabled={busy || !agreed}
            onClick={() => void handlePay()}
          >
            {busy ? "Processing…" : "Pay and place order"}
          </button>
        </aside>
      </div>
    </div>
  )
}
