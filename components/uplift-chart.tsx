"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Cell } from "recharts"
import type { ExperimentResult } from "@/lib/types"

interface UpliftChartProps {
  results: ExperimentResult[]
  metricName: string
}

export function UpliftChart({ results, metricName }: UpliftChartProps) {
  const chartData = results
    .filter((r) => r.relativeUplift !== 0)
    .map((result) => ({
      variant: result.variantName,
      uplift: result.relativeUplift,
      isSignificant: result.isStatisticallySignificant,
    }))

  const chartConfig = {
    uplift: {
      label: "Relative Uplift (%)",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relative Uplift</CardTitle>
        <CardDescription>Percentage change vs control for {metricName}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variant" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="uplift" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isSignificant
                      ? entry.uplift > 0
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--destructive))"
                      : "hsl(var(--muted))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
