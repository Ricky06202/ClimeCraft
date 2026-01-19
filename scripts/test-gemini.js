// Bun automatically loads .env files
const API_KEY = process.env.PUBLIC_GEMINI_API_KEY

console.log('🔑 Testing Gemini API Key...')
console.log('Key available:', !!API_KEY)

if (!API_KEY || API_KEY === 'your_gemini_key_here') {
  console.error('❌ Invalid API Key in .env.local')
  process.exit(1)
}

async function testGemini() {
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.0-pro',
    'gemini-pro',
    'gemini-3.0-flash',
    'gemini-3.0-pro',
  ]

  const genAI = new GoogleGenerativeAI(API_KEY)

  for (const modelName of modelsToTry) {
    console.log(`\n🤖 Testing model: "${modelName}"...`)
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const prompt = "Hello, respond with 'OK' if you see this."

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log(`✅ SUCCESS with ${modelName}! Response: ${text}`)
      return // Exit on first success
    } catch (error) {
      console.error(`❌ Failed with ${modelName}: ${error.message}`)
    }
  }
  console.error('\n❌ All models failed.')
}

testGemini()
