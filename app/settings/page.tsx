"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground">Configure platform preferences and integrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Coming in the next phase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will allow configuration of default settings and integrations
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
