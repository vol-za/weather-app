import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { syncSubscriptionFromCheckoutSession } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"
import { SyncSubscription } from "./sync-subscription"

export default async function PricingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }> | { session_id?: string }
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const sessionId = params.session_id
  const session = await getAuth()

  if (sessionId && session?.user?.id) {
    const result = await syncSubscriptionFromCheckoutSession(
      sessionId,
      session.user.id,
      prisma
    )
    if (!result.ok) {
      console.error("[pricing/success] sync failed:", result.reason)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SyncSubscription sessionId={sessionId} />
      <Header />
      <main className="container flex items-center justify-center py-20">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for upgrading to Premium. Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You now have access to all premium features including extended forecasts,
              all currency rates, and more.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
