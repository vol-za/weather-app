import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const FREE_SAVED_CITIES_LIMIT = 3

export async function GET() {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const list = await prisma.savedCity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      cities: list.map((c) => ({ id: c.id, cityName: c.cityName, country: c.country })),
      limit: session.user.subscriptionStatus === "PREMIUM" ? null : FREE_SAVED_CITIES_LIMIT,
    })
  } catch (error) {
    console.error("Saved cities GET error:", error)
    return NextResponse.json({ error: "Failed to load saved cities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const cityName = (body.cityName ?? body.city ?? "").toString().trim()
    const country = body.country?.toString().trim() || null

    if (!cityName) {
      return NextResponse.json({ error: "cityName required" }, { status: 400 })
    }

    const isPremium = session.user.subscriptionStatus === "PREMIUM"
    if (!isPremium) {
      const count = await prisma.savedCity.count({
        where: { userId: session.user.id },
      })
      if (count >= FREE_SAVED_CITIES_LIMIT) {
        return NextResponse.json(
          { error: "Limit reached", code: "LIMIT", limit: FREE_SAVED_CITIES_LIMIT },
          { status: 403 }
        )
      }
    }

    const saved = await prisma.savedCity.upsert({
      where: {
        userId_cityName: { userId: session.user.id, cityName },
      },
      create: {
        userId: session.user.id,
        cityName,
        country,
      },
      update: { country },
    })

    return NextResponse.json({
      id: saved.id,
      cityName: saved.cityName,
      country: saved.country,
    })
  } catch (error) {
    console.error("Saved cities POST error:", error)
    return NextResponse.json({ error: "Failed to save city" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cityName = request.nextUrl.searchParams.get("city")?.trim()
    if (!cityName) {
      return NextResponse.json({ error: "city required" }, { status: 400 })
    }

    await prisma.savedCity.deleteMany({
      where: {
        userId: session.user.id,
        cityName,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Saved cities DELETE error:", error)
    return NextResponse.json({ error: "Failed to remove city" }, { status: 500 })
  }
}
