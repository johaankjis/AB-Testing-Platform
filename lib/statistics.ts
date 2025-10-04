// Statistical analysis functions for A/B testing

export interface TTestResult {
  tStatistic: number
  pValue: number
  degreesOfFreedom: number
  isSignificant: boolean
  confidenceInterval: [number, number]
}

export interface PowerAnalysisParams {
  baselineRate: number
  minimumDetectableEffect: number
  alpha: number
  power: number
  twoTailed?: boolean
}

export interface PowerAnalysisResult {
  requiredSampleSizePerVariant: number
  totalSampleSize: number
  estimatedDuration: number
}

// Calculate mean
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

// Calculate variance
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = calculateMean(values)
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
}

// Calculate standard error
export function calculateStandardError(variance: number, sampleSize: number): number {
  return Math.sqrt(variance / sampleSize)
}

// Two-sample t-test
export function twoSampleTTest(
  controlMean: number,
  controlVariance: number,
  controlSize: number,
  treatmentMean: number,
  treatmentVariance: number,
  treatmentSize: number,
  alpha = 0.05,
): TTestResult {
  // Pooled standard error
  const se1 = controlVariance / controlSize
  const se2 = treatmentVariance / treatmentSize
  const pooledSE = Math.sqrt(se1 + se2)

  // T-statistic
  const tStatistic = (treatmentMean - controlMean) / pooledSE

  // Degrees of freedom (Welch's approximation)
  const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2) / (controlSize - 1) + Math.pow(se2, 2) / (treatmentSize - 1))

  // P-value (two-tailed) - approximation
  const pValue = 2 * (1 - studentTCDF(Math.abs(tStatistic), df))

  // Confidence interval
  const criticalValue = studentTInverse(1 - alpha / 2, df)
  const marginOfError = criticalValue * pooledSE
  const confidenceInterval: [number, number] = [
    treatmentMean - controlMean - marginOfError,
    treatmentMean - controlMean + marginOfError,
  ]

  return {
    tStatistic,
    pValue,
    degreesOfFreedom: df,
    isSignificant: pValue < alpha,
    confidenceInterval,
  }
}

// Approximation of Student's t CDF
function studentTCDF(t: number, df: number): number {
  // Using normal approximation for simplicity
  // In production, use a proper statistical library
  return normalCDF(t)
}

// Approximation of Student's t inverse
function studentTInverse(p: number, df: number): number {
  // Using normal approximation for simplicity
  return normalInverse(p)
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
  // Beasley-Springer-Moro algorithm approximation
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

// Power analysis for conversion rate experiments
export function calculatePowerAnalysis(params: PowerAnalysisParams): PowerAnalysisResult {
  const { baselineRate, minimumDetectableEffect, alpha, power, twoTailed = true } = params

  // Convert MDE from percentage to absolute
  const mde = baselineRate * (minimumDetectableEffect / 100)
  const treatmentRate = baselineRate + mde

  // Z-scores
  const zAlpha = normalInverse(twoTailed ? 1 - alpha / 2 : 1 - alpha)
  const zBeta = normalInverse(power)

  // Pooled variance
  const p = (baselineRate + treatmentRate) / 2
  const variance = p * (1 - p)

  // Sample size per variant
  const n = Math.ceil((2 * variance * Math.pow(zAlpha + zBeta, 2)) / Math.pow(mde, 2))

  // Assume 1000 users per day per variant
  const usersPerDay = 1000
  const estimatedDuration = Math.ceil(n / usersPerDay)

  return {
    requiredSampleSizePerVariant: n,
    totalSampleSize: n * 2,
    estimatedDuration,
  }
}

// Sample Ratio Mismatch (SRM) check using Chi-square test
export function checkSRM(
  expectedRatios: Record<string, number>,
  observedCounts: Record<string, number>,
): { chiSquare: number; pValue: number; hasSRM: boolean } {
  const variants = Object.keys(expectedRatios)
  const totalObserved = Object.values(observedCounts).reduce((sum, count) => sum + count, 0)

  let chiSquare = 0
  for (const variant of variants) {
    const expected = expectedRatios[variant] * totalObserved
    const observed = observedCounts[variant] || 0
    chiSquare += Math.pow(observed - expected, 2) / expected
  }

  // Degrees of freedom
  const df = variants.length - 1

  // P-value approximation (chi-square distribution)
  const pValue = 1 - chiSquareCDF(chiSquare, df)

  return {
    chiSquare,
    pValue,
    hasSRM: pValue < 0.001, // SRM detected if p < 0.001
  }
}

// Chi-square CDF approximation
function chiSquareCDF(x: number, df: number): number {
  // Simple approximation using normal distribution
  if (df > 30) {
    const z = (Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df))
    return normalCDF(z)
  }
  // For smaller df, use a rough approximation
  return Math.min(1, x / (df * 2))
}

// Calculate relative uplift
export function calculateRelativeUplift(control: number, treatment: number): number {
  if (control === 0) return 0
  return ((treatment - control) / control) * 100
}

// Calculate confidence interval
export function calculateConfidenceInterval(mean: number, standardError: number, alpha = 0.05): [number, number] {
  const zScore = normalInverse(1 - alpha / 2)
  const marginOfError = zScore * standardError
  return [mean - marginOfError, mean + marginOfError]
}
