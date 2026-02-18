import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 })
  }
  const { stripe } = await import("@/lib/stripe")
  const { prisma } = await import("@/lib/prisma")

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id
        if (!customerId) break

        let user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (!user && session.metadata?.userId) {
          user = await prisma.user.findUnique({
            where: { id: session.metadata.userId },
          })
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { stripeCustomerId: customerId },
            })
          }
        }

        if (!user) {
          console.error("[webhook] checkout.session.completed: no user for customerId", customerId, "metadata", session.metadata)
        }

        if (user) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription as Stripe.Subscription)?.id
          if (!subscriptionId) break
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const startDate = new Date(subscription.current_period_start * 1000)
          const endDate = new Date(subscription.current_period_end * 1000)

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "PREMIUM",
              subscriptionStart: startDate,
              subscriptionEnd: endDate,
              stripeSubscriptionId: subscriptionId,
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id
        if (!customerId) break

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const endDate = new Date(subscription.current_period_end * 1000)

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionEnd: endDate,
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id
        if (!customerId) break

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "FREE",
              subscriptionStart: null,
              subscriptionEnd: null,
              stripeSubscriptionId: null,
            },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        console.log(`Payment failed for customer: ${customerId}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
