import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession, createStripeCustomer, PRICING } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { interval, successUrl: clientSuccessUrl, cancelUrl: clientCancelUrl } = body as {
      interval: "monthly" | "yearly"
      successUrl?: string
      cancelUrl?: string
    }

    if (!interval || !PRICING[interval]) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 })
    }

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || ""
    const allowOrigin = (url: string) => {
      try {
        const u = new URL(url)
        const app = new URL(appOrigin || "http://localhost:3000")
        return u.origin === app.origin || (u.hostname === "localhost" && app.hostname === "localhost")
      } catch {
        return false
      }
    }
    const successUrl =
      clientSuccessUrl && allowOrigin(clientSuccessUrl)
        ? clientSuccessUrl
        : `${appOrigin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl =
      clientCancelUrl && allowOrigin(clientCancelUrl) ? clientCancelUrl : `${appOrigin}/pricing`

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      customerId = await createStripeCustomer(user.email, user.name || undefined)
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
      if (!updated.stripeCustomerId) {
        console.error("[checkout] stripeCustomerId not persisted for user", user.id)
      }
    }

    const priceId = PRICING[interval].priceId

    const checkoutUrl = await createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      session.user.id
    )

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
