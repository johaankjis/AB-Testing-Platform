"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExperimentSimulator } from "@/components/experiment-simulator"
import { ResultsTable } from "@/components/results-table"
import { MetricChart } from "@/components/metric-chart"
import { UpliftChart } from "@/components/uplift-chart"
import { SampleSizeProgress } from "@/components/sample-size-progress"
import { ExperimentHealthCard } from "@/components/experiment-health-card"
import { BayesianResultsCard } from "@/components/bayesian-results-card"
import { PowerAnalysisCard } from "@/components/power-analysis-card"
import { GuardrailsMonitor } from "@/components/guardrails-monitor"
import { MonitoringDashboard } from "@/components/monitoring-dashboard"
import { SequentialTestingCard } from "@/components/sequential-testing-card"
import type { Experiment, Variant, Metric } from "@/lib/types"
import { getExperiments, getVariants, getMetrics, saveExperiment, saveVariant, saveMetric } from "@/lib/storage"
import { generateMockVariants, generateMockMetrics } from "@/lib/mock-data"
import { getUserCountByVariant, detectSRM } from "@/lib/tracking"
import { calculateExperimentResults, generateExperimentSummary } from "@/lib/analysis"
import { performBayesianAnalysis } from "@/lib/bayesian"
import { checkGuardrails, recommendAction, type GuardrailConfig } from "@/lib/guardrails"
import { getActiveAlerts, calculateExperimentVelocity } from "@/lib/monitoring"
import { performSequentialTest } from "@/lib/sequential-testing"
import { ArrowLeft, Play, Pause, Archive, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ExperimentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const experimentId = params.id as string

  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [userCounts, setUserCounts] = useState<Record<string, number>>({})
  const [srmCheck, setSrmCheck] = useState<{ hasSRM: boolean; pValue: number } | null>(null)

  useEffect(() => {
    const experiments = getExperiments()
    const exp = experiments.find((e) => e.id === experimentId)
    if (exp) {
      setExperiment(exp)

      let storedVariants = getVariants(experimentId)
      if (storedVariants.length === 0) {
        const mockVariants = generateMockVariants(experimentId)
        mockVariants.forEach(saveVariant)
        storedVariants = mockVariants
      }
      setVariants(storedVariants)

      let storedMetrics = getMetrics(experimentId)
      if (storedMetrics.length === 0) {
        const mockMetrics = generateMockMetrics(experimentId)
        mockMetrics.forEach(saveMetric)
        storedMetrics = mockMetrics
      }
      setMetrics(storedMetrics)

      const counts = getUserCountByVariant(experimentId)
      setUserCounts(counts)

      if (storedVariants.length > 0) {
        const expectedRatios: Record<string, number> = {}
        storedVariants.forEach((v) => {
          expectedRatios[v.id] = v.trafficSplit / 100
        })
        const srm = detectSRM(experimentId, expectedRatios)
        setSrmCheck({ hasSRM: srm.hasSRM, pValue: srm.pValue })
      }
    }
  }, [experimentId])

  const handleStatusChange = (newStatus: Experiment["status"]) => {
    if (!experiment) return

    const updated = {
      ...experiment,
      status: newStatus,
      startDate: newStatus === "running" && !experiment.startDate ? new Date().toISOString() : experiment.startDate,
      endDate: newStatus === "completed" ? new Date().toISOString() : experiment.endDate,
      updatedAt: new Date().toISOString(),
    }

    saveExperiment(updated)
    setExperiment(updated)
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    running: "bg-chart-2 text-foreground",
    paused: "bg-chart-4 text-foreground",
    completed: "bg-chart-1 text-foreground",
    archived: "bg-muted text-muted-foreground",
  }

  const totalUsers = Object.values(userCounts).reduce((sum, count) => sum + count, 0)
  const primaryMetric = metrics.find((m) => m.isPrimary)
  const summary = generateExperimentSummary(experimentId, experiment.targetSampleSize, variants, metrics)

  const primaryResults = primaryMetric ? calculateExperimentResults(experimentId, primaryMetric, variants) : []

  const bayesianResults =
    primaryMetric && totalUsers > 0
      ? performBayesianAnalysis(
          experimentId,
          primaryMetric.id,
          variants,
          variants.map((v) => ({
            variantId: v.id,
            successes: Math.floor((userCounts[v.id] || 0) * 0.13),
            trials: userCounts[v.id] || 0,
          })),
        )
      : []

  const guardrailMetrics = metrics.filter((m) => !m.isPrimary)
  const guardrailConfigs: GuardrailConfig[] = guardrailMetrics.map((m) => ({
    metricId: m.id,
    thresholdType: "lower",
    threshold: 0.1,
    severity: "warning",
  }))
  const guardrailViolations = checkGuardrails(experimentId, guardrailMetrics, guardrailConfigs, variants)
  const guardrailRecommendation = recommendAction(guardrailViolations)

  const activeAlerts = getActiveAlerts(experiment, metrics)
  const velocity = calculateExperimentVelocity(experimentId)

  const bestTreatmentResult = primaryResults.filter((r) => !r.variantName.toLowerCase().includes("control"))[0]
  const sequentialTestResult =
    bestTreatmentResult && totalUsers > 0
      ? performSequentialTest(totalUsers, experiment.targetSampleSize, bestTreatmentResult)
      : null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Experiments
          </Button>
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-4xl font-bold text-foreground">{experiment.name}</h1>
              <Badge className={statusColors[experiment.status]}>{experiment.status}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{experiment.description}</p>
          </div>

          <div className="flex gap-2">
            {experiment.status === "draft" && (
              <Button onClick={() => handleStatusChange("running")} className="gap-2">
                <Play className="h-4 w-4" />
                Start Experiment
              </Button>
            )}
            {experiment.status === "running" && (
              <>
                <Button onClick={() => handleStatusChange("paused")} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={() => handleStatusChange("completed")} className="gap-2">
                  Complete
                </Button>
              </>
            )}
            {experiment.status === "paused" && (
              <Button onClick={() => handleStatusChange("running")} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            {experiment.status === "completed" && (
              <Button onClick={() => handleStatusChange("archived")} variant="outline" className="gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        </div>

        {srmCheck?.hasSRM && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Sample Ratio Mismatch Detected</p>
                <p className="text-sm text-muted-foreground">
                  The observed traffic split differs significantly from expected (p = {srmCheck.pValue.toFixed(4)}).
                  Check your randomization implementation.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="bayesian">Bayesian</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
            <TabsTrigger value="sequential">Sequential</TabsTrigger>
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hypothesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{experiment.hypothesis}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experiment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium text-foreground">{experiment.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Randomization Unit</span>
                    <span className="font-medium text-foreground">{experiment.randomizationUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Sample Size</span>
                    <span className="font-medium text-foreground">{experiment.targetSampleSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Traffic Allocation</span>
                    <span className="font-medium text-foreground">{experiment.trafficAllocation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Sample Size</span>
                    <span className="font-medium text-foreground">{totalUsers.toLocaleString()}</span>
                  </div>
                  {experiment.startDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium text-foreground">
                        {new Date(experiment.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ExperimentHealthCard
                healthScore={summary.healthScore}
                issues={summary.healthIssues}
                sampleSizeProgress={summary.sampleSizeProgress}
              />
              <SampleSizeProgress
                currentSize={totalUsers}
                targetSize={experiment.targetSampleSize}
                variantCounts={userCounts}
              />
            </div>

            <PowerAnalysisCard />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {primaryResults.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <MetricChart results={primaryResults} metricName={primaryMetric?.name || "Primary Metric"} />
                  <UpliftChart results={primaryResults} metricName={primaryMetric?.name || "Primary Metric"} />
                </div>

                <ResultsTable results={primaryResults} metricName={primaryMetric?.name || "Primary Metric"} />
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Results Yet</CardTitle>
                  <CardDescription>Generate mock data using the simulator to see results</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bayesian" className="space-y-6">
            {bayesianResults.length > 0 ? (
              <BayesianResultsCard results={bayesianResults} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Bayesian Analysis</CardTitle>
                  <CardDescription>Generate data to see Bayesian analysis results</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringDashboard alerts={activeAlerts} velocity={velocity} />
          </TabsContent>

          <TabsContent value="guardrails">
            <GuardrailsMonitor violations={guardrailViolations} recommendedAction={guardrailRecommendation} />
          </TabsContent>

          <TabsContent value="sequential">
            {sequentialTestResult ? (
              <SequentialTestingCard
                result={sequentialTestResult}
                informationFraction={totalUsers / experiment.targetSampleSize}
                onStopExperiment={() => handleStatusChange("completed")}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sequential Testing</CardTitle>
                  <CardDescription>Generate data to see sequential testing analysis</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="simulator">
            <ExperimentSimulator
              experimentId={experimentId}
              variants={variants}
              trafficAllocation={experiment.trafficAllocation}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
