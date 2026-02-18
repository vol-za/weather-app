"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Cloud,
  Droplets,
  Wind,
  Gauge,
  MapPin,
  Navigation,
  Search,
  RefreshCw,
  CloudRain,
  Sun,
  CloudSun,
  Snowflake,
  Zap,
  Crown,
  Sunrise,
  Sunset,
  Moon,
  Star,
} from "lucide-react"
import type { WeatherData, ForecastData } from "@/lib/weather"
import { getWeatherIconUrl, formatTemperature } from "@/lib/weather"

export interface SavedCityItem {
  id: string
  cityName: string
  country: string | null
}

interface WeatherCardProps {
  weather: WeatherData | null
  forecast: ForecastData | null
  loading: boolean
  error: string | null
  onSearch: (city: string) => void
  onGeolocate: () => void
  onRefresh: () => void
  isPremium: boolean
  savedCities?: SavedCityItem[]
  savedCitiesLimit?: number | null
  onSaveCity?: (cityName: string, country?: string) => Promise<void>
  onRemoveCity?: (cityName: string) => Promise<void>
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase()
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return <CloudRain className="h-5 w-5" />
  if (c.includes("clear") || c.includes("sunny")) return <Sun className="h-5 w-5" />
  if (c.includes("cloud") || c.includes("overcast")) return <CloudSun className="h-5 w-5" />
  if (c.includes("snow") || c.includes("sleet") || c.includes("ice")) return <Snowflake className="h-5 w-5" />
  if (c.includes("thunder") || c.includes("storm") || c.includes("lightning")) return <Zap className="h-5 w-5" />
  return <Cloud className="h-5 w-5" />
}

export function WeatherCard({
  weather,
  forecast,
  loading,
  error,
  onSearch,
  onGeolocate,
  onRefresh,
  isPremium,
  savedCities = [],
  savedCitiesLimit = 3,
  onSaveCity,
  onRemoveCity,
}: WeatherCardProps) {
  const [searchInput, setSearchInput] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [savingCity, setSavingCity] = useState(false)

  const currentCityName = weather?.location?.name?.toLowerCase()
  const isSaved = currentCityName && savedCities.some((c) => c.cityName.toLowerCase() === currentCityName)
  const canSaveMore = savedCitiesLimit === null || savedCities.length < savedCitiesLimit

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      onSearch(searchInput.trim())
    }
  }

  const handleGeolocate = () => {
    setIsLocating(true)
    onGeolocate()
    setTimeout(() => setIsLocating(false), 2000)
  }

  const getDailyForecast = () => {
    if (!forecast?.forecast?.forecastday) return []
    
    return forecast.forecast.forecastday
      .slice(0, isPremium ? 7 : 5)
      .map((day) => ({
        date: day.date,
        temp: day.day.avgtemp_c,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        icon: day.day.condition.icon,
        description: day.day.condition.text,
        chanceOfRain: day.day.daily_chance_of_rain,
      }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </span>
          {weather && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={handleGeolocate} disabled={isLocating}>
            <Navigation className={`h-4 w-4 ${isLocating ? "animate-pulse" : ""}`} />
          </Button>
          {weather && onSaveCity && onRemoveCity && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={savingCity || (!isSaved && !canSaveMore)}
              onClick={async () => {
                if (!weather?.location?.name) return
                setSavingCity(true)
                try {
                  if (isSaved) {
                    await onRemoveCity(weather.location.name)
                  } else {
                    await onSaveCity(weather.location.name, weather.location.country)
                  }
                } finally {
                  setSavingCity(false)
                }
              }}
              title={isSaved ? "Remove from saved" : !canSaveMore ? "Limit reached (Premium: unlimited)" : "Save city"}
            >
              <Star className={`h-4 w-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
            </Button>
          )}
        </form>

        {savedCities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Saved:</span>
            {savedCities.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant={currentCityName === c.cityName.toLowerCase() ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => onSearch(c.cityName)}
              >
                {c.cityName}
              </Button>
            ))}
            {savedCitiesLimit !== null && (
              <span className="text-xs text-muted-foreground">
                ({savedCities.length}/{savedCitiesLimit})
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {weather.location.name}, {weather.location.country}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">
                    {formatTemperature(weather.current.temp_c)}
                  </span>
                  <span className="text-muted-foreground">
                    Feels like {formatTemperature(weather.current.feelslike_c)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <img
                  src={getWeatherIconUrl(weather.current.condition.icon)}
                  alt={weather.current.condition.text}
                  className="h-20 w-20"
                />
                <p className="text-sm capitalize">{weather.current.condition.text}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-medium">{weather.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                <Wind className="h-4 w-4 text-cyan-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-medium">
                    {Math.round(weather.current.wind_kph)} km/h {weather.current.wind_dir}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                <Gauge className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="font-medium">{Math.round(weather.current.pressure_mb)} hPa</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                {getWeatherIcon(weather.current.condition.text)}
                <div>
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="font-medium text-xs">{weather.current.condition.text}</p>
                </div>
              </div>
            </div>

            {isPremium && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">UV Index</p>
                    <p className="font-medium">{weather.current.uv}</p>
                  </div>
                </div>
                {forecast?.forecast?.forecastday?.[0]?.astro && (
                  <>
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sunrise</p>
                        <p className="font-medium text-sm">{forecast.forecast.forecastday[0].astro.sunrise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-700" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sunset</p>
                        <p className="font-medium text-sm">{forecast.forecast.forecastday[0].astro.sunset}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Moon</p>
                        <p className="font-medium text-sm capitalize">{forecast.forecast.forecastday[0].astro.moon_phase}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {isPremium && forecast?.forecast?.forecastday?.[0]?.hour && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  Hourly forecast
                  <Badge variant="premium" className="text-xs gap-0.5">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {forecast.forecast.forecastday[0].hour.slice(0, 24).map((h, i) => (
                    <div
                      key={i}
                      className="flex min-w-[56px] flex-col items-center rounded-lg bg-muted/50 p-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.time_epoch * 1000).toLocaleTimeString("en-US", { hour: "numeric" })}
                      </span>
                      <img
                        src={getWeatherIconUrl(h.condition.icon)}
                        alt=""
                        className="h-6 w-6"
                      />
                      <span className="text-sm font-medium">{Math.round(h.temp_c)}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">7-Day Forecast</h4>
                  {!isPremium && (
                    <Badge variant="outline" className="text-xs">
                      5 days (Premium: 7)
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getDailyForecast().map((day, index) => (
                    <div
                      key={index}
                      className="flex min-w-[70px] flex-col items-center rounded-lg bg-muted/50 p-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <img
                        src={getWeatherIconUrl(day.icon)}
                        alt={day.description}
                        className="h-8 w-8"
                      />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                          {Math.round(day.maxTemp)}°
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(day.minTemp)}°
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <p>Search for a city to get weather data</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
