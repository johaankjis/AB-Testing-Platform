// Core data types for the A/B Testing Platform

export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived"
export type MetricType = "conversion" | "revenue" | "engagement" | "guardrail"
export type VariantType = "control" | "treatment"
export type RandomizationUnit = "user_id" | "session_id" | "device_id"

export interface Experiment {
  id: string
  name: string
  description: string
  hypothesis: string
  status: ExperimentStatus
  owner: string
  startDate: string | null
  endDate: string | null
  targetSampleSize: number
  randomizationUnit: RandomizationUnit
  trafficAllocation: number // 0-100 percentage
  createdAt: string
  updatedAt: string
}

export interface Variant {
  id: string
  experimentId: string
  name: string
  type: VariantType
  description: string
  trafficSplit: number // 0-100 percentage
  isControl: boolean
}

export interface Metric {
  id: string
  experimentId: string
  name: string
  type: MetricType
  description: string
  isPrimary: boolean
  sqlQuery?: string
  expectedEffect?: number // Expected lift percentage
  minimumDetectableEffect?: number // MDE for power analysis
}

export interface Exposure {
  id: string
  experimentId: string
  variantId: string
  userId: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface MetricValue {
  id: string
  experimentId: string
  variantId: string
  metricId: string
  userId: string
  value: number
  timestamp: string
}

export interface ExperimentResult {
  experimentId: string
  variantId: string
  variantName: string
  metricId: string
  metricName: string
  sampleSize: number
  mean: number
  variance: number
  standardError: number
  confidenceInterval: [number, number]
  pValue: number
  isStatisticallySignificant: boolean
  relativeUplift?: number
  absoluteUplift?: number
}

export interface PowerAnalysis {
  experimentId: string
  metricId: string
  baselineConversionRate: number
  minimumDetectableEffect: number
  alpha: number // Significance level (typically 0.05)
  power: number // Statistical power (typically 0.8)
  requiredSampleSize: number
  estimatedDuration: number // in days
}

export interface SRMCheck {
  experimentId: string
  timestamp: string
  expectedRatios: Record<string, number>
  observedCounts: Record<string, number>
  chiSquareStatistic: number
  pValue: number
  hasSRM: boolean
}

export interface GuardrailMetric {
  id: string
  experimentId: string
  metricId: string
  threshold: number
  direction: "increase" | "decrease"
  isViolated: boolean
  currentValue?: number
}
