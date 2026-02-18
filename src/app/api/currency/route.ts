import { NextResponse } from "next/server"
import { getExchangeRates, getAllExchangeRates } from "@/lib/currency"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getAuth()
    const isPremium = session?.user?.subscriptionStatus === "PREMIUM"
    
    const rates = await getExchangeRates()
    const allRates = isPremium ? await getAllExchangeRates() : rates

    return NextResponse.json({
      rates,
      allRates,
      isPremium,
    })
  } catch (error) {
    console.error("Currency API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    )
  }
}
