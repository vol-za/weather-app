import { getAuth } from "@/lib/auth-guards"
import { Header } from "@/components/header"
import { PricingCards } from "./pricing-cards"

export default async function PricingPage() {
  const session = await getAuth()
  const isPremium = session?.user?.subscriptionStatus === "PREMIUM"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>
        <PricingCards isPremium={isPremium} isLoggedIn={!!session} />
      </main>
    </div>
  )
}
