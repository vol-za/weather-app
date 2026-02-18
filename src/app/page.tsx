import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Cloud,
  DollarSign,
  Crown,
  Check,
  Zap,
  Shield,
  Globe,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    icon: Cloud,
    title: "Real-time Weather",
    description: "Get accurate weather data for any city worldwide with 5-7 day forecasts",
  },
  {
    icon: DollarSign,
    title: "Currency Exchange",
    description: "Official daily exchange rates from the National Bank of Belarus",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description: "Lightning-fast dashboard optimized for all devices",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Safe and secure login with Google OAuth",
  },
]

const premiumFeatures = [
  "Extended 7-day weather forecast",
  "24-hour hourly forecast",
  "UV index, sunrise/sunset & moon phase",
  "Compare weather for 2–3 cities",
  "Save unlimited cities (Free: 3 max)",
  "Export currency rates to CSV",
  "All currency exchange rates",
  "Ad-free experience",
  "Priority customer support",
  "Early access to new features",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <section className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4">
            Premium Weather & Currency Dashboard
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your Complete{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Weather
            </span>{" "}
            &{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Currency
            </span>{" "}
            Hub
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Get real-time weather forecasts and official currency exchange rates in one
            beautiful, easy-to-use dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                View Pricing
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-20">
          <Card className="mx-auto max-w-3xl border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
              <CardDescription>
                Unlock all features and get the most out of WeatherFX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Link href="/pricing">
                    Starting at $9.99/month
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of users who trust WeatherFX for their weather and currency needs
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-semibold">WeatherFX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WeatherFX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
