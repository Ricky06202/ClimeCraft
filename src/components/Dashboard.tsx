import React, { useState } from 'react'
import MapViewer from './MapViewer'
import RiskCard from './RiskCard'

interface LocationData {
  lat: number
  lng: number
  name: string
  riskData: {
    humedad: number
    temperatura: number
    viento: number
    vegetationTrend: number[]
    riskLevel: 'Bajo' | 'Medio' | 'Alto'
    isSimulated: boolean
  }
}

import { getWeatherData } from '../services/weather'
import { getLocationName } from '../services/geocoding'
import { getDeterministicData } from '../utils/simulation'

const Dashboard: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  )

  const handleSelectLocation = async (location: {
    lat: number
    lng: number
    name: string
  }) => {
    // 1. Fetch Real Weather Data (or consistent fallback)
    const weather = await getWeatherData(location.lat, location.lng)

    // If critical error (shouldn't happen with fallback), return
    if (!weather) return

    // 2. Fetch Real Location Name (Only attempts if we are online/have key, otherwise might duplicate logic or fail gracefully)
    const realName = await getLocationName(location.lat, location.lng)

    // 3. Vegetation Trend (Keep placeholder/simulated if weather is simulated?)
    // If weather is simulated, we definitely use the simulated trend.
    // If weather is real, we still don't have real trend data, so we use trend placeholder or simulation.
    // Let's use deterministic trend always for now, but mark it as simulated if weather is simulated.
    const trend = [0, 0, 0, 0, 0] // Placeholder strictly no fake data

    // Calculate risk based on available data
    let risk: 'Bajo' | 'Medio' | 'Alto' = 'Bajo'
    if (weather.temperatura > 30 && weather.humedad < 40) risk = 'Alto'
    else if (weather.temperatura > 28) risk = 'Medio'

    setSelectedLocation({
      lat: location.lat,
      lng: location.lng,
      name: realName.includes('Desconocida') ? location.name : realName,
      riskData: {
        humedad: weather.humedad,
        temperatura: weather.temperatura,
        viento: weather.viento,
        vegetationTrend: trend, // Zeroed out to avoid fake info
        riskLevel: risk,
        isSimulated: weather.isSimulated,
      },
    })
  }

  return (
    <div className="relative w-full h-full">
      <MapViewer onSelectLocation={handleSelectLocation} />

      {selectedLocation && (
        <RiskCard
          locationName={selectedLocation.name}
          data={selectedLocation.riskData}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
