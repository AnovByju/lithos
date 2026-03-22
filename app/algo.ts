/**
 * Lithos Recommendation Engine
 *
 * Signals (stored in localStorage):
 *   like    → +3 pts to type & author affinity
 *   save    → +5 pts (strongest signal)
 *   dislike → -4 pts, suppresses that type/author
 *   view    → +0.3 pts (passive engagement)
 *
 * Pool is re-ranked every N interactions using weighted scores.
 */

import type { LitItem, LitType } from "./literature-data"

const ALGO_KEY = "lithos_algo"

export interface Signal {
  like: number
  dislike: number
  save: number
  view: number
}

export interface AlgoState {
  typeWeights: Record<LitType, number>
  authorWeights: Record<string, number>
  seenIds: string[]          // recently shown, avoid immediate repeats
  dislikedIds: string[]      // never show again
  totalInteractions: number
}

const DEFAULT_WEIGHT = 1.0
const MAX_SEEN = 40          // rolling window of recent items

// ── Persist ────────────────────────────────────────────────────────────────────
export function loadAlgo(): AlgoState {
  if (typeof window === "undefined") return emptyState()
  try {
    const raw = localStorage.getItem(ALGO_KEY)
    if (!raw) return emptyState()
    return JSON.parse(raw) as AlgoState
  } catch {
    return emptyState()
  }
}

export function saveAlgo(state: AlgoState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ALGO_KEY, JSON.stringify(state))
  } catch {}
}

function emptyState(): AlgoState {
  return {
    typeWeights: {} as Record<LitType, number>,
    authorWeights: {},
    seenIds: [],
    dislikedIds: [],
    totalInteractions: 0,
  }
}

// ── Apply a signal ─────────────────────────────────────────────────────────────
export function applySignal(
  state: AlgoState,
  item: LitItem,
  signal: keyof Signal
): AlgoState {
  const next = structuredClone(state) as AlgoState
  const typeKey = item.type as LitType

  const delta: Record<keyof Signal, number> = {
    like:    3,
    save:    5,
    dislike: -4,
    view:    0.3,
  }

  const d = delta[signal]

  // Update type weight (floor at 0.05 so nothing is permanently zero except dislike)
  const tOld = next.typeWeights[typeKey] ?? DEFAULT_WEIGHT
  next.typeWeights[typeKey] = Math.max(0.05, tOld + d)

  // Update author weight
  const aOld = next.authorWeights[item.author] ?? DEFAULT_WEIGHT
  next.authorWeights[item.author] = Math.max(0.05, aOld + d)

  // Track disliked items — never show again
  if (signal === "dislike" && !next.dislikedIds.includes(item.id)) {
    next.dislikedIds.push(item.id)
  }

  // Track seen
  if (signal === "view") {
    next.seenIds = [item.id, ...next.seenIds].slice(0, MAX_SEEN)
  }

  next.totalInteractions++
  return next
}

// ── Score an item ──────────────────────────────────────────────────────────────
function scoreItem(item: LitItem, state: AlgoState): number {
  const typeW  = state.typeWeights[item.type as LitType]   ?? DEFAULT_WEIGHT
  const authorW = state.authorWeights[item.author]          ?? DEFAULT_WEIGHT

  // Recency penalty — recently seen items score lower
  const recentIdx = state.seenIds.indexOf(item.id)
  const recencyPenalty = recentIdx === -1 ? 1.0 : Math.max(0.1, 1 - (MAX_SEEN - recentIdx) / MAX_SEEN)

  // Small random noise so identical scores shuffle naturally
  const noise = 0.9 + Math.random() * 0.2

  return typeW * authorW * recencyPenalty * noise
}

// ── Rank a pool of items ───────────────────────────────────────────────────────
export function rankPool(items: LitItem[], state: AlgoState): LitItem[] {
  // Filter out permanently disliked items
  const filtered = items.filter(i => !state.dislikedIds.includes(i.id))

  // If algo has no data yet (fresh user), return shuffled
  if (state.totalInteractions < 3) {
    return filtered.sort(() => Math.random() - 0.5)
  }

  return [...filtered].sort((a, b) => scoreItem(b, state) - scoreItem(a, state))
}

// ── Build a ranked infinite pool ───────────────────────────────────────────────
export function buildRankedPool(
  allItems: LitItem[],
  filter: LitType | "all",
  state: AlgoState,
  copies = 4
): LitItem[] {
  const base = filter === "all" ? allItems : allItems.filter(i => i.type === filter)

  // Build multiple copies, each re-ranked with slight noise for variety
  const pool: LitItem[] = []
  for (let i = 0; i < copies; i++) {
    pool.push(...rankPool(base, state))
  }
  return pool
}
