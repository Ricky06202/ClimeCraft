import { GoogleGenAI } from '@google/genai'

const API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY

export interface AIDiagnosisResult {
  diagnosis: string
  trend: number[]
  error?: string
  retryAfter?: number
}

export async function getRiskDiagnosis(
  locationName: string,
  weather: { temperatura: number; humedad: number; viento: number },
): Promise<AIDiagnosisResult> {
  // Default fallback if no Key
  const defaultFallback: AIDiagnosisResult = {
    diagnosis:
      'IA Simulado: Se detectan condiciones de riesgo moderado. Se recomienda monitoreo.',
    trend: [0, 0, 0, 0, 0], // Default to zero when Gemini is not active
  }

  if (!API_KEY || API_KEY === 'your_gemini_key_here') {
    return defaultFallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY })
    const modelName = 'gemini-2.5-flash'

    const prompt = `
      Actúa como un experto climatólogo.
      Ubicación: ${locationName}.
      Clima: ${weather.temperatura}°C, ${weather.humedad}% humedad, ${weather.viento} km/h viento.
      
      Tarea:
      1. Genera un diagnóstico de riesgo BREVE (max 30 palabras).
      2. Estima la "Cobertura Boscosa" (%) de los últimos 5 años (2020-2024) basado en la realidad conocida de esa zona (ej: ciudad=bajo, selva=alto, deforestación=bajando).
      
      Responde SOLO con este JSON (sin markdown):
      {
        "diagnosis": "Texto del diagnóstico...",
        "trend": [2020_val, 2021_val, 2022_val, 2023_val, 2024_val]
      }
    `

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    })

    if (response.text) {
      // Clean up potential markdown formatting (```json ... ```)
      const cleanText = response.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      return JSON.parse(cleanText)
    }

    throw new Error('All Gemini models failed.')
  } catch (error: any) {
    console.error('Gemini API Error:', error)

    let retryAfter = 0
    let errorMessage = ''

    // Extract quota error info if present
    if (error.message && error.message.includes('429')) {
      errorMessage = 'Límite de cuota excedido'
      const match = error.message.match(/"retryDelay":\s*"(\d+)s"/)
      if (match) {
        retryAfter = parseInt(match[1], 10)
      }
    }

    return {
      ...defaultFallback,
      trend: [0, 0, 0, 0, 0], // Reset trend to avoid showing "fake" data on error
      error: errorMessage || error.message,
      retryAfter: retryAfter > 0 ? retryAfter : undefined,
    }
  }
}
