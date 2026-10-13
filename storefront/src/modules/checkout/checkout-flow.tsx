"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { YookassaPayment } from "@/modules/checkout/yookassa-payment"
import "@/modules/checkout/checkout.css"

type Step = "contact" | "address" | "shipping" | "payment"

const FALLBACK_COUNTRIES = [{ iso_2: STORE_COUNTRY, display_name: "Россия" }]

function preferredProvider(providers: PaymentProvider[]) {
  const enabled = providers.filter((item) => item.is_enabled !== false && !isStripeProvider(item.id))
  return (
    enabled.find((item) => isYookassaProvider(item.id))?.id ||
    enabled.find((item) => isManualProvider(item.id))?.id ||
    enabled[0]?.id ||
    ""
  )
}

export default function CheckoutFlow() {
  const router = useRouter()
  const search = useSearchParams()
  const { cart, items, total, applyCart, refreshCart, closeCart, ready } = useCart()
  const [step, setStep] = useState<Step>("contact")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [phone, setPhone] = useState("")
  const [pvz, setPvz] = useState("")
  const [cdekPoints, setCdekPoints] = useState<CdekPoint[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingId, setShippingId] = useState("")
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [providerId, setProviderId] = useState("")
  const yookassaReturn = useRef(false)

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
    if (address?.province && !province) setProvince(address.province)
    if (address?.postal_code && !postalCode) setPostalCode(address.postal_code)
    if (address?.phone && !phone) setPhone(formatRuPhone(address.phone))
    if (address?.address_2?.startsWith("ПВЗ:") && !pvz) {
      setPvz(address.address_2.replace(/^ПВЗ:\s*/, ""))
    }
    const nextCountry =
      address?.country_code || cart?.region?.countries?.[0]?.iso_2 || STORE_COUNTRY
    if (nextCountry && !countryCode) setCountryCode(nextCountry)
  }, [
    cart,
    email,
    firstName,
    lastName,
    address1,
    city,
    province,
    postalCode,
    phone,
    pvz,
    countryCode,
  ])

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
  }, [search, ready, cart, refreshCart, router])

  const countries = cart?.region?.countries?.filter((item) => item.iso_2) ?? []
  const countryOptions = countries.length ? countries : FALLBACK_COUNTRIES
  const activeSession = cart?.payment_collection?.payment_sessions?.[0]
  const shippingTotal = Number(cart?.shipping_total) || 0
  const grandTotal = Number(cart?.total) || total + shippingTotal
  const selectedShipping = shippingOptions.find((option) => option.id === shippingId)
  const selectedKind = shippingKind(selectedShipping?.name)
  const needsPvz = selectedKind === "cdek"

  const visibleProviders = providers.filter((item) => !isStripeProvider(item.id))

  const canPay = useMemo(() => {
    return Boolean(
      cart?.email &&
        cart?.shipping_address?.address_1 &&
        (cart?.shipping_methods?.length || !shippingOptions.length)
    )
  }, [cart, shippingOptions.length])

  const addressReady =
    Boolean(firstName.trim() && lastName.trim() && address1.trim() && city.trim() && province) &&
    isRuPostal(postalCode) &&
    isRuPhone(phone)

  useEffect(() => {
    if (!needsPvz || !city.trim() || isLocalCart(cart)) {
      setCdekPoints([])
      return
    }
    let cancelled = false
    void listCdekPoints(city).then((points) => {
      if (!cancelled) setCdekPoints(points)
    })
    return () => {
      cancelled = true
    }
  }, [needsPvz, city, cart])

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
        "Заказ с GitHub Pages недоступен: нужен опубликованный Medusa Backend с регионом RUB."
      )
    }
  }

  if (!ready) {
    return (
      <div className="checkout-empty">
        <p className="checkout-lead">Загружаем корзину…</p>
      </div>
    )
  }

  if (!cart || items.length === 0) {
    return (
      <div className="checkout-empty">
        <p className="checkout-lead">Корзина пуста.</p>
        <a className="checkout-btn checkout-btn--dark" href="/catalog">
          В каталог
        </a>
      </div>
    )
  }

  return (
    <div className="checkout-grid">
      <div>
        <section className="checkout-step" aria-labelledby="checkout-contact">
          <h2 id="checkout-contact">1. Контакты</h2>
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
                  requireLiveCart()
                  applyCart(await updateCart({ email }))
                  setStep("address")
                })
              }
            >
              Далее
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-address">
          <h2 id="checkout-address">2. Адрес доставки</h2>
          <div className="checkout-fields">
            <label>
              Имя
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label>
              Фамилия
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label>
              Регион / область
              <select value={province} onChange={(event) => setProvince(event.target.value)}>
                <option value="">Выберите регион</option>
                {RU_PROVINCES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Город
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
              />
            </label>
            <label className="field-wide">
              Улица, дом, квартира
              <input
                value={address1}
                onChange={(event) => setAddress1(event.target.value)}
                autoComplete="address-line1"
              />
            </label>
            <label>
              Индекс
              <input
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="123456"
              />
            </label>
            <label>
              Страна
              <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                {countryOptions.map((country) => (
                  <option key={country.iso_2 || STORE_COUNTRY} value={country.iso_2 || STORE_COUNTRY}>
                    {country.display_name || country.iso_2}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-wide">
              Телефон
              <input
                value={phone}
                onChange={(event) => setPhone(formatRuPhone(event.target.value))}
                autoComplete="tel"
                inputMode="tel"
                placeholder={RU_PHONE_PLACEHOLDER}
              />
            </label>
          </div>
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn checkout-btn--dark"
              disabled={busy || step === "contact" || !addressReady}
              onClick={() =>
                void run(async () => {
                  requireLiveCart()
                  const address = {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    address_1: address1.trim(),
                    city: city.trim(),
                    province,
                    postal_code: postalCode,
                    country_code: countryCode || STORE_COUNTRY,
                    phone: formatRuPhone(phone),
                  }
                  applyCart(await updateCart({ shipping_address: address, billing_address: address }))
                  const options = await listShippingOptions()
                  setShippingOptions(options)
                  setShippingId(options[0]?.id || "")
                  setStep("shipping")
                })
              }
            >
              Сохранить адрес
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-shipping">
          <h2 id="checkout-shipping">3. Доставка</h2>
          {shippingOptions.length === 0 ? (
            <p className="checkout-note">
              Нет способов доставки. В Admin добавьте склад в РФ, fulfillment set, зону `ru` и
              опции: курьер, СДЭК до ПВЗ, Почта России.
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
                  <span>{option.name || "Доставка"}</span>
                  <strong>{formatMoney(option.amount)}</strong>
                </label>
              ))}
            </div>
          )}
          {needsPvz ? (
            <label className="field-wide checkout-pvz">
              Пункт выдачи СДЭК
              {cdekPoints.length ? (
                <select value={pvz} onChange={(event) => setPvz(event.target.value)}>
                  <option value="">Выберите ПВЗ</option>
                  {cdekPoints.map((point) => (
                    <option key={point.code || point.address} value={`${point.code} ${point.address}`.trim()}>
                      {point.name}
                      {point.address ? ` — ${point.address}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={pvz}
                  onChange={(event) => setPvz(event.target.value)}
                  placeholder="Код или адрес ПВЗ, например MOS76"
                />
              )}
              <span className="checkout-hint">
                {cdekPoints.length
                  ? "Список пунктов выдачи из СДЭК по городу доставки."
                  : "Живой список ПВЗ появится, когда на бэкенде включён модуль СДЭК. Пока укажите код или адрес вручную."}
              </span>
            </label>
          ) : null}
          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-btn checkout-btn--dark"
              disabled={busy || step === "contact" || step === "address" || !shippingId || (needsPvz && !pvz.trim())}
              onClick={() =>
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
                      shipping_address: address,
                      billing_address: address,
                      metadata: needsPvz ? { cdek_pvz: pvz.trim() } : { cdek_pvz: null },
                    })
                  )
                  applyCart(await addShippingMethod(shippingId))
                  const regionId = cart.region_id || cart.region?.id || ""
                  const nextProviders = regionId ? await listPaymentProviders(regionId) : []
                  setProviders(nextProviders)
                  setProviderId(preferredProvider(nextProviders))
                  setStep("payment")
                })
              }
            >
              Выбрать доставку
            </button>
          </div>
        </section>

        <section className="checkout-step" aria-labelledby="checkout-payment">
          <h2 id="checkout-payment">4. Оплата</h2>
          {visibleProviders.length === 0 ? (
            <p className="checkout-note">
              Нет способов оплаты. В Admin на регионе RUB включите Manual, затем ЮKassa.
            </p>
          ) : (
            <div className="checkout-options">
              {visibleProviders.map((provider) => (
                <label key={provider.id} className="checkout-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={providerId === provider.id}
                    onChange={() => setProviderId(provider.id)}
                  />
                  <span>{paymentProviderLabel(provider.id)}</span>
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
                  requireLiveCart()
                  const origin = window.location.origin
                  const returnUrl = `${origin}${withBase("/checkout")}?pay=yookassa`
                  applyCart(
                    await initiatePaymentSession(providerId, {
                      return_url: returnUrl,
                    })
                  )
                })
              }
            >
              Выбрать оплату
            </button>
            {isManualProvider(activeSession?.provider_id) ? (
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
                      router.push(`/order?id=${result.order.id}`)
                      return
                    }
                    throw new Error(completeCartError(result))
                  })
                }
              >
                Оформить заказ
              </button>
            ) : null}
          </div>
          {isYookassaProvider(activeSession?.provider_id) ? (
            <YookassaPayment
              cart={cart}
              onSuccess={async (orderId) => {
                await refreshCart()
                router.push(`/order?id=${orderId}`)
              }}
              onError={setError}
            />
          ) : null}
          {error ? <p className="checkout-error">{error}</p> : null}
        </section>
      </div>

      <aside className="checkout-summary">
        <h2>Заказ</h2>
        {items.map((item) => (
          <p key={item.id} className="checkout-line">
            <span>
              {item.title} × {item.qty}
            </span>
            <span>{formatMoney(item.price * item.qty)}</span>
          </p>
        ))}
        <p className="checkout-line">
          <span>Доставка</span>
          <span>{shippingTotal ? formatMoney(shippingTotal) : "—"}</span>
        </p>
        <p className="checkout-line checkout-line--total">
          <span>Итого</span>
          <span>{formatMoney(grandTotal)}</span>
        </p>
      </aside>
    </div>
  )
}
