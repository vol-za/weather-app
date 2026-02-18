"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"

export function SyncSubscription({ sessionId }: { sessionId: string | undefined }) {
  const { refreshProfile } = useAuth()
  const synced = useRef(false)

  useEffect(() => {
    if (!sessionId || synced.current) return
    synced.current = true

    fetch("/api/stripe/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (data?.ok) {
          refreshProfile()
        }
      })
      .catch(() => {})
  }, [sessionId, refreshProfile])

  return null
}
