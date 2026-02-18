import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  subscriptionStatus: 'FREE' | 'PREMIUM'
  role: 'USER' | 'ADMIN'
  isBlocked: boolean
}

export interface AuthSession {
  user: AuthUser
}

export async function getAuth(): Promise<AuthSession | null> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser()
  
  if (error || !authUser) {
    return null
  }
  
  // Get user from our database
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
  })
  
  if (!dbUser) {
    // Create user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        image: authUser.user_metadata?.avatar_url,
        role: authUser.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
      },
    })
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        subscriptionStatus: newUser.subscriptionStatus as 'FREE' | 'PREMIUM',
        role: newUser.role as 'USER' | 'ADMIN',
        isBlocked: newUser.isBlocked,
      },
    }
  }
  
  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      subscriptionStatus: dbUser.subscriptionStatus as 'FREE' | 'PREMIUM',
      role: dbUser.role as 'USER' | 'ADMIN',
      isBlocked: dbUser.isBlocked,
    },
  }
}
