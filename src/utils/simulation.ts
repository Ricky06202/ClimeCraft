export function pseudoRandom(seed: number) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function getDeterministicData(lat: number, lng: number) {
  // Generate a unique seed from coordinates
  const seed = lat * 1000 + lng

  // Helper to get a random number between min and max based on a variation of the seed
  const getRandom = (offset: number, min: number, max: number) => {
    const r = pseudoRandom(seed + offset)
    return Math.floor(r * (max - min + 1)) + min
  }

  // Consistent simulated data for vegetation trend
  const startVegetation = getRandom(1, 60, 90)
  const vegetationTrend = [
    startVegetation,
    startVegetation - getRandom(2, 0, 5),
    startVegetation - getRandom(3, 2, 8),
    startVegetation - getRandom(4, 5, 12),
    startVegetation - getRandom(5, 8, 20),
  ]

  // Consistent fallback for weather if API fails
  const fallbackWeather = {
    humedad: getRandom(10, 50, 90),
    temperatura: getRandom(20, 15, 35),
    viento: getRandom(30, 5, 30),
  }

  return { vegetationTrend, fallbackWeather }
}
