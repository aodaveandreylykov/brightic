import { getHomepageLamps } from "@/lib/catalog"
import { HomeBehavior } from "@/modules/home/home-behavior"
import { HomePage } from "@/modules/home/home-page"

export const dynamic = "force-dynamic"

export default async function Page() {
  const { bestSellers, popular } = await getHomepageLamps()

  return (
    <>
      <HomePage bestSellers={bestSellers} popular={popular} />
      <HomeBehavior />
    </>
  )
}
