import { Suspense } from "react"
import OrderConfirmation from "@/modules/order/order-confirmation"

export const metadata = {
  title: "Заказ — Brightic",
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  )
}
