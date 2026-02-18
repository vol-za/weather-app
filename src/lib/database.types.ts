export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string | null
          email: string | null
          emailVerified: Date | null
          image: string | null
          password: string | null
          subscriptionStatus: 'FREE' | 'PREMIUM'
          subscriptionStart: Date | null
          subscriptionEnd: Date | null
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          role: 'USER' | 'ADMIN'
          isBlocked: boolean
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: Date | null
          image?: string | null
          password?: string | null
          subscriptionStatus?: 'FREE' | 'PREMIUM'
          subscriptionStart?: Date | null
          subscriptionEnd?: Date | null
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          role?: 'USER' | 'ADMIN'
          isBlocked?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: Date | null
          image?: string | null
          password?: string | null
          subscriptionStatus?: 'FREE' | 'PREMIUM'
          subscriptionStart?: Date | null
          subscriptionEnd?: Date | null
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          role?: 'USER' | 'ADMIN'
          isBlocked?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
      }
      SavedCity: {
        Row: {
          id: string
          userId: string
          cityName: string
          country: string | null
          createdAt: Date
        }
        Insert: {
          id?: string
          userId: string
          cityName: string
          country?: string | null
          createdAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          cityName?: string
          country?: string | null
          createdAt?: Date
        }
      }
    }
  }
}
