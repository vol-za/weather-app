"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin")
      return
    }
    if (profile && !loading) {
      router.replace("/dashboard")
    }
  }, [user, profile, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Registration failed")
        return
      }
      await refreshProfile()
      router.replace("/dashboard")
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user || profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex items-center justify-center py-20">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete registration</CardTitle>
            <CardDescription>
              Enter your name to finish setting up your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Please wait..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
