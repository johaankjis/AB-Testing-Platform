// Exposure and metric tracking

import type { Exposure, MetricValue } from "./types"

const STORAGE_KEYS = {
  EXPOSURES: "ab_testing_exposures",
  METRIC_VALUES: "ab_testing_metric_values",
}

// Get from storage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// Save to storage
function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Track exposure
export function trackExposure(exposure: Exposure): void {
  const exposures = getFromStorage<Exposure>(STORAGE_KEYS.EXPOSURES)
  exposures.push(exposure)
  saveToStorage(STORAGE_KEYS.EXPOSURES, exposures)
  console.log("[v0] Tracked exposure:", exposure)
}

// Get exposures for an experiment
export function getExposures(experimentId?: string): Exposure[] {
  const exposures = getFromStorage<Exposure>(STORAGE_KEYS.EXPOSURES)
  return experimentId ? exposures.filter((e) => e.experimentId === experimentId) : exposures
}

// Track metric value
export function trackMetricValue(metricValue: MetricValue): void {
  const values = getFromStorage<MetricValue>(STORAGE_KEYS.METRIC_VALUES)
  values.push(metricValue)
  saveToStorage(STORAGE_KEYS.METRIC_VALUES, values)
  console.log("[v0] Tracked metric value:", metricValue)
}

// Get metric values for an experiment
export function getMetricValues(experimentId?: string, metricId?: string): MetricValue[] {
  let values = getFromStorage<MetricValue>(STORAGE_KEYS.METRIC_VALUES)

  if (experimentId) {
    values = values.filter((v) => v.experimentId === experimentId)
  }

  if (metricId) {
    values = values.filter((v) => v.metricId === metricId)
  }

  return values
}

// Get unique user count per variant
export function getUserCountByVariant(experimentId: string): Record<string, number> {
  const exposures = getExposures(experimentId)
  const counts: Record<string, Set<string>> = {}

  for (const exposure of exposures) {
    if (!counts[exposure.variantId]) {
      counts[exposure.variantId] = new Set()
    }
    counts[exposure.variantId].add(exposure.userId)
  }

  const result: Record<string, number> = {}
  for (const [variantId, userSet] of Object.entries(counts)) {
    result[variantId] = userSet.size
  }

  return result
}

// Check for Sample Ratio Mismatch
export function detectSRM(
  experimentId: string,
  expectedRatios: Record<string, number>,
): {
  observed: Record<string, number>
  expected: Record<string, number>
  hasSRM: boolean
  chiSquare: number
  pValue: number
} {
  const observed = getUserCountByVariant(experimentId)
  const totalObserved = Object.values(observed).reduce((sum, count) => sum + count, 0)

  const expected: Record<string, number> = {}
  for (const [variantId, ratio] of Object.entries(expectedRatios)) {
    expected[variantId] = ratio * totalObserved
  }

  // Chi-square test
  let chiSquare = 0
  for (const variantId of Object.keys(expectedRatios)) {
    const obs = observed[variantId] || 0
    const exp = expected[variantId] || 1
    chiSquare += Math.pow(obs - exp, 2) / exp
  }

  // Degrees of freedom
  const df = Object.keys(expectedRatios).length - 1

  // Approximate p-value (simplified)
  const pValue = 1 - chiSquareCDF(chiSquare, df)

  return {
    observed,
    expected,
    hasSRM: pValue < 0.001,
    chiSquare,
    pValue,
  }
}

// Chi-square CDF approximation
function chiSquareCDF(x: number, df: number): number {
  if (df > 30) {
    const z = (Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df))
    return normalCDF(z)
  }
  return Math.min(1, x / (df * 2))
}

// Normal CDF approximation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - prob : prob
}

// Generate mock exposures for testing
export function generateMockExposures(experimentId: string, variantIds: string[], userCount: number): void {
  const exposures: Exposure[] = []

  for (let i = 0; i < userCount; i++) {
    const userId = `user-${i}`
    const variantId = variantIds[i % variantIds.length]

    exposures.push({
      id: `exp-${Date.now()}-${i}`,
      experimentId,
      variantId,
      userId,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  const existing = getFromStorage<Exposure>(STORAGE_KEYS.EXPOSURES)
  saveToStorage(STORAGE_KEYS.EXPOSURES, [...existing, ...exposures])
}

// Generate mock metric values for testing
export function generateMockMetricValues(
  experimentId: string,
  metricId: string,
  variantId: string,
  userIds: string[],
  meanValue: number,
  variance: number,
): void {
  const values: MetricValue[] = []

  for (const userId of userIds) {
    // Generate value with normal distribution approximation
    const value = meanValue + (Math.random() - 0.5) * Math.sqrt(variance) * 2

    values.push({
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      experimentId,
      variantId,
      metricId,
      userId,
      value: Math.max(0, value), // Ensure non-negative
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  const existing = getFromStorage<MetricValue>(STORAGE_KEYS.METRIC_VALUES)
  saveToStorage(STORAGE_KEYS.METRIC_VALUES, [...existing, ...values])
}
