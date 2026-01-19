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
    aiDiagnosis?: string
    aiError?: string
    retryAfter?: number
  }
}

import { getWeatherData } from '../services/weather'
import { getLocationName } from '../services/geocoding'
import { getDeterministicData } from '../utils/simulation'
import { getRiskDiagnosis, type AIDiagnosisResult } from '../services/ai'

const Dashboard: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  )

  const handleSelectLocation = async (location: {
    lat: number
    lng: number
    name: string
  }) => {
    // 1. Fetch Real Weather Data
    const weather = await getWeatherData(location.lat, location.lng)
    if (!weather) return

    // 2. Fetch Real Location Name
    const realName = await getLocationName(location.lat, location.lng)
    const finalName = realName.includes('Desconocida')
      ? location.name
      : realName

    // 3. Trends & Risk Calculation
    const { vegetationTrend } = getDeterministicData(location.lat, location.lng)
    const trend = [0, 0, 0, 0, 0]

    let risk: 'Bajo' | 'Medio' | 'Alto' = 'Bajo'
    if (weather.temperatura > 30 && weather.humedad < 40) risk = 'Alto'
    else if (weather.temperatura > 28) risk = 'Medio'

    // 4. Initial State Update (Show Card immediately)
    const newLocationData: LocationData = {
      lat: location.lat,
      lng: location.lng,
      name: finalName,
      riskData: {
        humedad: weather.humedad,
        temperatura: weather.temperatura,
        viento: weather.viento,
        vegetationTrend: trend,
        riskLevel: risk,
        isSimulated: weather.isSimulated,
        aiDiagnosis: undefined, // Loading state
      },
    }
    setSelectedLocation(newLocationData)

    // 5. Fetch Gemini AI Diagnosis & Trend (Async)
    try {
      const aiResult = await getRiskDiagnosis(finalName, weather)

      // Update state with AI result if the user hasn't closed/changed selection
      setSelectedLocation((prev) => {
        if (prev && prev.lat === location.lat && prev.lng === location.lng) {
          return {
            ...prev,
            riskData: {
              ...prev.riskData,
              aiDiagnosis: aiResult.error ? undefined : aiResult.diagnosis,
              vegetationTrend: aiResult.trend,
              aiError: aiResult.error,
              retryAfter: aiResult.retryAfter,
            },
          }
        }
        return prev
      })
    } catch (e) {
      console.error('AI Failure', e)
    }
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
