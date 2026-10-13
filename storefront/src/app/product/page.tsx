import { redirect } from "next/navigation"
import { getDefaultProductHandle } from "@/lib/products"

export const dynamic = "force-dynamic"

export default async function Page() {
  const handle = await getDefaultProductHandle()
  redirect(`/product/${handle}`)
}
