import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ExperimentResult } from "@/lib/types"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ResultsTableProps {
  results: ExperimentResult[]
  metricName: string
}

export function ResultsTable({ results, metricName }: ResultsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead className="text-right">Sample Size</TableHead>
            <TableHead className="text-right">Mean</TableHead>
            <TableHead className="text-right">95% CI</TableHead>
            <TableHead className="text-right">Uplift</TableHead>
            <TableHead className="text-right">P-Value</TableHead>
            <TableHead>Significance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.variantId}>
              <TableCell className="font-medium text-foreground">{result.variantName}</TableCell>
              <TableCell className="text-right text-foreground">{result.sampleSize.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono text-foreground">{result.mean.toFixed(4)}</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                [{result.confidenceInterval[0].toFixed(4)}, {result.confidenceInterval[1].toFixed(4)}]
              </TableCell>
              <TableCell className="text-right">
                {result.relativeUplift !== 0 && (
                  <div className="flex items-center justify-end gap-1">
                    {result.relativeUplift > 0 ? (
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`font-mono ${result.relativeUplift > 0 ? "text-chart-2" : "text-destructive"}`}>
                      {result.relativeUplift > 0 ? "+" : ""}
                      {result.relativeUplift.toFixed(2)}%
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-foreground">{result.pValue.toFixed(4)}</TableCell>
              <TableCell>
                {result.isStatisticallySignificant ? (
                  <Badge className="bg-chart-2 text-foreground">Significant</Badge>
                ) : (
                  <Badge variant="outline">Not Significant</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
