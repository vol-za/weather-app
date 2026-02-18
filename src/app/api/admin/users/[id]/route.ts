import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { subscriptionStatus, isBlocked, role } = body

    const updateData: Record<string, unknown> = {}

    if (subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = subscriptionStatus
      if (subscriptionStatus === "PREMIUM") {
        updateData.subscriptionStart = new Date()
        updateData.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      } else {
        updateData.subscriptionStart = null
        updateData.subscriptionEnd = null
      }
    }

    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked
    }

    if (role !== undefined) {
      updateData.role = role
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
