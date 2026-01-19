import { GoogleGenAI } from '@google/genai'

const API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY

export async function getRiskDiagnosis(
  locationName: string,
  weather: { temperatura: number; humedad: number; viento: number },
): Promise<{ diagnosis: string; trend: number[] }> {
  // Default fallback if no Key
  const defaultFallback = {
    diagnosis:
      'IA Simulado: Se detectan condiciones de riesgo moderado. Se recomienda monitoreo.',
    trend: [85, 84, 83, 82, 80], // Default slight decline
  }

  if (!API_KEY || API_KEY === 'your_gemini_key_here') {
    return defaultFallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY })

    // Models to try with the new SDK
    const modelsToTry = ['gemini-3-flash-preview']

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

    for (const modelName of modelsToTry) {
      try {
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
      } catch (modelError: any) {
        console.warn(`Model ${modelName} failed:`, modelError.message)
      }
    }

    throw new Error('All Gemini models failed.')
  } catch (error) {
    console.error('Gemini API Error:', error)
    return defaultFallback
  }
}
