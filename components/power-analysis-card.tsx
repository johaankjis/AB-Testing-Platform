"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { calculatePowerAnalysis } from "@/lib/statistics"
import { Calculator } from "lucide-react"

export function PowerAnalysisCard() {
  const [params, setParams] = useState({
    baselineRate: 0.12,
    mde: 5,
    alpha: 0.05,
    power: 0.8,
  })

  const [result, setResult] = useState<{
    requiredSampleSizePerVariant: number
    totalSampleSize: number
    estimatedDuration: number
  } | null>(null)

  const handleCalculate = () => {
    const analysis = calculatePowerAnalysis({
      baselineRate: params.baselineRate,
      minimumDetectableEffect: params.mde,
      alpha: params.alpha,
      power: params.power,
    })
    setResult(analysis)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Power Analysis Calculator</CardTitle>
        <CardDescription>Calculate required sample size for your experiment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="baselineRate">Baseline Conversion Rate</Label>
            <Input
              id="baselineRate"
              type="number"
              step="0.01"
              value={params.baselineRate}
              onChange={(e) => setParams({ ...params, baselineRate: Number.parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mde">Minimum Detectable Effect (%)</Label>
            <Input
              id="mde"
              type="number"
              step="1"
              value={params.mde}
              onChange={(e) => setParams({ ...params, mde: Number.parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alpha">Significance Level (α)</Label>
            <Input
              id="alpha"
              type="number"
              step="0.01"
              value={params.alpha}
              onChange={(e) => setParams({ ...params, alpha: Number.parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="power">Statistical Power</Label>
            <Input
              id="power"
              type="number"
              step="0.01"
              value={params.power}
              onChange={(e) => setParams({ ...params, power: Number.parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          Calculate Sample Size
        </Button>

        {result && (
          <div className="space-y-3 rounded-lg border border-border bg-muted p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Per Variant:</span>
              <span className="font-bold text-foreground">
                {result.requiredSampleSizePerVariant.toLocaleString()} users
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Required:</span>
              <span className="font-bold text-foreground">{result.totalSampleSize.toLocaleString()} users</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estimated Duration:</span>
              <span className="font-bold text-foreground">{result.estimatedDuration} days</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
