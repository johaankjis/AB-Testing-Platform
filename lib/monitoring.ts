// Real-time monitoring and alerting

import type { Experiment, Metric } from "./types"
import { getExposures, getMetricValues } from "./tracking"

export interface MonitoringAlert {
  id: string
  experimentId: string
  type: "sample_ratio_mismatch" | "low_traffic" | "metric_anomaly" | "guardrail_violation"
  severity: "info" | "warning" | "critical"
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

// Monitor experiment health in real-time
export function monitorExperimentHealth(experiment: Experiment): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = []
  const exposures = getExposures(experiment.id)

  // Check for low traffic
  const hoursSinceStart = experiment.startDate
    ? (Date.now() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60)
    : 0

  if (hoursSinceStart > 24 && exposures.length < 100) {
    alerts.push({
      id: `alert-${Date.now()}-low-traffic`,
      experimentId: experiment.id,
      type: "low_traffic",
      severity: "warning",
      message: `Low traffic detected: Only ${exposures.length} exposures in ${hoursSinceStart.toFixed(0)} hours`,
      timestamp: new Date().toISOString(),
      metadata: { exposureCount: exposures.length, hoursSinceStart },
    })
  }

  // Check for data collection issues
  const recentExposures = exposures.filter((e) => {
    const exposureTime = new Date(e.timestamp).getTime()
    return Date.now() - exposureTime < 60 * 60 * 1000 // Last hour
  })

  if (experiment.status === "running" && hoursSinceStart > 1 && recentExposures.length === 0) {
    alerts.push({
      id: `alert-${Date.now()}-no-data`,
      experimentId: experiment.id,
      type: "low_traffic",
      severity: "critical",
      message: "No exposures recorded in the last hour. Check data collection.",
      timestamp: new Date().toISOString(),
    })
  }

  return alerts
}

// Monitor metric anomalies
export function monitorMetricAnomalies(experimentId: string, metrics: Metric[]): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = []

  for (const metric of metrics) {
    const values = getMetricValues(experimentId, metric.id)

    if (values.length === 0) continue

    // Calculate basic statistics
    const metricValues = values.map((v) => v.value)
    const mean = metricValues.reduce((sum, v) => sum + v, 0) / metricValues.length
    const variance = metricValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (metricValues.length - 1 || 1)
    const stdDev = Math.sqrt(variance)

    // Check for outliers (values beyond 3 standard deviations)
    const outliers = metricValues.filter((v) => Math.abs(v - mean) > 3 * stdDev)

    if (outliers.length > metricValues.length * 0.05) {
      // More than 5% outliers
      alerts.push({
        id: `alert-${Date.now()}-anomaly-${metric.id}`,
        experimentId,
        type: "metric_anomaly",
        severity: "warning",
        message: `Unusual distribution detected in ${metric.name}: ${outliers.length} outliers (${((outliers.length / metricValues.length) * 100).toFixed(1)}%)`,
        timestamp: new Date().toISOString(),
        metadata: { metricId: metric.id, outlierCount: outliers.length, totalValues: metricValues.length },
      })
    }
  }

  return alerts
}

// Get all active alerts for an experiment
export function getActiveAlerts(experiment: Experiment, metrics: Metric[]): MonitoringAlert[] {
  const healthAlerts = monitorExperimentHealth(experiment)
  const metricAlerts = monitorMetricAnomalies(experiment.id, metrics)

  return [...healthAlerts, ...metricAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

// Calculate experiment velocity (users per day)
export function calculateExperimentVelocity(experimentId: string): {
  usersPerDay: number
  usersPerHour: number
  projectedCompletionDate: string | null
  targetSampleSize: number
} {
  const exposures = getExposures(experimentId)
  const uniqueUsers = new Set(exposures.map((e) => e.userId)).size

  if (exposures.length === 0) {
    return {
      usersPerDay: 0,
      usersPerHour: 0,
      projectedCompletionDate: null,
      targetSampleSize: 0,
    }
  }

  // Calculate time range
  const timestamps = exposures.map((e) => new Date(e.timestamp).getTime())
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const daysElapsed = (maxTime - minTime) / (1000 * 60 * 60 * 24) || 1

  const usersPerDay = uniqueUsers / daysElapsed
  const usersPerHour = usersPerDay / 24

  return {
    usersPerDay,
    usersPerHour,
    projectedCompletionDate: null,
    targetSampleSize: 0,
  }
}
