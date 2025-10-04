"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Variant } from "@/lib/types"
import { getOrAssignVariant, createExposure } from "@/lib/randomization"
import { trackExposure, trackMetricValue, generateMockExposures, generateMockMetricValues } from "@/lib/tracking"
import { Play, Users } from "lucide-react"

interface ExperimentSimulatorProps {
  experimentId: string
  variants: Variant[]
  trafficAllocation: number
}

export function ExperimentSimulator({ experimentId, variants, trafficAllocation }: ExperimentSimulatorProps) {
  const [userId, setUserId] = useState("")
  const [assignedVariant, setAssignedVariant] = useState<Variant | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAssignment = () => {
    if (!userId) return

    const variant = getOrAssignVariant(userId, experimentId, variants, trafficAllocation)
    setAssignedVariant(variant)

    if (variant) {
      const exposure = createExposure(experimentId, variant.id, userId)
      trackExposure(exposure)

      // Simulate metric value (conversion)
      const conversionRate = variant.isControl ? 0.12 : 0.14
      const converted = Math.random() < conversionRate

      if (converted) {
        trackMetricValue({
          id: `metric-${Date.now()}`,
          experimentId,
          variantId: variant.id,
          metricId: "conversion",
          userId,
          value: 1,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  const handleGenerateMockData = () => {
    setIsGenerating(true)

    // Generate 5000 exposures per variant
    const variantIds = variants.map((v) => v.id)
    generateMockExposures(experimentId, variantIds, 5000)

    // Generate metric values for each variant
    for (const variant of variants) {
      const userIds = Array.from({ length: 2500 }, (_, i) => `user-${variant.id}-${i}`)
      const conversionRate = variant.isControl ? 0.124 : 0.138
      generateMockMetricValues(experimentId, "conversion", variant.id, userIds, conversionRate, 0.0015)
    }

    setTimeout(() => {
      setIsGenerating(false)
      alert("Mock data generated! Refresh the page to see results.")
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Assignment</CardTitle>
          <CardDescription>Simulate user assignment to variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter a user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <Button onClick={handleAssignment} disabled={!userId} className="w-full gap-2">
            <Play className="h-4 w-4" />
            Assign Variant
          </Button>

          {assignedVariant && (
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm text-muted-foreground">Assigned to:</p>
              <p className="text-lg font-bold text-foreground">{assignedVariant.name}</p>
            </div>
          )}

          {assignedVariant === null && userId && (
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm text-muted-foreground">User excluded from experiment (traffic allocation)</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Mock Data</CardTitle>
          <CardDescription>Create sample exposures and metrics for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateMockData}
            disabled={isGenerating}
            className="w-full gap-2 bg-transparent"
            variant="outline"
          >
            <Users className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate 5000 Users"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
