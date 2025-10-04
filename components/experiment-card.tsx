import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Experiment } from "@/lib/types"
import { Calendar, User, TrendingUp } from "lucide-react"

interface ExperimentCardProps {
  experiment: Experiment
}

export function ExperimentCard({ experiment }: ExperimentCardProps) {
  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    running: "bg-chart-2 text-foreground",
    paused: "bg-chart-4 text-foreground",
    completed: "bg-chart-1 text-foreground",
    archived: "bg-muted text-muted-foreground",
  }

  return (
    <Link href={`/experiments/${experiment.id}`}>
      <Card className="transition-colors hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{experiment.name}</CardTitle>
              <CardDescription className="line-clamp-2">{experiment.description}</CardDescription>
            </div>
            <Badge className={statusColors[experiment.status]}>{experiment.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{experiment.owner}</span>
            </div>
            {experiment.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Started {new Date(experiment.startDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Target: {experiment.targetSampleSize.toLocaleString()} users</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
