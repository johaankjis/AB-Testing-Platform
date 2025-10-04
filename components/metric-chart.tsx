"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import type { ExperimentResult } from "@/lib/types"

interface MetricChartProps {
  results: ExperimentResult[]
  metricName: string
  chartType?: "bar" | "line"
}

export function MetricChart({ results, metricName, chartType = "bar" }: MetricChartProps) {
  const chartData = results.map((result) => ({
    variant: result.variantName,
    mean: result.mean,
    lowerCI: result.confidenceInterval[0],
    upperCI: result.confidenceInterval[1],
  }))

  const chartConfig = {
    mean: {
      label: "Mean",
      color: "hsl(var(--chart-1))",
    },
    lowerCI: {
      label: "Lower CI",
      color: "hsl(var(--chart-3))",
    },
    upperCI: {
      label: "Upper CI",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{metricName}</CardTitle>
        <CardDescription>Mean values with 95% confidence intervals</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variant" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="mean" fill="var(--color-mean)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variant" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="mean" stroke="var(--color-mean)" strokeWidth={2} />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
