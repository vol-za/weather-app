import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAdmin()

    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({
        where: { subscriptionStatus: "PREMIUM" },
      }),
      prisma.user.count({
        where: { subscriptionStatus: "FREE" },
      }),
      prisma.user.count({
        where: { isBlocked: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return Response.json({
      total: stats[0],
      premium: stats[1],
      free: stats[2],
      blocked: stats[3],
      newThisMonth: stats[4],
    })
  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
