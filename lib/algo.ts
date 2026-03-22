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
  seenIds: string[]
  dislikedIds: string[]
  totalInteractions: number
}

const DEFAULT_WEIGHT = 1.0
const MAX_SEEN = 40

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

export function applySignal(
  state: AlgoState,
  item: LitItem,
  signal: keyof Signal
): AlgoState {
  const next = JSON.parse(JSON.stringify(state)) as AlgoState
  const typeKey = item.type as LitType
  const delta: Record<keyof Signal, number> = {
    like: 3, save: 5, dislike: -4, view: 0.3,
  }
  const d = delta[signal]
  const tOld = next.typeWeights[typeKey] ?? DEFAULT_WEIGHT
  next.typeWeights[typeKey] = Math.max(0.05, tOld + d)
  const aOld = next.authorWeights[item.author] ?? DEFAULT_WEIGHT
  next.authorWeights[item.author] = Math.max(0.05, aOld + d)
  if (signal === "dislike" && !next.dislikedIds.includes(item.id)) {
    next.dislikedIds.push(item.id)
  }
  if (signal === "view") {
    next.seenIds = [item.id, ...next.seenIds].slice(0, MAX_SEEN)
  }
  next.totalInteractions++
  return next
}

function scoreItem(item: LitItem, state: AlgoState): number {
  const typeW = state.typeWeights[item.type as LitType] ?? DEFAULT_WEIGHT
  const authorW = state.authorWeights[item.author] ?? DEFAULT_WEIGHT
  const recentIdx = state.seenIds.indexOf(item.id)
  const recencyPenalty = recentIdx === -1 ? 1.0 : Math.max(0.1, 1 - (MAX_SEEN - recentIdx) / MAX_SEEN)
  const noise = 0.9 + Math.random() * 0.2
  return typeW * authorW * recencyPenalty * noise
}

export function rankPool(items: LitItem[], state: AlgoState): LitItem[] {
  const filtered = items.filter(i => !state.dislikedIds.includes(i.id))
  if (state.totalInteractions < 3) {
    return filtered.sort(() => Math.random() - 0.5)
  }
  return [...filtered].sort((a, b) => scoreItem(b, state) - scoreItem(a, state))
}

export function buildRankedPool(
  allItems: LitItem[],
  filter: LitType | "all",
  state: AlgoState,
  copies = 4
): LitItem[] {
  const base = filter === "all" ? allItems : allItems.filter(i => i.type === filter)
  const pool: LitItem[] = []
  for (let i = 0; i < copies; i++) {
    pool.push(...rankPool(base, state))
  }
  return pool
}
