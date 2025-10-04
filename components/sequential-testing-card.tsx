"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import type { SequentialTestResult } from "@/lib/sequential-testing"

interface SequentialTestingCardProps {
  result: SequentialTestResult
  informationFraction: number
  onStopExperiment?: () => void
}

export function SequentialTestingCard({ result, informationFraction, onStopExperiment }: SequentialTestingCardProps) {
  const recommendationConfig = {
    stop_winner: {
      icon: CheckCircle2,
      color: "text-chart-2",
      bgColor: "bg-chart-2",
      label: "Winner Detected",
    },
    stop_no_effect: {
      icon: XCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      label: "No Effect",
    },
    continue: {
      icon: Clock,
      color: "text-chart-1",
      bgColor: "bg-chart-1",
      label: "Continue",
    },
  }

  const config = recommendationConfig[result.recommendation]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequential Testing</CardTitle>
        <CardDescription>Early stopping analysis with alpha spending</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <div>
              <p className="text-sm text-muted-foreground">Recommendation</p>
              <p className="text-xl font-bold text-foreground">{config.label}</p>
            </div>
          </div>
          <Badge className={config.bgColor}>{result.shouldStop ? "Can Stop" : "Continue"}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Information Fraction</span>
            <span className="font-medium text-foreground">{(informationFraction * 100).toFixed(1)}%</span>
          </div>
          <Progress value={informationFraction * 100} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className="font-medium text-foreground">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <Progress value={result.confidence * 100} className="h-3" />
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-sm text-foreground">{result.reason}</p>
        </div>

        {result.shouldStop && onStopExperiment && (
          <Button onClick={onStopExperiment} className="w-full">
            {result.recommendation === "stop_winner" ? "Declare Winner & Stop" : "Stop Experiment"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
