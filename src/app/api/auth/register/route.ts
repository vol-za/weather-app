import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    let body: { name?: string } = {}
    try {
      body = await request.json()
    } catch {
      // optional body
    }

    const name = body.name?.trim() || user.user_metadata?.name || user.email.split('@')[0]

    const dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name: name || user.email.split('@')[0],
        image: user.user_metadata?.avatar_url ?? null,
        role: user.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
      },
    })

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      subscriptionStatus: dbUser.subscriptionStatus,
      role: dbUser.role,
      isBlocked: dbUser.isBlocked,
    })
  } catch (err) {
    console.error('Error in register:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
