"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Bookmark, X, ChevronUp, ChevronDown, Filter, BookOpen } from "lucide-react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { LITERATURE, shuffled, TYPE_COLORS, type LitItem, type LitType } from "@/lib/literature-data"
import { LitCard } from "@/components/lit-card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const ShaderAnimation = dynamic(
  () => import("@/components/ui/shader-animation").then(m => ({ default: m.ShaderAnimation })),
  { ssr: false }
)

const ALL_TYPES: LitType[] = ["poem", "quote", "story", "letter", "diary", "essay", "philosophy"]
const STORAGE_KEY = "lithos_saved_items"

function buildPool(filter: LitType | "all"): LitItem[] {
  const base = filter === "all" ? LITERATURE : LITERATURE.filter(i => i.type === filter)
  return [...shuffled(base), ...shuffled(base), ...shuffled(base), ...shuffled(base)]
}

function loadSaved(): LitItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LitItem[]
  } catch {
    return []
  }
}

function persistSaved(items: LitItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    const ids = items.map(i => i.id).join(",")
    document.cookie = `lithos_saved_ids=${encodeURIComponent(ids)};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
  } catch {}
}

export default function LithosPage() {
  const [pool, setPool] = useState<LitItem[]>(() => buildPool("all"))
  const [activeIdx, setActiveIdx] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedItems, setSavedItems] = useState<LitItem[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<LitType | "all">("all")
  const [navVisible, setNavVisible] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved from localStorage on first mount
  useEffect(() => {
    const stored = loadSaved()
    if (stored.length > 0) {
      setSavedItems(stored)
      setSavedIds(new Set(stored.map(i => i.id)))
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (activeIdx >= pool.length - 8) {
      setPool(prev => [...prev, ...shuffled(
        activeFilter === "all" ? LITERATURE : LITERATURE.filter(i => i.type === activeFilter)
      )])
    }
  }, [activeIdx, activeFilter, pool.length])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const scrollY = el.scrollTop
    const h = el.clientHeight
    setActiveIdx(Math.round(scrollY / h))
    const delta = scrollY - lastScrollY.current
    lastScrollY.current = scrollY
    if (Math.abs(delta) > 2) setNavVisible(delta < 0 || scrollY < h * 0.5)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current
      if (!el) return
      if (e.key === "ArrowDown" || e.key === "j") el.scrollBy({ top: el.clientHeight, behavior: "smooth" })
      if (e.key === "ArrowUp"   || e.key === "k") el.scrollBy({ top: -el.clientHeight, behavior: "smooth" })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const handleSave = useCallback((item: LitItem) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
        setSavedItems(s => {
          const updated = s.filter(i => i.id !== item.id)
          persistSaved(updated)
          return updated
        })
        showToast("Removed from collection")
      } else {
        next.add(item.id)
        setSavedItems(s => {
          const updated = [item, ...s]
          persistSaved(updated)
          return updated
        })
        showToast("Saved — it'll be here when you return ✦")
      }
      return next
    })
  }, [showToast])

  const applyFilter = useCallback((f: LitType | "all") => {
    setActiveFilter(f)
    setPool(buildPool(f))
    setActiveIdx(0)
    containerRef.current?.scrollTo({ top: 0 })
    setFilterOpen(false)
  }, [])

  const navigate = useCallback((dir: 1 | -1) => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" })
  }, [])

  const visiblePool = useMemo(() => {
    const start = Math.max(0, activeIdx - 2)
    const end = Math.min(pool.length - 1, activeIdx + 3)
    return { start, items: pool.slice(start, end + 1) }
  }, [pool, activeIdx])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <ShaderAnimation opacity={0.55} />
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)" }}
      />

      {/* NAV */}
      <nav
        className={cn(
          "absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14",
          "transition-transform duration-400 ease-in-out",
          navVisible ? "translate-y-0" : "-translate-y-full"
        )}
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(32px) saturate(150%)",
          WebkitBackdropFilter: "blur(32px) saturate(150%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} strokeWidth={1.5} className="text-white/70" />
          <span className="text-[19px] text-white tracking-[-0.5px]" style={{ fontFamily: "Times New Roman, serif" }}>
            Lithos
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-widest ml-1 mt-1" style={{ fontFamily: "Helvetica Neue, sans-serif" }}>
            Literature
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-all duration-200 active:scale-95"
            style={{
              fontFamily: "Helvetica Neue, sans-serif",
              background: activeFilter !== "all" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
              color: activeFilter !== "all" ? TYPE_COLORS[activeFilter as LitType] : "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Filter size={11} strokeWidth={1.5} />
            {activeFilter === "all" ? "All" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </button>

          <button
            onClick={() => setPanelOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-all duration-200 active:scale-95"
            style={{
              fontFamily: "Helvetica Neue, sans-serif",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Bookmark size={11} strokeWidth={1.5} />
            Saved
            {hydrated && savedIds.size > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-semibold"
                style={{ background: "#0a84ff" }}
              >
                {savedIds.size > 9 ? "9+" : savedIds.size}
              </span>
            )}
          </button>

          <ThemeToggle className="hidden sm:flex" />
        </div>
      </nav>

      {/* FILTER DROPDOWN */}
      {filterOpen && (
        <>
          <div className="absolute inset-0 z-[45]" onClick={() => setFilterOpen(false)} />
          <div
            className="absolute top-16 right-4 z-[46] rounded-2xl overflow-hidden p-1.5 flex flex-col gap-0.5"
            style={{
              background: "rgba(18,18,22,0.92)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            {(["all", ...ALL_TYPES] as const).map(f => (
              <button
                key={f}
                onClick={() => applyFilter(f)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[13px] text-left transition-all duration-150"
                style={{
                  fontFamily: "Helvetica Neue, sans-serif",
                  background: activeFilter === f ? "rgba(255,255,255,0.1)" : "transparent",
                  color: f === "all" ? "rgba(255,255,255,0.8)" : TYPE_COLORS[f as LitType],
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: f === "all" ? "rgba(255,255,255,0.4)" : TYPE_COLORS[f as LitType] }}
                />
                {f === "all" ? "All Types" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
              </button>
            ))}
          </div>
        </>
      )}

      {/* SNAP SCROLL FEED */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 z-[2] overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {pool.map((item, i) => {
          const isInWindow = i >= visiblePool.start && i < visiblePool.start + visiblePool.items.length
          return (
            <div
              key={`${item.id}-${i}`}
              className="w-full flex-shrink-0"
              style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
            >
              {isInWindow && (
                <LitCard
                  item={item}
                  isActive={i === activeIdx}
                  savedIds={savedIds}
                  onSave={handleSave}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* NAV ARROWS */}
      <div
        className={cn(
          "absolute right-4 bottom-8 z-30 flex flex-col gap-2 transition-all duration-400",
          navVisible ? "opacity-100" : "opacity-60"
        )}
      >
        <button
          onClick={() => navigate(-1)}
          disabled={activeIdx === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-20"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          <ChevronUp size={16} className="text-white/70" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          <ChevronDown size={16} className="text-white/70" />
        </button>
      </div>

      {/* PROGRESS DOTS */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
        {Array.from({ length: Math.min(7, pool.length) }).map((_, i) => {
          const dist = Math.abs(activeIdx - i)
          return (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? 3 : 2,
                height: activeIdx === i ? 20 : dist <= 1 ? 8 : 5,
                background: activeIdx === i
                  ? "rgba(255,255,255,0.9)"
                  : `rgba(255,255,255,${Math.max(0.1, 0.35 - dist * 0.08)})`,
              }}
            />
          )
        })}
      </div>

      {/* SAVED PANEL */}
      {panelOpen && (
        <div className="absolute inset-0 z-[60] flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div
            className="w-full max-w-sm h-full flex flex-col"
            style={{
              background: "rgba(12,12,16,0.95)",
              backdropFilter: "blur(60px) saturate(180%)",
              WebkitBackdropFilter: "blur(60px) saturate(180%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div>
                <span className="text-white text-[20px]" style={{ fontFamily: "Times New Roman, serif" }}>
                  Your Collection
                </span>
                {savedItems.length > 0 && (
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Helvetica Neue, sans-serif" }}>
                    {savedItems.length} piece{savedItems.length !== 1 ? "s" : ""} saved to this browser
                  </p>
                )}
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <X size={13} className="text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-3">
              {savedItems.length === 0 ? (
                <div className="text-center mt-16 flex flex-col items-center gap-3">
                  <Bookmark size={28} strokeWidth={1} className="text-white/20" />
                  <p className="text-[16px] italic" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Times New Roman, serif" }}>
                    Nothing saved yet.
                  </p>
                  <p className="text-[12px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "Helvetica Neue, sans-serif" }}>
                    Tap Save on any piece and it will stay<br />here even after you close the tab.
                  </p>
                </div>
              ) : (
                savedItems.map(item => (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 relative overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: TYPE_COLORS[item.type] }} />
                    <div
                      className="text-[11px] font-medium uppercase tracking-wider mb-2"
                      style={{ color: TYPE_COLORS[item.type], fontFamily: "Helvetica Neue, sans-serif", letterSpacing: "0.5px" }}
                    >
                      {item.author} · {item.type}
                    </div>
                    <div
                      className="text-[14px] leading-relaxed line-clamp-3"
                      style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Times New Roman, serif" }}
                    >
                      {item.content}
                    </div>
                    <button
                      onClick={() => handleSave(item)}
                      className="mt-3 text-[11px] px-2.5 py-1 rounded-full transition-all active:scale-95"
                      style={{ fontFamily: "Helvetica Neue, sans-serif", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {savedItems.length > 0 && (
              <div className="px-4 pb-6 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => {
                    setSavedItems([])
                    setSavedIds(new Set())
                    persistSaved([])
                    showToast("Collection cleared")
                  }}
                  className="w-full py-2.5 rounded-xl text-[12px] transition-all active:scale-98"
                  style={{
                    fontFamily: "Helvetica Neue, sans-serif",
                    color: "rgba(255,255,255,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      <div
        className={cn(
          "absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-2.5 rounded-full text-[13px] text-white",
          "transition-all duration-400 pointer-events-none",
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{
          background: "rgba(30,30,36,0.92)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "Helvetica Neue, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {toast}
      </div>
    </div>
  )
}
