"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { Cloud, DollarSign } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center gap-1">
            <Cloud className="h-6 w-6 text-primary" />
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <span className="font-bold text-xl">WeatherFX</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
