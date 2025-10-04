// Statistical analysis engine for experiment results

import type { ExperimentResult, Variant, Metric } from "./types"
import { getMetricValues, getExposures } from "./tracking"
import {
  calculateMean,
  calculateVariance,
  calculateStandardError,
  twoSampleTTest,
  calculateRelativeUplift,
  calculateConfidenceInterval,
} from "./statistics"

// Aggregate metric values by variant
export function aggregateMetricsByVariant(
  experimentId: string,
  metricId: string,
): Record<string, { values: number[]; userIds: Set<string> }> {
  const metricValues = getMetricValues(experimentId, metricId)
  const aggregated: Record<string, { values: number[]; userIds: Set<string> }> = {}

  for (const mv of metricValues) {
    if (!aggregated[mv.variantId]) {
      aggregated[mv.variantId] = { values: [], userIds: new Set() }
    }
    aggregated[mv.variantId].values.push(mv.value)
    aggregated[mv.variantId].userIds.add(mv.userId)
  }

  return aggregated
}

// Calculate experiment results for a specific metric
export function calculateExperimentResults(
  experimentId: string,
  metric: Metric,
  variants: Variant[],
  alpha = 0.05,
): ExperimentResult[] {
  const results: ExperimentResult[] = []
  const aggregated = aggregateMetricsByVariant(experimentId, metric.id)

  // Find control variant
  const controlVariant = variants.find((v) => v.isControl)
  if (!controlVariant || !aggregated[controlVariant.id]) {
    return results
  }

  const controlData = aggregated[controlVariant.id]
  const controlValues = controlData.values
  const controlMean = calculateMean(controlValues)
  const controlVariance = calculateVariance(controlValues)
  const controlSize = controlData.userIds.size
  const controlSE = calculateStandardError(controlVariance, controlSize)
  const controlCI = calculateConfidenceInterval(controlMean, controlSE, alpha)

  // Add control result
  results.push({
    experimentId,
    variantId: controlVariant.id,
    variantName: controlVariant.name,
    metricId: metric.id,
    metricName: metric.name,
    sampleSize: controlSize,
    mean: controlMean,
    variance: controlVariance,
    standardError: controlSE,
    confidenceInterval: controlCI,
    pValue: 1.0,
    isStatisticallySignificant: false,
    relativeUplift: 0,
    absoluteUplift: 0,
  })

  // Calculate results for treatment variants
  for (const variant of variants) {
    if (variant.isControl || !aggregated[variant.id]) continue

    const treatmentData = aggregated[variant.id]
    const treatmentValues = treatmentData.values
    const treatmentMean = calculateMean(treatmentValues)
    const treatmentVariance = calculateVariance(treatmentValues)
    const treatmentSize = treatmentData.userIds.size
    const treatmentSE = calculateStandardError(treatmentVariance, treatmentSize)

    // Perform t-test
    const tTest = twoSampleTTest(
      controlMean,
      controlVariance,
      controlSize,
      treatmentMean,
      treatmentVariance,
      treatmentSize,
      alpha,
    )

    // Calculate uplifts
    const relativeUplift = calculateRelativeUplift(controlMean, treatmentMean)
    const absoluteUplift = treatmentMean - controlMean

    // Confidence interval for treatment
    const treatmentCI = calculateConfidenceInterval(treatmentMean, treatmentSE, alpha)

    results.push({
      experimentId,
      variantId: variant.id,
      variantName: variant.name,
      metricId: metric.id,
      metricName: metric.name,
      sampleSize: treatmentSize,
      mean: treatmentMean,
      variance: treatmentVariance,
      standardError: treatmentSE,
      confidenceInterval: treatmentCI,
      pValue: tTest.pValue,
      isStatisticallySignificant: tTest.isSignificant,
      relativeUplift,
      absoluteUplift,
    })
  }

  return results
}

// Calculate all results for an experiment
export function calculateAllExperimentResults(
  experimentId: string,
  metrics: Metric[],
  variants: Variant[],
): Map<string, ExperimentResult[]> {
  const resultsByMetric = new Map<string, ExperimentResult[]>()

  for (const metric of metrics) {
    const results = calculateExperimentResults(experimentId, metric, variants)
    if (results.length > 0) {
      resultsByMetric.set(metric.id, results)
    }
  }

  return resultsByMetric
}

// Calculate statistical power achieved
export function calculateAchievedPower(
  controlSize: number,
  treatmentSize: number,
  controlMean: number,
  treatmentMean: number,
  pooledVariance: number,
  alpha = 0.05,
): number {
  const effectSize = Math.abs(treatmentMean - controlMean) / Math.sqrt(pooledVariance)
  const n = Math.min(controlSize, treatmentSize)

  // Simplified power calculation
  const zAlpha = normalInverse(1 - alpha / 2)
  const zBeta = effectSize * Math.sqrt(n / 2) - zAlpha

  return normalCDF(zBeta)
}

