import OrderConfirmation from "@/modules/order/order-confirmation"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return { title: `Order ${id} — Brightic` }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderConfirmation id={id} />
}
