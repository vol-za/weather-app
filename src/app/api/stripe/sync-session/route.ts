import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"
import { syncSubscriptionFromCheckoutSession } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

/**
 * Syncs subscription status from Stripe checkout session to our DB.
 * Called from client when user lands on /pricing/success (backup to server-side sync).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const sessionId = (body.session_id ?? body.sessionId) as string | undefined
    if (!sessionId) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 })
    }

    const result = await syncSubscriptionFromCheckoutSession(
      sessionId,
      session.user.id,
      prisma
    )

    if (!result.ok) {
      console.error("[sync-session] sync failed:", result.reason)
      return NextResponse.json(
        { error: "Sync failed", reason: result.reason },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Sync session error:", error)
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    )
  }
}
