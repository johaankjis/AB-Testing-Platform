"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertCircle, Info, TrendingUp } from "lucide-react"
import type { MonitoringAlert } from "@/lib/monitoring"

interface MonitoringDashboardProps {
  alerts: MonitoringAlert[]
  velocity: {
    usersPerDay: number
    usersPerHour: number
  }
}

export function MonitoringDashboard({ alerts, velocity }: MonitoringDashboardProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === "critical")
  const warningAlerts = alerts.filter((a) => a.severity === "warning")
  const infoAlerts = alerts.filter((a) => a.severity === "info")

  const severityIcons = {
    critical: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }

  const severityColors = {
    critical: "text-destructive",
    warning: "text-chart-4",
    info: "text-chart-1",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Monitoring</CardTitle>
          <CardDescription>Live experiment health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
              <Activity className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-sm text-muted-foreground">Users per Day</p>
                <p className="text-2xl font-bold text-foreground">{velocity.usersPerDay.toFixed(0)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
              <TrendingUp className="h-8 w-8 text-chart-2" />
              <div>
                <p className="text-sm text-muted-foreground">Users per Hour</p>
                <p className="text-2xl font-bold text-foreground">{velocity.usersPerHour.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Alerts</CardTitle>
              <div className="flex gap-2">
                {criticalAlerts.length > 0 && <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>}
                {warningAlerts.length > 0 && <Badge variant="outline">{warningAlerts.length} Warning</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity]
              return (
                <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : "default"}>
                  <Icon className={`h-4 w-4 ${severityColors[alert.severity]}`} />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <span>{alert.message}</span>
                      <Badge variant="outline" className="ml-2">
                        {alert.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
