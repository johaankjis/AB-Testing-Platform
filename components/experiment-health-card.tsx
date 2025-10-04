"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

interface ExperimentHealthCardProps {
  healthScore: number
  issues: string[]
  sampleSizeProgress: number
}

export function ExperimentHealthCard({ healthScore, issues, sampleSizeProgress }: ExperimentHealthCardProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Healthy", color: "bg-chart-2", icon: CheckCircle2 }
    if (score >= 60) return { label: "Warning", color: "bg-chart-4", icon: AlertCircle }
    return { label: "Critical", color: "bg-destructive", icon: AlertTriangle }
  }

  const status = getHealthStatus(healthScore)
  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiment Health</CardTitle>
        <CardDescription>Overall health and data quality indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-8 w-8" style={{ color: `hsl(var(--chart-2))` }} />
            <div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-2xl font-bold text-foreground">{healthScore}/100</p>
            </div>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Health</span>
            <span className="font-medium text-foreground">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-3" />
        </div>

        {issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Issues Detected</p>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 rounded-lg border border-border bg-muted p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <p className="text-sm text-foreground">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
            <p className="text-sm text-foreground">No issues detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
