"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Experiment, RandomizationUnit } from "@/lib/types"
import { saveExperiment } from "@/lib/storage"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewExperimentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hypothesis: "",
    owner: "",
    targetSampleSize: 10000,
    randomizationUnit: "user_id" as RandomizationUnit,
    trafficAllocation: 100,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const experiment: Experiment = {
      id: `exp-${Date.now()}`,
      ...formData,
      status: "draft",
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveExperiment(experiment)
    router.push(`/experiments/${experiment.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Experiments
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Create New Experiment</h1>
          <p className="text-lg text-muted-foreground">Set up a new A/B test with proper experimental design</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the core details of your experiment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Experiment Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Checkout Button Color Test"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're testing and why"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  placeholder="e.g., Changing the button color from blue to green will increase conversion by 5%"
                  value={formData.hypothesis}
                  onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                  required
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Experiment Owner</Label>
                <Input
                  id="owner"
                  placeholder="Your name"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experimental Design</CardTitle>
              <CardDescription>Configure randomization and sample size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="randomizationUnit">Randomization Unit</Label>
                <Select
                  value={formData.randomizationUnit}
                  onValueChange={(value) => setFormData({ ...formData, randomizationUnit: value as RandomizationUnit })}
                >
                  <SelectTrigger id="randomizationUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_id">User ID</SelectItem>
                    <SelectItem value="session_id">Session ID</SelectItem>
                    <SelectItem value="device_id">Device ID</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The unit by which users are randomly assigned to variants
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetSampleSize">Target Sample Size</Label>
                <Input
                  id="targetSampleSize"
                  type="number"
                  min="100"
                  value={formData.targetSampleSize}
                  onChange={(e) => setFormData({ ...formData, targetSampleSize: Number.parseInt(e.target.value) })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Total number of users needed for statistical significance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trafficAllocation">Traffic Allocation (%)</Label>
                <Input
                  id="trafficAllocation"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.trafficAllocation}
                  onChange={(e) => setFormData({ ...formData, trafficAllocation: Number.parseInt(e.target.value) })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Percentage of total traffic to include in the experiment
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Create Experiment</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
