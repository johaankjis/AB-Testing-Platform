// Guardrail metrics monitoring and alerting

import type { Metric } from "./types"
import { calculateExperimentResults } from "./analysis"

export interface GuardrailCheck {
  metricId: string
  metricName: string
  variantId: string
  variantName: string
  currentValue: number
  threshold: number
  thresholdType: "upper" | "lower"
  isViolated: boolean
  severity: "warning" | "critical"
}

export interface GuardrailConfig {
  metricId: string
  thresholdType: "upper" | "lower"
  threshold: number
  severity: "warning" | "critical"
}

// Check if any guardrail metrics are violated
export function checkGuardrails(
  experimentId: string,
  guardrailMetrics: Metric[],
  guardrailConfigs: GuardrailConfig[],
  variants: any[],
): GuardrailCheck[] {
  const violations: GuardrailCheck[] = []

  for (const metric of guardrailMetrics) {
    const config = guardrailConfigs.find((c) => c.metricId === metric.id)
    if (!config) continue

    const results = calculateExperimentResults(experimentId, metric, variants)

    for (const result of results) {
      // Skip control variant for guardrail checks
      if (result.variantName.toLowerCase().includes("control")) continue

      let isViolated = false
      if (config.thresholdType === "upper" && result.mean > config.threshold) {
        isViolated = true
      } else if (config.thresholdType === "lower" && result.mean < config.threshold) {
        isViolated = true
      }

      if (isViolated) {
        violations.push({
          metricId: metric.id,
          metricName: metric.name,
          variantId: result.variantId,
          variantName: result.variantName,
          currentValue: result.mean,
          threshold: config.threshold,
          thresholdType: config.thresholdType,
          isViolated: true,
          severity: config.severity,
        })
      }
    }
  }

  return violations
}

// Generate guardrail alert message
export function generateGuardrailAlert(check: GuardrailCheck): string {
  const direction = check.thresholdType === "upper" ? "exceeded" : "fallen below"
  return `${check.severity.toUpperCase()}: ${check.variantName} has ${direction} the ${check.metricName} threshold (${check.currentValue.toFixed(4)} vs ${check.threshold.toFixed(4)})`
}

// Recommend action based on guardrail violations
export function recommendAction(violations: GuardrailCheck[]): {
  action: "continue" | "pause" | "stop"
  reason: string
} {
  const criticalViolations = violations.filter((v) => v.severity === "critical")

  if (criticalViolations.length > 0) {
    return {
      action: "stop",
      reason: `${criticalViolations.length} critical guardrail metric(s) violated. Immediate action required.`,
    }
  }

  const warningViolations = violations.filter((v) => v.severity === "warning")
  if (warningViolations.length >= 2) {
    return {
      action: "pause",
      reason: `Multiple warning-level guardrail metrics violated. Consider pausing to investigate.`,
    }
  }

  if (warningViolations.length === 1) {
    return {
      action: "continue",
      reason: `One warning-level guardrail metric violated. Monitor closely but safe to continue.`,
    }
  }

  return {
    action: "continue",
    reason: "All guardrail metrics within acceptable ranges.",
  }
}
