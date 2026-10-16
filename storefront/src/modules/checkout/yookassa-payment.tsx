"use client"

import { useState } from "react"
import { isYookassaProvider } from "@/lib/ru"
import { type StoreCart } from "@/lib/store-cart"

export function YookassaPayment({
  cart,
}: {
  cart: StoreCart
  onSuccess: (orderId: string) => void | Promise<void>
  onError: (message: string) => void
}) {
  const session = cart.payment_collection?.payment_sessions?.find((item) =>
    isYookassaProvider(item.provider_id)
  )
  const confirmationUrl =
    session?.data?.confirmation?.confirmation_url ?? session?.data?.confirmation_url
  const [pending, setPending] = useState(false)

  if (!confirmationUrl) {
    return (
      <p className="checkout-note">
        ЮKassa выбрана, но ссылка на оплату ещё не пришла. Проверьте модуль оплаты на бэкенде:
        сессия должна вернуть <code>confirmation_url</code>.
      </p>
    )
  }

  return (
    <div className="checkout-yookassa">
      <p className="checkout-note">
        Оплата картой МИР, Visa, Mastercard или через СБП. После оплаты ЮKassa вернёт на страницу
        заказа.
      </p>
      <div className="checkout-actions">
        <button
          type="button"
          className="checkout-btn checkout-btn--dark"
          disabled={pending}
          onClick={() => {
            setPending(true)
            window.location.assign(confirmationUrl)
          }}
        >
          {pending ? "Переход к оплате…" : "Оплатить картой / СБП"}
        </button>
      </div>
    </div>
  )
}
