// Bayesian inference for A/B testing

export interface BayesianResult {
  variantId: string
  variantName: string
  posteriorMean: number
  posteriorStd: number
  credibleInterval: [number, number]
  probabilityToBeBest: number
  expectedLoss: number
}

// Beta distribution parameters for conversion rate
interface BetaParams {
  alpha: number
  beta: number
}

// Calculate posterior for conversion rate (Beta-Binomial model)
export function calculateBetaPosterior(successes: number, trials: number, priorAlpha = 1, priorBeta = 1): BetaParams {
  return {
    alpha: priorAlpha + successes,
    beta: priorBeta + (trials - successes),
  }
}

// Calculate mean of Beta distribution
function betaMean(params: BetaParams): number {
  return params.alpha / (params.alpha + params.beta)
}

// Calculate variance of Beta distribution
function betaVariance(params: BetaParams): number {
  const { alpha, beta } = params
  return (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1))
}

// Calculate credible interval for Beta distribution
function betaCredibleInterval(params: BetaParams, credibility = 0.95): [number, number] {
  // Approximation using normal distribution for large samples
  const mean = betaMean(params)
  const std = Math.sqrt(betaVariance(params))
  const z = 1.96 // 95% credible interval

  return [Math.max(0, mean - z * std), Math.min(1, mean + z * std)]
}

// Monte Carlo simulation for probability to be best
export function calculateProbabilityToBeBest(
  allPosteriors: BetaParams[],
  targetIndex: number,
  numSamples = 10000,
): number {
  let wins = 0

  for (let i = 0; i < numSamples; i++) {
    const samples = allPosteriors.map((params) => sampleBeta(params.alpha, params.beta))
    const maxSample = Math.max(...samples)

    if (samples[targetIndex] === maxSample) {
      wins++
    }
  }

  return wins / numSamples
}

// Sample from Beta distribution (using rejection sampling)
function sampleBeta(alpha: number, beta: number): number {
  // For simplicity, use normal approximation for large alpha, beta
  if (alpha > 10 && beta > 10) {
    const mean = alpha / (alpha + beta)
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1))
    const std = Math.sqrt(variance)
    return Math.max(0, Math.min(1, mean + std * randomNormal()))
  }

  // Simple rejection sampling for small parameters
  const mean = alpha / (alpha + beta)
  const std = Math.sqrt((alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1)))
  return Math.max(0, Math.min(1, mean + std * randomNormal()))
}

// Generate random normal variable (Box-Muller transform)
function randomNormal(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

// Calculate expected loss
export function calculateExpectedLoss(
  targetPosterior: BetaParams,
  allPosteriors: BetaParams[],
  numSamples = 10000,
): number {
  let totalLoss = 0

  for (let i = 0; i < numSamples; i++) {
    const targetSample = sampleBeta(targetPosterior.alpha, targetPosterior.beta)
    const otherSamples = allPosteriors.map((params) => sampleBeta(params.alpha, params.beta))
    const maxOther = Math.max(...otherSamples)

    totalLoss += Math.max(0, maxOther - targetSample)
  }

  return totalLoss / numSamples
}

// Perform Bayesian analysis for conversion metrics
export function performBayesianAnalysis(
  experimentId: string,
  metricId: string,
  variants: Array<{ id: string; name: string; isControl: boolean }>,
  conversionData: Array<{ variantId: string; successes: number; trials: number }>,
): BayesianResult[] {
  const results: BayesianResult[] = []
  const posteriors: BetaParams[] = []

  // Calculate posteriors for all variants
  for (const data of conversionData) {
    const posterior = calculateBetaPosterior(data.successes, data.trials)
    posteriors.push(posterior)
  }

  // Calculate metrics for each variant
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const posterior = posteriors[i]

    const posteriorMean = betaMean(posterior)
    const posteriorStd = Math.sqrt(betaVariance(posterior))
    const credibleInterval = betaCredibleInterval(posterior)
    const probabilityToBeBest = calculateProbabilityToBeBest(posteriors, i)
    const expectedLoss = calculateExpectedLoss(posterior, posteriors)

    results.push({
      variantId: variant.id,
      variantName: variant.name,
      posteriorMean,
      posteriorStd,
      credibleInterval,
      probabilityToBeBest,
      expectedLoss,
    })
  }

  return results
}

// Decision rule: should we stop the experiment?
export function shouldStopExperiment(
  results: BayesianResult[],
  minProbabilityThreshold = 0.95,
  maxExpectedLossThreshold = 0.01,
): {
  shouldStop: boolean
  reason: string
  recommendedVariant: string | null
} {
  // Find variant with highest probability to be best
  const bestVariant = results.reduce((best, current) => {
    if (current.probabilityToBeBest > best.probabilityToBeBest) return current
    return best
  }, results[0])

  // Check if we have a clear winner
  if (
    bestVariant.probabilityToBeBest >= minProbabilityThreshold &&
    bestVariant.expectedLoss <= maxExpectedLossThreshold
  ) {
    return {
      shouldStop: true,
      reason: `${bestVariant.variantName} has ${(bestVariant.probabilityToBeBest * 100).toFixed(1)}% probability to be best`,
      recommendedVariant: bestVariant.variantName,
    }
  }

  // Check if all variants are similar (no clear winner likely)
  const maxProb = Math.max(...results.map((r) => r.probabilityToBeBest))
  if (maxProb < 0.6) {
    return {
      shouldStop: false,
      reason: "No clear winner yet, continue collecting data",
      recommendedVariant: null,
    }
  }

  return {
    shouldStop: false,
    reason: "Continue experiment to reach decision threshold",
    recommendedVariant: null,
  }
}
