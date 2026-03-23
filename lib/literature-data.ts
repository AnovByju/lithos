export type LitType = "poem" | "quote" | "story" | "letter" | "diary" | "essay" | "philosophy" | "summary"

export interface LitItem {
  id: string
  author: string
  era: string
  type: LitType
  title: string
  content: string
  source: string
  sourceUrl: string
}

export const TYPE_COLORS: Record<LitType, string> = {
  poem:       "#bf5af2",
  quote:      "#0a84ff",
  story:      "#ff453a",
  letter:     "#ffd60a",
  diary:      "#30d158",
  essay:      "#ff9f0a",
  philosophy: "#5ac8fa",
  summary:    "#ff6b35",
}

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
