import { getAuth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getAuth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  if (session.user.isBlocked) {
    redirect("/auth/blocked")
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  
  return session
}

export async function requirePremium() {
  const session = await requireAuth()
  
  if (session.user.subscriptionStatus !== "PREMIUM") {
    redirect("/pricing")
  }
  
  return session
}

export { getAuth }
