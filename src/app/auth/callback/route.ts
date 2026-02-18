import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorUrl = `${origin}/auth/error`

  try {
    if (!code) {
      return NextResponse.redirect(errorUrl)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(errorUrl)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              image: user.user_metadata?.avatar_url,
              role: user.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
            },
          })
        }
      } catch (dbError) {
        console.error('[auth/callback] DB create user error:', dbError)
        // Session is set; redirect to dashboard, profile may sync later
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err)
    return NextResponse.redirect(errorUrl)
  }
}
