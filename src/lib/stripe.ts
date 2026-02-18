import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PRICING = {
  monthly: {
    price: 9.99,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    interval: 'month' as const,
  },
  yearly: {
    price: 99.99,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    interval: 'year' as const,
  },
}

export async function createStripeCustomer(email: string, name?: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
  })
  return customer.id
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  userId?: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customerId,
      ...(userId ? { userId } : {}),
    },
  })
  
  return session.url!
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  
  return session.url
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Syncs subscription from Stripe checkout session into our DB.
 * Call this when user lands on success page (and from webhook).
 * Returns true if updated, false if already synced or invalid.
 */
export async function syncSubscriptionFromCheckoutSession(
  sessionId: string,
  currentUserId: string,
  prisma: import('@prisma/client').PrismaClient
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  })

  if (checkoutSession.payment_status !== 'paid' || !checkoutSession.subscription) {
    return { ok: false, reason: 'session_not_paid_or_no_subscription' }
  }

  const customerId =
    typeof checkoutSession.customer === 'string'
      ? checkoutSession.customer
      : checkoutSession.customer?.id
  if (!customerId) {
    return { ok: false, reason: 'no_customer_on_session' }
  }

  const sub =
    typeof checkoutSession.subscription === 'object'
      ? checkoutSession.subscription
      : await stripe.subscriptions.retrieve(checkoutSession.subscription as string)
  const startDate = new Date(sub.current_period_start * 1000)
  const endDate = new Date(sub.current_period_end * 1000)

  let user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  // Fallback: if no user by stripeCustomerId (e.g. not saved in time), update current user by id and set stripeCustomerId
  if (!user) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    })
    if (currentUser) {
      await prisma.user.update({
        where: { id: currentUserId },
        data: {
          stripeCustomerId: customerId,
          subscriptionStatus: 'PREMIUM',
          subscriptionStart: startDate,
          subscriptionEnd: endDate,
          stripeSubscriptionId: sub.id,
        },
      })
      return { ok: true }
    }
    return { ok: false, reason: 'user_not_found_or_mismatch' }
  }

  if (user.id !== currentUserId) {
    return { ok: false, reason: 'user_not_found_or_mismatch' }
  }

  await prisma.user.update({
    where: { id: currentUserId },
    data: {
      subscriptionStatus: 'PREMIUM',
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
      stripeSubscriptionId: sub.id,
    },
  })

  return { ok: true }
}