// Normal CDF approximation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - prob : prob
}

// Normal inverse approximation
function normalInverse(p: number): number {
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637]
  const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833]
  const c = [
    0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863, 0.0038405729373609,
    0.0003951896511919, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187,
  ]

  if (p <= 0 || p >= 1) return 0

  const y = p - 0.5
  if (Math.abs(y) < 0.42) {
    const r = y * y
    let x = y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0])
    x /= (((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1
    return x
  }

  let r = p
  if (y > 0) r = 1 - p
  r = Math.log(-Math.log(r))
  let x = c[0]
  for (let i = 1; i < c.length; i++) {
    x += c[i] * Math.pow(r, i)
  }
  if (y < 0) x = -x
  return x
}

// Sequential testing: calculate adjusted alpha for multiple looks
export function calculateSequentialAlpha(numberOfLooks: number, overallAlpha = 0.05): number {
  // O'Brien-Fleming spending function approximation
  return overallAlpha / Math.sqrt(numberOfLooks)
}

// Check if experiment has reached statistical significance
export function hasReachedSignificance(results: ExperimentResult[], primaryMetricId: string): boolean {
  const primaryResults = results.filter((r) => r.metricId === primaryMetricId && !r.variantName.includes("Control"))
  return primaryResults.some((r) => r.isStatisticallySignificant)
}

// Calculate experiment health score (0-100)
export function calculateExperimentHealth(
  experimentId: string,
  targetSampleSize: number,
  variants: Variant[],
): {
  score: number
  issues: string[]
  sampleSizeProgress: number
} {
  const issues: string[] = []
  let score = 100

  // Check sample size progress
  const exposures = getExposures(experimentId)
  const uniqueUsers = new Set(exposures.map((e) => e.userId)).size
  const sampleSizeProgress = (uniqueUsers / targetSampleSize) * 100

  if (sampleSizeProgress < 50) {
    score -= 20
    issues.push("Sample size below 50% of target")
  }

  // Check for SRM
  const expectedRatios: Record<string, number> = {}
  variants.forEach((v) => {
    expectedRatios[v.id] = v.trafficSplit / 100
  })

  const observed: Record<string, number> = {}
  for (const exposure of exposures) {
    observed[exposure.variantId] = (observed[exposure.variantId] || 0) + 1
  }

  const totalObserved = Object.values(observed).reduce((sum, count) => sum + count, 0)
  let chiSquare = 0
  for (const variantId of Object.keys(expectedRatios)) {
    const expected = expectedRatios[variantId] * totalObserved
    const obs = observed[variantId] || 0
    chiSquare += Math.pow(obs - expected, 2) / expected
  }

  const df = variants.length - 1
  const pValue = 1 - chiSquareCDF(chiSquare, df)

  if (pValue < 0.001) {
    score -= 30
    issues.push("Sample Ratio Mismatch detected")
  }

  // Check for sufficient data per variant
  const minUsersPerVariant = 100
  for (const variantId of Object.keys(observed)) {
    if (observed[variantId] < minUsersPerVariant) {
      score -= 10
      issues.push(`Variant has fewer than ${minUsersPerVariant} users`)
      break
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    sampleSizeProgress,
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

// Generate experiment summary
export interface ExperimentSummary {
  experimentId: string
  totalUsers: number
  primaryMetricResult: ExperimentResult | null
  hasWinner: boolean
  winningVariant: string | null
  healthScore: number
  healthIssues: string[]
  sampleSizeProgress: number
}

export function generateExperimentSummary(
  experimentId: string,
  targetSampleSize: number,
  variants: Variant[],
  metrics: Metric[],
): ExperimentSummary {
  const primaryMetric = metrics.find((m) => m.isPrimary)
  const exposures = getExposures(experimentId)
  const totalUsers = new Set(exposures.map((e) => e.userId)).size

  let primaryMetricResult: ExperimentResult | null = null
  let hasWinner = false
  let winningVariant: string | null = null

  if (primaryMetric) {
    const results = calculateExperimentResults(experimentId, primaryMetric, variants)
    const treatmentResults = results.filter((r) => !r.variantName.includes("Control"))

    // Find best performing treatment
    const bestTreatment = treatmentResults.reduce((best, current) => {
      if (!best || current.mean > best.mean) return current
      return best
    }, treatmentResults[0])

    if (bestTreatment) {
      primaryMetricResult = bestTreatment
      hasWinner = bestTreatment.isStatisticallySignificant
      winningVariant = hasWinner ? bestTreatment.variantName : null
    }
  }

  const health = calculateExperimentHealth(experimentId, targetSampleSize, variants)

  return {
    experimentId,
    totalUsers,
    primaryMetricResult,
    hasWinner,
    winningVariant,
    healthScore: health.score,
    healthIssues: health.issues,
    sampleSizeProgress: health.sampleSizeProgress,
  }
}
