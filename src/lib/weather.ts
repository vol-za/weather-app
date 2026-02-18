export interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime_epoch: number
    localtime: string
  }
  current: {
    last_updated_epoch: number
    last_updated: string
    temp_c: number
    temp_f: number
    is_day: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_mph: number
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    pressure_in: number
    precip_mm: number
    precip_in: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    vis_miles: number
    uv: number
    gust_mph: number
    gust_kph: number
  }
}

export interface ForecastDay {
  date: string
  date_epoch: number
  day: {
    maxtemp_c: number
    maxtemp_f: number
    mintemp_c: number
    mintemp_f: number
    avgtemp_c: number
    avgtemp_f: number
    maxwind_mph: number
    maxwind_kph: number
    totalprecip_mm: number
    totalprecip_in: number
    avghumidity: number
    condition: {
      text: string
      icon: string
      code: number
    }
    uv: number
    daily_will_it_rain: number
    daily_will_it_snow: number
    daily_chance_of_rain: number
    daily_chance_of_snow: number
  }
  astro: {
    sunrise: string
    sunset: string
    moonrise: string
    moonset: string
    moon_phase: string
    moon_illumination: number
    is_moon_up: number
    is_sun_up: number
  }
  hour: Array<{
    time_epoch: number
    time: string
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_mph: number
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    pressure_in: number
    precip_mm: number
    precip_in: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    is_day: number
  }>
}

export interface ForecastData {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime_epoch: number
    localtime: string
  }
  current: WeatherData['current']
  forecast: {
    forecastday: ForecastDay[]
  }
}

export async function getCurrentWeather(city: string): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHERAPI_KEY
  if (!apiKey) {
    throw new Error('WeatherAPI key is not configured')
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      if (response.status === 400) return null
      throw new Error(`Weather API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

export async function getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHERAPI_KEY
  if (!apiKey) {
    throw new Error('WeatherAPI key is not configured')
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching weather by coords:', error)
    return null
  }
}

export async function getForecast(city: string, days: number = 7): Promise<ForecastData | null> {
  const apiKey = process.env.WEATHERAPI_KEY
  if (!apiKey) {
    throw new Error('WeatherAPI key is not configured')
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      if (response.status === 400) return null
      throw new Error(`Forecast API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return null
  }
}

export async function getForecastByCoords(lat: number, lon: number, days: number = 7): Promise<ForecastData | null> {
  const apiKey = process.env.WEATHERAPI_KEY
  if (!apiKey) {
    throw new Error('WeatherAPI key is not configured')
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching forecast by coords:', error)
    return null
  }
}

export function getWeatherIconUrl(iconPath: string): string {
  if (iconPath.startsWith('//')) {
    return `https:${iconPath}`
  }
  if (iconPath.startsWith('http')) {
    return iconPath
  }
  return `https:${iconPath}`
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(deg / 45) % 8
  return directions[index]
}
