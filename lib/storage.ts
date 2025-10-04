// Local storage utilities for persisting data

import type { Experiment, Variant, Metric } from "./types"

const STORAGE_KEYS = {
  EXPERIMENTS: "ab_testing_experiments",
  VARIANTS: "ab_testing_variants",
  METRICS: "ab_testing_metrics",
  EXPOSURES: "ab_testing_exposures",
  METRIC_VALUES: "ab_testing_metric_values",
}

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Experiments
export function getExperiments(): Experiment[] {
  return getFromStorage<Experiment>(STORAGE_KEYS.EXPERIMENTS)
}

export function saveExperiment(experiment: Experiment): void {
  const experiments = getExperiments()
  const index = experiments.findIndex((e) => e.id === experiment.id)
  if (index >= 0) {
    experiments[index] = experiment
  } else {
    experiments.push(experiment)
  }
  saveToStorage(STORAGE_KEYS.EXPERIMENTS, experiments)
}

export function deleteExperiment(id: string): void {
  const experiments = getExperiments().filter((e) => e.id !== id)
  saveToStorage(STORAGE_KEYS.EXPERIMENTS, experiments)
}

// Variants
export function getVariants(experimentId?: string): Variant[] {
  const variants = getFromStorage<Variant>(STORAGE_KEYS.VARIANTS)
  return experimentId ? variants.filter((v) => v.experimentId === experimentId) : variants
}

export function saveVariant(variant: Variant): void {
  const variants = getVariants()
  const index = variants.findIndex((v) => v.id === variant.id)
  if (index >= 0) {
    variants[index] = variant
  } else {
    variants.push(variant)
  }
  saveToStorage(STORAGE_KEYS.VARIANTS, variants)
}

// Metrics
export function getMetrics(experimentId?: string): Metric[] {
  const metrics = getFromStorage<Metric>(STORAGE_KEYS.METRICS)
  return experimentId ? metrics.filter((m) => m.experimentId === experimentId) : metrics
}

export function saveMetric(metric: Metric): void {
  const metrics = getMetrics()
  const index = metrics.findIndex((m) => m.id === metric.id)
  if (index >= 0) {
    metrics[index] = metric
  } else {
    metrics.push(metric)
  }
  saveToStorage(STORAGE_KEYS.METRICS, metrics)
}

// Initialize with mock data if empty
export function initializeMockData(): void {
  if (typeof window === "undefined") return

  const experiments = getExperiments()
  if (experiments.length === 0) {
    // Will be populated by the app on first load
    console.log("[v0] Initializing with mock data")
  }
}
