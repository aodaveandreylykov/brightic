import { Suspense } from "react"
import OrderConfirmation from "@/modules/order/order-confirmation"

export const metadata = {
  title: "Order — Brightic",
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  )
}
