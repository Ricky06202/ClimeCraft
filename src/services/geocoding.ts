const API_KEY = import.meta.env.PUBLIC_OPENWEATHER_API_KEY

export async function getLocationName(
  lat: number,
  lng: number
): Promise<string> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return 'Ubicación Desconocida (Falta API Key)'
  }

  try {
    // Limit to 1 result
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`
    )

    if (!response.ok) return 'Ubicación Desconocida'

    const data = await response.json()
    if (data && data.length > 0) {
      const place = data[0]
      const parts = []

      if (place.name) parts.push(place.name) // Local name (e.g. Corregimiento/City)
      if (place.state) parts.push(place.state) // Province/State
      if (place.country) parts.push(place.country) // Country Code

      return parts.join(', ')
    }

    return 'Ubicación Desconocida'
  } catch (error) {
    console.error('Geocoding error:', error)
    return 'Error al obtener ubicación'
  }
}
