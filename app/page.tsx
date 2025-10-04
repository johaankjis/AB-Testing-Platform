"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ExperimentCard } from "@/components/experiment-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Experiment, ExperimentStatus } from "@/lib/types"
import { getExperiments, saveExperiment } from "@/lib/storage"
import { generateMockExperiments } from "@/lib/mock-data"

export default function HomePage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    let stored = getExperiments()
    if (stored.length === 0) {
      const mock = generateMockExperiments()
      mock.forEach(saveExperiment)
      stored = mock
    }
    setExperiments(stored)
  }, [])

  const filterExperiments = (status?: ExperimentStatus) => {
    if (!status) return experiments
    return experiments.filter((exp) => exp.status === status)
  }

  const tabs = [
    { value: "all", label: "All", count: experiments.length },
    { value: "running", label: "Running", count: filterExperiments("running").length },
    { value: "draft", label: "Draft", count: filterExperiments("draft").length },
    { value: "completed", label: "Completed", count: filterExperiments("completed").length },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-balance text-foreground">Experiments</h1>
          <p className="text-lg text-muted-foreground">Manage and monitor your A/B tests with statistical rigor</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.label}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {experiments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <p className="mb-4 text-muted-foreground">No experiments yet</p>
                <Button>Create your first experiment</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {experiments.map((exp) => (
                  <ExperimentCard key={exp.id} experiment={exp} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="running" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filterExperiments("running").map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filterExperiments("draft").map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filterExperiments("completed").map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
