"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase/browser"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

interface UserProfile {
  id: string
  email: string | null
  name: string | null
  image: string | null
  subscriptionStatus: "FREE" | "PREMIUM"
  role: "USER" | "ADMIN"
  isBlocked: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  needsRegistration: boolean
  refreshProfile: () => Promise<void>
  signIn: () => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // getSession() reads from storage only — faster than getUser() (no server round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      if (u) {
        fetchProfile(u.id) // load profile in background, don't block
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setLoading(false) // allow redirect immediately, don't wait for profile
        if (u) {
          fetchProfile(u.id) // load profile in background
        } else {
          setProfile(null)
        }
        router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  async function fetchProfile(_userId?: string) {
    setNeedsRegistration(false)
    try {
      const response = await fetch("/api/auth/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 404) {
        setNeedsRegistration(true)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (user) {
      setLoading(true)
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    if (user && !loading && !profile && needsRegistration && pathname !== "/auth/register") {
      router.replace("/auth/register")
    }
  }, [user, loading, profile, needsRegistration, pathname, router])

  async function signIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  async function signUp(email: string, password: string, name?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
        },
      },
    })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setNeedsRegistration(false)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, needsRegistration, refreshProfile, signIn, signInWithEmail, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
