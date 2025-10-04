// Sequential testing and early stopping

import type { ExperimentResult } from "./types"

export interface SequentialTestResult {
  shouldStop: boolean
  reason: string
  confidence: number
  recommendation: "stop_winner" | "stop_no_effect" | "continue"
}

// Alpha spending function (O'Brien-Fleming)
function alphaSpendingFunction(informationFraction: number, alpha = 0.05): number {
  if (informationFraction <= 0 || informationFraction > 1) return 0
  return 2 * (1 - normalCDF(normalInverse(1 - alpha / 2) / Math.sqrt(informationFraction)))
}

// Normal CDF
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - prob : prob
}

// Normal inverse
function normalInverse(p: number): number {
  if (p <= 0 || p >= 1) return 0
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637]
  const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833]
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
  const c = [
    0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863, 0.0038405729373609,
    0.0003951896511919, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187,
  ]
  let x = c[0]
  for (let i = 1; i < c.length; i++) {
    x += c[i] * Math.pow(r, i)
  }
  if (y < 0) x = -x
  return x
}

// Perform sequential test
export function performSequentialTest(
  currentSampleSize: number,
  targetSampleSize: number,
  primaryResult: ExperimentResult,
  alpha = 0.05,
): SequentialTestResult {
  const informationFraction = currentSampleSize / targetSampleSize
  const adjustedAlpha = alphaSpendingFunction(informationFraction, alpha)

  // Check if we have statistical significance with adjusted alpha
  const isSignificant = primaryResult.pValue < adjustedAlpha

  // Calculate confidence based on information fraction and significance
  const confidence = isSignificant ? 1 - primaryResult.pValue : informationFraction

  // Early stopping for futility (unlikely to reach significance)
  const futilityThreshold = 0.5
  if (informationFraction > futilityThreshold && primaryResult.pValue > 0.5) {
    return {
      shouldStop: true,
      reason: "Futility: Unlikely to detect significant effect even with full sample size",
      confidence: 0.95,
      recommendation: "stop_no_effect",
    }
  }

  // Early stopping for success
  if (isSignificant && informationFraction >= 0.5) {
    return {
      shouldStop: true,
      reason: `Statistical significance achieved with adjusted alpha (p=${primaryResult.pValue.toFixed(4)} < ${adjustedAlpha.toFixed(4)})`,
      confidence,
      recommendation: "stop_winner",
    }
  }

  // Continue experiment
  return {
    shouldStop: false,
    reason: `Continue collecting data (${(informationFraction * 100).toFixed(1)}% of target sample size)`,
    confidence,
    recommendation: "continue",
  }
}

// Calculate optimal stopping time
export function calculateOptimalStoppingTime(
  currentResults: ExperimentResult[],
  currentSampleSize: number,
  targetSampleSize: number,
): {
  canStopEarly: boolean
  estimatedSampleSizeNeeded: number
  daysRemaining: number
} {
  const informationFraction = currentSampleSize / targetSampleSize

  // Find best performing variant
  const treatmentResults = currentResults.filter((r) => !r.variantName.toLowerCase().includes("control"))
  const bestResult = treatmentResults.reduce((best, current) => {
    if (!best || Math.abs(current.relativeUplift) > Math.abs(best.relativeUplift)) return current
    return best
  }, treatmentResults[0])

  if (!bestResult) {
    return {
      canStopEarly: false,
      estimatedSampleSizeNeeded: targetSampleSize,
      daysRemaining: 14,
    }
  }

  // Estimate sample size needed based on current effect size
  const observedEffectSize = Math.abs(bestResult.relativeUplift) / 100
  const estimatedSampleSizeNeeded =
    observedEffectSize > 0 ? Math.ceil((16 * Math.pow(0.05, 2)) / Math.pow(observedEffectSize, 2)) : targetSampleSize

  const canStopEarly = currentSampleSize >= estimatedSampleSizeNeeded && bestResult.isStatisticallySignificant

  const remainingSamples = Math.max(0, estimatedSampleSizeNeeded - currentSampleSize)
  const samplesPerDay = currentSampleSize / 7 // Assume 7 days elapsed
  const daysRemaining = samplesPerDay > 0 ? Math.ceil(remainingSamples / samplesPerDay) : 14

  return {
    canStopEarly,
    estimatedSampleSizeNeeded,
    daysRemaining,
  }
}
