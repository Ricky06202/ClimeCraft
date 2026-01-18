import { getDeterministicData } from '../utils/simulation'

interface WeatherData {
  humedad: number
  temperatura: number
  viento: number
  isSimulated: boolean
}

const API_KEY = import.meta.env.PUBLIC_OPENWEATHER_API_KEY

export async function getWeatherData(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  const { fallbackWeather } = getDeterministicData(lat, lng)

  // Check if API key is present (Masked log)
  console.log(
    '🔑 API Key Check:',
    API_KEY ? `Present (Starts with ${API_KEY.substring(0, 4)}...)` : 'Missing'
  )

  // If no API key is provided, return consistent simulated data
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn(
      '⚠️ No OpenWeatherMap API Key found. Using DETERMINISTIC SIMULATION.'
    )
    return { ...fallbackWeather, isSimulated: true }
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}&lang=es`
    )

    if (!response.ok) {
      console.warn(`API Error ${response.status}: Reverting to simulation.`)
      return { ...fallbackWeather, isSimulated: true }
    }

    console.log('✅ Success! Fetching REAL data from OpenWeatherMap.')

    const data = await response.json()

    return {
      humedad: data.main.humidity,
      temperatura: Math.round(data.main.temp),
      viento: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      isSimulated: false,
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return { ...fallbackWeather, isSimulated: true }
  }
}
