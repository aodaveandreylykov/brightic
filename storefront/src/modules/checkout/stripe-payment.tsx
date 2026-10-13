"use client"

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useMemo, useState } from "react"
import { completeCart, completeCartError, forgetCart, rememberOrder, type StoreCart } from "@/lib/store-cart"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PK
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)
  : null

export function StripePayment({
  cart,
  onSuccess,
  onError,
}: {
  cart: StoreCart
  onSuccess: (orderId: string) => void | Promise<void>
  onError: (message: string) => void
}) {
  const clientSecret = cart.payment_collection?.payment_sessions?.[0]?.data?.client_secret
  const stripe = useMemo(() => stripePromise, [])

  if (!stripe || !clientSecret) {
    return (
      <p className="checkout-note">
        Stripe is selected, but NEXT_PUBLIC_STRIPE_PK or a payment session secret is missing.
      </p>
    )
  }

  return (
    <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <StripeForm cart={cart} clientSecret={clientSecret} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

function StripeForm({
  cart,
  clientSecret,
  onSuccess,
  onError,
}: {
  cart: StoreCart
  clientSecret: string
  onSuccess: (orderId: string) => void | Promise<void>
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [pending, setPending] = useState(false)

  return (
    <div className="checkout-stripe">
      <CardElement
        options={{
          hidePostalCode: true,
          style: {
            base: {
              color: "#37291f",
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: "16px",
            },
          },
        }}
      />
      <div className="checkout-actions">
        <button
          type="button"
          className="checkout-btn checkout-btn--dark"
          disabled={pending || !stripe}
          onClick={async () => {
            const card = elements?.getElement(CardElement)
            if (!stripe || !card) return
            setPending(true)
            const { error } = await stripe.confirmCardPayment(clientSecret, {
              payment_method: {
                card,
                billing_details: {
                  name: [cart.billing_address?.first_name, cart.billing_address?.last_name]
                    .filter(Boolean)
                    .join(" "),
                  email: cart.email || undefined,
                  phone: cart.billing_address?.phone || undefined,
                  address: {
                    city: cart.billing_address?.city || undefined,
                    country: cart.billing_address?.country_code || undefined,
                    line1: cart.billing_address?.address_1 || undefined,
                    postal_code: cart.billing_address?.postal_code || undefined,
                  },
                },
              },
            })
            if (error) {
              onError(error.message || "Card payment failed")
              setPending(false)
              return
            }
            const result = await completeCart()
            if (result.type === "order" && result.order) {
              rememberOrder(result.order)
              forgetCart()
              onSuccess(result.order.id)
            } else {
              onError(completeCartError(result))
            }
            setPending(false)
          }}
        >
          {pending ? "Paying…" : "Pay and place order"}
        </button>
      </div>
    </div>
  )
}
