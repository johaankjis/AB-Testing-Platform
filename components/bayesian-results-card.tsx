"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { BayesianResult } from "@/lib/bayesian"
import { Trophy, TrendingUp } from "lucide-react"

interface BayesianResultsCardProps {
  results: BayesianResult[]
}

export function BayesianResultsCard({ results }: BayesianResultsCardProps) {
  const bestVariant = results.reduce((best, current) => {
    if (current.probabilityToBeBest > best.probabilityToBeBest) return current
    return best
  }, results[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bayesian Analysis</CardTitle>
        <CardDescription>Probability-based decision making</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {bestVariant && (
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-chart-2" />
                <span className="font-semibold text-foreground">Best Performing Variant</span>
              </div>
              <Badge className="bg-chart-2 text-foreground">{bestVariant.variantName}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Probability to be Best</span>
                <span className="font-bold text-foreground">{(bestVariant.probabilityToBeBest * 100).toFixed(1)}%</span>
              </div>
              <Progress value={bestVariant.probabilityToBeBest * 100} className="h-2" />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.variantId} className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{result.variantName}</h4>
                {result.variantId === bestVariant?.variantId && (
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Leader
                  </Badge>
                )}
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posterior Mean</span>
                  <span className="font-mono font-medium text-foreground">{result.posteriorMean.toFixed(4)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">95% Credible Interval</span>
                  <span className="font-mono text-muted-foreground">
                    [{result.credibleInterval[0].toFixed(4)}, {result.credibleInterval[1].toFixed(4)}]
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Probability to be Best</span>
                  <span className="font-medium text-foreground">{(result.probabilityToBeBest * 100).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Loss</span>
                  <span className="font-mono text-muted-foreground">{result.expectedLoss.toFixed(4)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="text-muted-foreground">{(result.probabilityToBeBest * 100).toFixed(0)}%</span>
                </div>
                <Progress value={result.probabilityToBeBest * 100} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
