// Mock data generators for the A/B Testing Platform

import type { Experiment, Variant, Metric, ExperimentResult } from "./types"

export function generateMockExperiments(): Experiment[] {
  return [
    {
      id: "exp-1",
      name: "Checkout Button Color Test",
      description: "Testing the impact of button color on conversion rate",
      hypothesis: "Changing the checkout button from blue to green will increase conversion rate by 5%",
      status: "running",
      owner: "Sarah Chen",
      startDate: "2025-01-15",
      endDate: null,
      targetSampleSize: 10000,
      randomizationUnit: "user_id",
      trafficAllocation: 100,
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-01-15T09:00:00Z",
    },
    {
      id: "exp-2",
      name: "Pricing Page Layout Redesign",
      description: "Testing a new pricing page layout with clearer tier differentiation",
      hypothesis: "New layout will increase premium tier selection by 15%",
      status: "running",
      owner: "Michael Rodriguez",
      startDate: "2025-01-20",
      endDate: null,
      targetSampleSize: 15000,
      randomizationUnit: "user_id",
      trafficAllocation: 50,
      createdAt: "2025-01-18T14:30:00Z",
      updatedAt: "2025-01-20T08:00:00Z",
    },
    {
      id: "exp-3",
      name: "Onboarding Flow Simplification",
      description: "Reducing onboarding steps from 5 to 3",
      hypothesis: "Simplified onboarding will increase completion rate by 20%",
      status: "completed",
      owner: "Emily Watson",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      targetSampleSize: 8000,
      randomizationUnit: "user_id",
      trafficAllocation: 100,
      createdAt: "2024-11-25T09:00:00Z",
      updatedAt: "2024-12-31T23:59:59Z",
    },
    {
      id: "exp-4",
      name: "Email Subject Line Test",
      description: "Testing personalized vs generic subject lines",
      hypothesis: "Personalized subject lines will increase open rate by 10%",
      status: "draft",
      owner: "David Kim",
      startDate: null,
      endDate: null,
      targetSampleSize: 20000,
      randomizationUnit: "user_id",
      trafficAllocation: 100,
      createdAt: "2025-01-28T11:00:00Z",
      updatedAt: "2025-01-28T11:00:00Z",
    },
  ]
}

export function generateMockVariants(experimentId: string): Variant[] {
  const variantSets: Record<string, Variant[]> = {
    "exp-1": [
      {
        id: "var-1-control",
        experimentId: "exp-1",
        name: "Blue Button (Control)",
        type: "control",
        description: "Original blue checkout button",
        trafficSplit: 50,
        isControl: true,
      },
      {
        id: "var-1-treatment",
        experimentId: "exp-1",
        name: "Green Button",
        type: "treatment",
        description: "New green checkout button",
        trafficSplit: 50,
        isControl: false,
      },
    ],
    "exp-2": [
      {
        id: "var-2-control",
        experimentId: "exp-2",
        name: "Current Layout (Control)",
        type: "control",
        description: "Existing pricing page layout",
        trafficSplit: 50,
        isControl: true,
      },
      {
        id: "var-2-treatment",
        experimentId: "exp-2",
        name: "New Layout",
        type: "treatment",
        description: "Redesigned pricing page with clearer tiers",
        trafficSplit: 50,
        isControl: false,
      },
    ],
  }

  return variantSets[experimentId] || []
}

export function generateMockMetrics(experimentId: string): Metric[] {
  const metricSets: Record<string, Metric[]> = {
    "exp-1": [
      {
        id: "metric-1-primary",
        experimentId: "exp-1",
        name: "Checkout Conversion Rate",
        type: "conversion",
        description: "Percentage of users who complete checkout",
        isPrimary: true,
        expectedEffect: 5,
        minimumDetectableEffect: 3,
      },
      {
        id: "metric-1-revenue",
        experimentId: "exp-1",
        name: "Average Order Value",
        type: "revenue",
        description: "Average revenue per order",
        isPrimary: false,
        expectedEffect: 0,
        minimumDetectableEffect: 5,
      },
      {
        id: "metric-1-guardrail",
        experimentId: "exp-1",
        name: "Page Load Time",
        type: "guardrail",
        description: "Ensure page performance is not degraded",
        isPrimary: false,
      },
    ],
    "exp-2": [
      {
        id: "metric-2-primary",
        experimentId: "exp-2",
        name: "Premium Tier Selection Rate",
        type: "conversion",
        description: "Percentage of users selecting premium tier",
        isPrimary: true,
        expectedEffect: 15,
        minimumDetectableEffect: 10,
      },
      {
        id: "metric-2-secondary",
        experimentId: "exp-2",
        name: "Time on Pricing Page",
        type: "engagement",
        description: "Average time spent on pricing page",
        isPrimary: false,
      },
    ],
  }

  return metricSets[experimentId] || []
}

export function generateMockResults(experimentId: string): ExperimentResult[] {
  if (experimentId === "exp-1") {
    return [
      {
        experimentId: "exp-1",
        variantId: "var-1-control",
        variantName: "Blue Button (Control)",
        metricId: "metric-1-primary",
        metricName: "Checkout Conversion Rate",
        sampleSize: 4823,
        mean: 0.124,
        variance: 0.0015,
        standardError: 0.0056,
        confidenceInterval: [0.113, 0.135],
        pValue: 1.0,
        isStatisticallySignificant: false,
        relativeUplift: 0,
        absoluteUplift: 0,
      },
      {
        experimentId: "exp-1",
        variantId: "var-1-treatment",
        variantName: "Green Button",
        metricId: "metric-1-primary",
        metricName: "Checkout Conversion Rate",
        sampleSize: 4891,
        mean: 0.138,
        variance: 0.0016,
        standardError: 0.0057,
        confidenceInterval: [0.127, 0.149],
        pValue: 0.023,
        isStatisticallySignificant: true,
        relativeUplift: 11.29,
        absoluteUplift: 0.014,
      },
    ]
  }

  return []
}
