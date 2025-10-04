// Randomization and assignment logic for A/B testing

import type { Variant, Exposure } from "./types"

// MurmurHash3 implementation for consistent hashing
function murmurhash3(key: string, seed = 0): number {
  let h = seed
  const len = key.length
  let i = 0

  while (i < len) {
    let k = key.charCodeAt(i) & 0xff
    if (i + 1 < len) k |= (key.charCodeAt(i + 1) & 0xff) << 8
    if (i + 2 < len) k |= (key.charCodeAt(i + 2) & 0xff) << 16
    if (i + 3 < len) k |= (key.charCodeAt(i + 3) & 0xff) << 24

    k = Math.imul(k, 0xcc9e2d51)
    k = (k << 15) | (k >>> 17)
    k = Math.imul(k, 0x1b873593)

    h ^= k
    h = (h << 13) | (h >>> 19)
    h = Math.imul(h, 5) + 0xe6546b64

    i += 4
  }

  h ^= len
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return h >>> 0
}

// Generate a hash value between 0 and 1
function hashToUnit(key: string, experimentId: string): number {
  const hash = murmurhash3(`${experimentId}:${key}`)
  return hash / 0xffffffff
}

// Assign user to variant using consistent hashing
export function assignVariant(userId: string, experimentId: string, variants: Variant[]): Variant | null {
  if (variants.length === 0) return null

  // Calculate cumulative distribution
  const cumulativeWeights: number[] = []
  let sum = 0
  for (const variant of variants) {
    sum += variant.trafficSplit
    cumulativeWeights.push(sum)
  }

  // Normalize to 0-1 range
  const normalizedWeights = cumulativeWeights.map((w) => w / sum)

  // Get hash value for this user
  const hashValue = hashToUnit(userId, experimentId)

  // Find which bucket the user falls into
  for (let i = 0; i < normalizedWeights.length; i++) {
    if (hashValue < normalizedWeights[i]) {
      return variants[i]
    }
  }

  // Fallback to last variant
  return variants[variants.length - 1]
}

// Check if user should be included in experiment based on traffic allocation
export function shouldIncludeInExperiment(userId: string, experimentId: string, trafficAllocation: number): boolean {
  if (trafficAllocation >= 100) return true
  if (trafficAllocation <= 0) return false

  const hashValue = hashToUnit(userId, `${experimentId}:traffic`)
  return hashValue < trafficAllocation / 100
}

// Create exposure record
export function createExposure(
  experimentId: string,
  variantId: string,
  userId: string,
  metadata?: Record<string, any>,
): Exposure {
  return {
    id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    experimentId,
    variantId,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  }
}

// Get or assign variant for a user (with caching)
const assignmentCache = new Map<string, string>()

export function getOrAssignVariant(
  userId: string,
  experimentId: string,
  variants: Variant[],
  trafficAllocation: number,
): Variant | null {
  const cacheKey = `${experimentId}:${userId}`

  // Check cache first
  if (assignmentCache.has(cacheKey)) {
    const variantId = assignmentCache.get(cacheKey)!
    return variants.find((v) => v.id === variantId) || null
  }

  // Check if user should be included
  if (!shouldIncludeInExperiment(userId, experimentId, trafficAllocation)) {
    return null
  }

  // Assign variant
  const variant = assignVariant(userId, experimentId, variants)
  if (variant) {
    assignmentCache.set(cacheKey, variant.id)
  }

  return variant
}

// Clear assignment cache (useful for testing)
export function clearAssignmentCache(): void {
  assignmentCache.clear()
}
