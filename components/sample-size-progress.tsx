"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Target, TrendingUp } from "lucide-react"

interface SampleSizeProgressProps {
  currentSize: number
  targetSize: number
  variantCounts: Record<string, number>
}

export function SampleSizeProgress({ currentSize, targetSize, variantCounts }: SampleSizeProgressProps) {
  const progress = Math.min((currentSize / targetSize) * 100, 100)
  const daysElapsed = 7 // Mock data
  const estimatedDaysRemaining = Math.max(0, Math.ceil((targetSize - currentSize) / (currentSize / daysElapsed)))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Size Progress</CardTitle>
        <CardDescription>Track progress toward target sample size</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-foreground">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{currentSize.toLocaleString()} users</span>
            <span className="text-muted-foreground">{targetSize.toLocaleString()} target</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
            <Users className="h-8 w-8 text-chart-1" />
            <div>
              <p className="text-sm text-muted-foreground">Current Size</p>
              <p className="text-xl font-bold text-foreground">{currentSize.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
            <Target className="h-8 w-8 text-chart-2" />
            <div>
              <p className="text-sm text-muted-foreground">Target Size</p>
              <p className="text-xl font-bold text-foreground">{targetSize.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
            <TrendingUp className="h-8 w-8 text-chart-3" />
            <div>
              <p className="text-sm text-muted-foreground">Est. Days Left</p>
              <p className="text-xl font-bold text-foreground">{estimatedDaysRemaining}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Users per Variant</p>
          {Object.entries(variantCounts).map(([variantId, count]) => (
            <div key={variantId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Variant {variantId}</span>
                <span className="font-medium text-foreground">{count.toLocaleString()}</span>
              </div>
              <Progress value={(count / currentSize) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
