"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PricingCardsProps {
  isPremium: boolean
  isLoggedIn: boolean
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5-day weather forecast",
      "Major currency exchange rates",
      "Basic currency converter",
      "Search any city",
      "Dark/Light mode",
    ],
    notIncluded: [
      "7-day extended forecast",
      "All currency rates",
      "Unlimited saved cities",
      "Priority support",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    yearlyPrice: "$99.99",
    yearlyPeriod: "/year",
    description: "Best for power users",
    features: [
      "Everything in Free, plus:",
      "7-day extended forecast",
      "24-hour hourly forecast",
      "UV index, sunrise/sunset & moon phase",
      "Compare weather for 2–3 cities",
      "Save unlimited cities (Free: 3 max)",
      "Export currency rates to CSV",
      "All currency exchange rates",
      "Ad-free experience",
      "Priority customer support",
      "Early access to new features",
    ],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    popular: true,
  },
]

export function PricingCards({ isPremium, isLoggedIn }: PricingCardsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const handleSubscribe = async (interval: "monthly" | "yearly") => {
    if (!isLoggedIn) {
      router.push("/auth/signin")
      return
    }

    setLoading(interval)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interval,
          successUrl: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      })
      setLoading(null)
    }
  }

  const handleManageSubscription = () => {
    toast({
      title: "Coming Soon",
      description: "Subscription management will be available soon.",
    })
  }

  return (
    <div className="mt-12">
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === "yearly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingPeriod("yearly")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${
              plan.popular
                ? "border-primary shadow-lg"
                : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Zap className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.popular && <Crown className="h-5 w-5 text-amber-500" />}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {billingPeriod === "yearly" && plan.yearlyPrice
                    ? plan.yearlyPrice
                    : plan.price}
                </span>
                <span className="text-muted-foreground">
                  {billingPeriod === "yearly" && plan.yearlyPeriod
                    ? plan.yearlyPeriod
                    : plan.period}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded?.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.popular ? (
                isPremium ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    onClick={() => handleSubscribe(billingPeriod)}
                    disabled={loading !== null}
                  >
                    {loading === billingPeriod ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                )
              ) : isPremium ? (
                <Button className="w-full" variant="outline" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  {plan.buttonText}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
