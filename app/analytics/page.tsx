"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Analytics</h1>
          <p className="text-lg text-muted-foreground">Cross-experiment insights and platform metrics</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Coming in the next phase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This section will show aggregate metrics across all experiments</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
