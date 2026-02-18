"use client"

import { useState, useEffect, useCallback } from "react"
import { WeatherCard } from "@/components/weather/weather-card"
import { WeatherCompareCard } from "@/components/weather/weather-compare-card"
import { CurrencyCard } from "@/components/currency/currency-card"
import { useToast } from "@/components/ui/use-toast"
import type { WeatherData, ForecastData } from "@/lib/weather"
import type { CurrencyInfo } from "@/lib/currency"

interface DashboardClientProps {
  isPremium: boolean
}

export function DashboardClient({ isPremium }: DashboardClientProps) {
  const { toast } = useToast()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [currencyRates, setCurrencyRates] = useState<CurrencyInfo[]>([])
  const [allCurrencyRates, setAllCurrencyRates] = useState<CurrencyInfo[]>([])
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [currentCity, setCurrentCity] = useState("Minsk")
  const [savedCities, setSavedCities] = useState<{ id: string; cityName: string; country: string | null }[]>([])
  const [savedCitiesLimit, setSavedCitiesLimit] = useState<number | null>(3)

  const fetchWeather = useCallback(async (city: string) => {
    setWeatherLoading(true)
    setWeatherError(null)

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?city=${encodeURIComponent(city)}`),
        fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`),
      ])

      if (!weatherRes.ok) {
        throw new Error("City not found")
      }

      const weatherData = await weatherRes.json()
      const forecastData = forecastRes.ok ? await forecastRes.json() : null

      setWeather(weatherData)
      setForecast(forecastData)
      setCurrentCity(city)
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : "Failed to fetch weather")
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive",
      })
    } finally {
      setWeatherLoading(false)
    }
  }, [toast])

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true)
    setWeatherError(null)

    try {
      const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      
      if (!weatherRes.ok) {
        throw new Error("Failed to get weather for your location")
      }

      const weatherData = await weatherRes.json()
      setWeather(weatherData)
      setCurrentCity(weatherData.location?.name || "Unknown")

      const forecastRes = await fetch(`/api/weather/forecast?city=${encodeURIComponent(weatherData.location?.name ?? "Unknown")}`)
      if (forecastRes.ok) {
        setForecast(await forecastRes.json())
      }
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : "Failed to fetch weather")
      toast({
        title: "Error",
        description: "Failed to fetch weather for your location",
        variant: "destructive",
      })
    } finally {
      setWeatherLoading(false)
    }
  }, [toast])

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        toast({
          title: "Error",
          description: "Unable to get your location. Please search for a city.",
          variant: "destructive",
        })
      }
    )
  }, [fetchWeatherByCoords, toast])

  const fetchCurrency = useCallback(async () => {
    setCurrencyLoading(true)
    try {
      const res = await fetch("/api/currency")
      const data = await res.json()
      setCurrencyRates(data.rates || [])
      setAllCurrencyRates(data.allRates || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates",
        variant: "destructive",
      })
    } finally {
      setCurrencyLoading(false)
    }
  }, [toast])

  const fetchSavedCities = useCallback(async () => {
    try {
      const res = await fetch("/api/saved-cities")
      if (!res.ok) return
      const data = await res.json()
      setSavedCities(data.cities || [])
      setSavedCitiesLimit(data.limit ?? null)
    } catch {
      // not critical
    }
  }, [])

  const handleSaveCity = useCallback(
    async (cityName: string, country?: string) => {
      try {
        const res = await fetch("/api/saved-cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cityName, country }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (data.code === "LIMIT") {
            toast({
              title: "Limit reached",
              description: "Upgrade to Premium to save unlimited cities",
              variant: "destructive",
            })
          }
          return
        }
        setSavedCities((prev) => {
          const exists = prev.some((c) => c.cityName.toLowerCase() === cityName.toLowerCase())
          if (exists) return prev.map((c) => (c.cityName.toLowerCase() === cityName.toLowerCase() ? { ...c, ...data } : c))
          return [...prev, data]
        })
        toast({ title: "Saved", description: `${cityName} added to your cities` })
      } catch {
        toast({ title: "Error", description: "Failed to save city", variant: "destructive" })
      }
    },
    [toast]
  )

  const handleRemoveCity = useCallback(async (cityName: string) => {
    try {
      const res = await fetch(`/api/saved-cities?city=${encodeURIComponent(cityName)}`, { method: "DELETE" })
      if (!res.ok) return
      setSavedCities((prev) => prev.filter((c) => c.cityName.toLowerCase() !== cityName.toLowerCase()))
      toast({ title: "Removed", description: `${cityName} removed from saved` })
    } catch {
      toast({ title: "Error", description: "Failed to remove city", variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    fetchWeather(currentCity)
    fetchCurrency()
    fetchSavedCities()
  }, [])

  return (
    <div className="space-y-6">
      {isPremium && (
        <WeatherCompareCard />
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeatherCard
          weather={weather}
          forecast={forecast}
          loading={weatherLoading}
          error={weatherError}
          onSearch={fetchWeather}
          onGeolocate={handleGeolocate}
          onRefresh={() => fetchWeather(currentCity)}
          isPremium={isPremium}
          savedCities={savedCities}
          savedCitiesLimit={savedCitiesLimit}
          onSaveCity={handleSaveCity}
          onRemoveCity={handleRemoveCity}
        />
        <CurrencyCard
          rates={currencyRates}
          allRates={allCurrencyRates}
          loading={currencyLoading}
          onRefresh={fetchCurrency}
          isPremium={isPremium}
        />
      </div>
    </div>
  )
}
