"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react"
import type { GuardrailCheck } from "@/lib/guardrails"

interface GuardrailsMonitorProps {
  violations: GuardrailCheck[]
  recommendedAction: {
    action: "continue" | "pause" | "stop"
    reason: string
  }
}

export function GuardrailsMonitor({ violations, recommendedAction }: GuardrailsMonitorProps) {
  const criticalViolations = violations.filter((v) => v.severity === "critical")
  const warningViolations = violations.filter((v) => v.severity === "warning")

  const actionColors = {
    continue: "bg-chart-2 text-foreground",
    pause: "bg-chart-4 text-foreground",
    stop: "bg-destructive text-destructive-foreground",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Guardrail Metrics</CardTitle>
            <CardDescription>Monitor critical business metrics</CardDescription>
          </div>
          <Badge className={actionColors[recommendedAction.action]}>{recommendedAction.action.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {violations.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
            <ShieldCheck className="h-6 w-6 text-chart-2" />
            <div>
              <p className="font-medium text-foreground">All Guardrails Passing</p>
              <p className="text-sm text-muted-foreground">No violations detected</p>
            </div>
          </div>
        ) : (
          <>
            <Alert variant={criticalViolations.length > 0 ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{recommendedAction.reason}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              {criticalViolations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    Critical Violations
                  </h4>
                  {criticalViolations.map((violation, index) => (
                    <div key={index} className="rounded-lg border border-destructive bg-destructive/10 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-foreground">{violation.metricName}</span>
                        <Badge variant="destructive">{violation.variantName}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current: {violation.currentValue.toFixed(4)} | Threshold: {violation.threshold.toFixed(4)} (
                        {violation.thresholdType})
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {warningViolations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-chart-4">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h4>
                  {warningViolations.map((violation, index) => (
                    <div key={index} className="rounded-lg border border-border bg-muted p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-foreground">{violation.metricName}</span>
                        <Badge variant="outline">{violation.variantName}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current: {violation.currentValue.toFixed(4)} | Threshold: {violation.threshold.toFixed(4)} (
                        {violation.thresholdType})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
