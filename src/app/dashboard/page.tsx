import { requireAuth } from "@/lib/auth-guards"
import { Header } from "@/components/header"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <DashboardClient isPremium={session.user.subscriptionStatus === "PREMIUM"} />
      </main>
    </div>
  )
}
