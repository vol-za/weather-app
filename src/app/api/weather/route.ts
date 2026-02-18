import { NextRequest, NextResponse } from "next/server"
import { getCurrentWeather, getCurrentWeatherByCoords } from "@/lib/weather"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    let weather
    if (lat && lon) {
      weather = await getCurrentWeatherByCoords(parseFloat(lat), parseFloat(lon))
    } else if (city) {
      weather = await getCurrentWeather(city)
    } else {
      return NextResponse.json({ error: "City or coordinates required" }, { status: 400 })
    }

    if (!weather) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    return NextResponse.json(weather)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}
