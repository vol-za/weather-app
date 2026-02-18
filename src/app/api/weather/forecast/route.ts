import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"
import { getForecast } from "@/lib/weather"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 })
  }

  try {
    const session = await getAuth()
    const days = session?.user?.subscriptionStatus === "PREMIUM" ? 7 : 5
    const forecast = await getForecast(city, days)

    if (!forecast) {
      return NextResponse.json({ error: "Forecast not found" }, { status: 404 })
    }

    return NextResponse.json(forecast)
  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    )
  }
}
