"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Crown, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { WeatherData, ForecastData } from "@/lib/weather"
import { getWeatherIconUrl, formatTemperature } from "@/lib/weather"

const MAX_CITIES = 3

interface CityWeather {
  city: string
  weather: WeatherData | null
  forecast: ForecastData | null
  error?: string
}

export function WeatherCompareCard() {
  const { toast } = useToast()
  const [cityInputs, setCityInputs] = useState(["", "", ""])
  const [cities, setCities] = useState<CityWeather[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCityWeather = useCallback(
    async (city: string): Promise<CityWeather> => {
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`/api/weather?city=${encodeURIComponent(city)}`),
          fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`),
        ])
        if (!weatherRes.ok) {
          return { city, weather: null, forecast: null, error: "Not found" }
        }
        const weather = await weatherRes.json()
        const forecast = forecastRes.ok ? await forecastRes.json() : null
        return { city: weather.location?.name ?? city, weather, forecast }
      } catch {
        return { city, weather: null, forecast: null, error: "Error" }
      }
    },
    []
  )

  const handleCompare = useCallback(async () => {
    const toFetch = cityInputs
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_CITIES)
    if (toFetch.length < 2) {
      toast({
        title: "Add at least 2 cities",
        description: "Enter 2 or 3 city names to compare weather.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setCities([])
    try {
      const results = await Promise.all(toFetch.map((c) => fetchCityWeather(c)))
      const hasError = results.some((r) => r.error || !r.weather)
      if (hasError) {
        toast({
          title: "Some cities could not be loaded",
          description: "Check city names and try again.",
          variant: "destructive",
        })
      }
      setCities(results)
    } finally {
      setLoading(false)
    }
  }, [cityInputs, fetchCityWeather, toast])

  const tomorrowFor = (f: ForecastData | null) => {
    if (!f?.forecast?.forecastday?.[1]) return null
    return f.forecast.forecastday[1]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Compare weather
          <Badge variant="premium" className="gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        </CardTitle>
        <CardDescription>
          Compare current weather and tomorrow&apos;s forecast for 2–3 cities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 min-w-[120px] flex-col gap-1">
              <label className="text-xs text-muted-foreground">City {i + 1}</label>
              <Input
                placeholder={i === 0 ? "e.g. Minsk" : i === 1 ? "e.g. London" : "e.g. Tokyo"}
                value={cityInputs[i]}
                onChange={(e) => {
                  const next = [...cityInputs]
                  next[i] = e.target.value
                  setCityInputs(next)
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                className="max-w-[180px]"
              />
            </div>
          ))}
          <Button onClick={handleCompare} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Compare
              </>
            )}
          </Button>
        </div>

        {loading && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead>City 1</TableHead>
                  <TableHead>City 2</TableHead>
                  <TableHead>City 3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Now</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-12 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tomorrow</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-12 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && cities.length >= 2 && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  {cities.map((c) => (
                    <TableHead key={c.city}>
                      {c.weather ? c.city : `${c.city} (error)`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Now</TableCell>
                  {cities.map((c) => (
                    <TableCell key={c.city}>
                      {c.weather ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getWeatherIconUrl(c.weather.current.condition.icon)}
                            alt=""
                            className="h-8 w-8"
                          />
                          <div>
                            <div className="font-medium">
                              {formatTemperature(c.weather.current.temp_c)}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {c.weather.current.condition.text}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Tomorrow</TableCell>
                  {cities.map((c) => {
                    const day = tomorrowFor(c.forecast)
                    return (
                      <TableCell key={c.city}>
                        {day ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={getWeatherIconUrl(day.day.condition.icon)}
                              alt=""
                              className="h-8 w-8"
                            />
                            <div>
                              <div className="font-medium">
                                {formatTemperature(day.day.mintemp_c)} –{" "}
                                {formatTemperature(day.day.maxtemp_c)}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {day.day.condition.text}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
