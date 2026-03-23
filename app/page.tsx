"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Bookmark, X, ChevronUp, ChevronDown, BookOpen, Loader2, ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { TYPE_COLORS, type LitItem, type LitType } from "@/lib/literature-data"
import { LitCard, renderCardCanvas } from "@/components/lit-card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { loadAlgo, saveAlgo, applySignal, buildRankedPool, type AlgoState } from "@/lib/algo"
import { fetchLiteratureBatch, fetchAuthorThumbnail } from "@/lib/fetcher"

const ShaderAnimation = dynamic(
  () => import("@/components/ui/shader-animation").then(m => ({ default: m.ShaderAnimation })),
  { ssr: false }
)

const ALL_TYPES: LitType[] = ["poem","quote","story","letter","diary","essay","philosophy"]
const SAVED_KEY  = "lithos_saved_items"
const LIKED_KEY  = "lithos_liked_ids"

// ── Persistence ────────────────────────────────────────────────────────────────
function loadSaved(): LitItem[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)||"[]") } catch { return [] }
}
function persistSaved(items: LitItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items))
    document.cookie = `lithos_saved_ids=${encodeURIComponent(items.map(i=>i.id).join(","))};path=/;max-age=${60*60*24*365};SameSite=Lax`
  } catch {}
}
function loadLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY)||"[]")) } catch { return new Set() }
}
function persistLikedIds(ids: Set<string>) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(ids))) } catch {}
}

// ── Swipe constants ────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 72   // px horizontal to trigger like/dislike
const SWIPE_MAX       = 140  // clamp visual translation

export default function LithosPage() {
  const [algo, setAlgo]               = useState<AlgoState|null>(null)
  const [pool, setPool]               = useState<LitItem[]>([])
  const [activeIdx, setActiveIdx]     = useState(0)
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set())
  const [savedItems, setSavedItems]   = useState<LitItem[]>([])
  const [likedIds, setLikedIds]       = useState<Set<string>>(new Set())
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set())
  const [panelOpen, setPanelOpen]     = useState(false)
  const [filterOpen, setFilterOpen]   = useState(false)
  const [activeFilter, setActiveFilter] = useState<LitType|"all">("all")
  const [navVisible, setNavVisible]   = useState(true)
  const [toast, setToast]             = useState<string|null>(null)
  const [hydrated, setHydrated]       = useState(false)
  const [fetching, setFetching]       = useState(false)
  // Saved detail modal
  const [detailItem, setDetailItem]   = useState<LitItem|null>(null)
  const [detailThumb, setDetailThumb] = useState<string|null>(null)
  // Swipe state
  const [swipeX, setSwipeX]           = useState(0)
  const [swiping, setSwiping]         = useState(false)

  const containerRef  = useRef<HTMLDivElement>(null)
  const lastScrollY   = useRef(0)
  const toastTimeout  = useRef<ReturnType<typeof setTimeout>|null>(null)
  const algoRef       = useRef<AlgoState|null>(null)
  const fetchingRef   = useRef(false)
  const allFetched    = useRef<LitItem[]>([])
  // Swipe tracking
  const touchStartX   = useRef(0)
  const touchStartY   = useRef(0)
  const swipeActive   = useRef(false)

  // ── Hydrate ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedAlgo  = loadAlgo()
    const storedSaved = loadSaved()
    const storedLiked = loadLikedIds()
    algoRef.current   = storedAlgo
    setAlgo(storedAlgo)
    setDislikedIds(new Set(storedAlgo.dislikedIds))
    setLikedIds(storedLiked)
    if (storedSaved.length > 0) {
      setSavedItems(storedSaved)
      setSavedIds(new Set(storedSaved.map(i => i.id)))
    }
    setHydrated(true)
    loadMoreItems(storedAlgo, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch more ─────────────────────────────────────────────────────────────
  const loadMoreItems = useCallback(async (currentAlgo: AlgoState, initial = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (initial) setFetching(true)
    try {
      const newItems = await fetchLiteratureBatch(16)
      if (!newItems.length) return
      allFetched.current = [...allFetched.current, ...newItems]
      setPool(prev => {
        const toAdd = activeFilter === "all" ? newItems : newItems.filter(i => i.type === activeFilter)
        const filtered = toAdd.filter(i => !currentAlgo.dislikedIds.includes(i.id))
        if (initial) return buildRankedPool(filtered, "all", currentAlgo, 1)
        return [...prev, ...filtered]
      })
    } finally {
      fetchingRef.current = false
      setFetching(false)
    }
  }, [activeFilter])

  // ── Refill when near end ───────────────────────────────────────────────────
  useEffect(() => {
    if (!algo) return
    if (activeIdx >= pool.length - 6) loadMoreItems(algo)
  }, [activeIdx, pool.length, algo, loadMoreItems])

  // ── Scroll handler ─────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = containerRef.current; if (!el) return
    const scrollY = el.scrollTop, h = el.clientHeight
    const newIdx  = Math.round(scrollY / h)
    if (newIdx !== activeIdx) {
      setActiveIdx(newIdx)
      const item = pool[newIdx]
      if (item && algoRef.current) {
        const next = applySignal(algoRef.current, item, "view")
        algoRef.current = next; saveAlgo(next); setAlgo(next)
      }
    }
    const delta = scrollY - lastScrollY.current
    lastScrollY.current = scrollY
    if (Math.abs(delta) > 2) setNavVisible(delta < 0 || scrollY < h * 0.5)
  }, [activeIdx, pool])

  // ── Keyboard nav ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current; if (!el) return
      if (e.key==="ArrowDown"||e.key==="j") el.scrollBy({top: el.clientHeight,behavior:"smooth"})
      if (e.key==="ArrowUp"  ||e.key==="k") el.scrollBy({top:-el.clientHeight,behavior:"smooth"})
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(null), 2400)
  }, [])

  // ── Algo update helper ─────────────────────────────────────────────────────
  const updateAlgo = useCallback((item: LitItem, signal: "like"|"dislike"|"save"|"view") => {
    const c = algoRef.current; if (!c) return undefined
    const next = applySignal(c, item, signal)
    algoRef.current = next; saveAlgo(next); setAlgo(next)
    return next
  }, [])

  // ── Swipe handlers ─────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swipeActive.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    // Only activate horizontal swipe if clearly horizontal
    if (!swipeActive.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipeActive.current = true
    }
    if (!swipeActive.current) return

    e.stopPropagation()
    const clamped = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx))
    setSwipeX(clamped)
    setSwiping(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!swipeActive.current) { setSwiping(false); setSwipeX(0); return }
    const item = pool[activeIdx]
    if (item) {
      if (swipeX > SWIPE_THRESHOLD) {
        handleLike(item)
      } else if (swipeX < -SWIPE_THRESHOLD) {
        handleDislike(item)
      }
    }
    setSwipeX(0); setSwiping(false); swipeActive.current = false
  }, [swipeX, activeIdx, pool]) // handleLike/handleDislike added below

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback((item: LitItem) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
        setSavedItems(s => { const u = s.filter(i=>i.id!==item.id); persistSaved(u); return u })
        showToast("Removed from collection")
      } else {
        next.add(item.id)
        setSavedItems(s => { const u = [item,...s]; persistSaved(u); return u })
        updateAlgo(item, "save")
        showToast("Saved — it'll be here when you return ✦")
      }
      return next
    })
  }, [showToast, updateAlgo])

  // ── Like (swipe right) ─────────────────────────────────────────────────────
  const handleLike = useCallback((item: LitItem) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) { next.delete(item.id); showToast("Like removed") }
      else {
        next.add(item.id)
        setDislikedIds(d => { const nd=new Set(d); nd.delete(item.id); return nd })
        updateAlgo(item, "like")
        showToast("Liked ✦ — more like this coming")
      }
      persistLikedIds(next); return next
    })
  }, [showToast, updateAlgo])

  // ── Dislike (swipe left) ───────────────────────────────────────────────────
  const handleDislike = useCallback((item: LitItem) => {
    setDislikedIds(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) { next.delete(item.id); showToast("Removed dislike") }
      else {
        next.add(item.id)
        setLikedIds(l => { const nl=new Set(l); nl.delete(item.id); persistLikedIds(nl); return nl })
        const nextAlgo = updateAlgo(item, "dislike")
        showToast("Got it — less of this")
        if (nextAlgo) setPool(prev => prev.filter(p=>p.id!==item.id))
      }
      return next
    })
  }, [showToast, updateAlgo])

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (item: LitItem) => {
    showToast("Preparing image…")
    try {
      const accent = TYPE_COLORS[item.type]
      const thumb  = await fetchAuthorThumbnail(item.author)
      const canvas = await renderCardCanvas(item, accent, thumb)
      const link   = document.createElement("a")
      link.download = `lithos-${item.author.toLowerCase().replace(/\s+/g,"-").slice(0,20)}.png`
      link.href     = canvas.toDataURL("image/png",1.0)
      link.click()
      showToast("Downloaded ✦")
    } catch { showToast("Download failed — try again") }
  }, [showToast])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const applyFilter = useCallback((f: LitType|"all") => {
    setActiveFilter(f); setActiveIdx(0)
    containerRef.current?.scrollTo({top:0})
    setFilterOpen(false)
    const filtered = f==="all" ? allFetched.current : allFetched.current.filter(i=>i.type===f)
    if (algo) setPool(buildRankedPool(filtered.length>0?filtered:allFetched.current,"all",algo,1))
    if (algo) loadMoreItems(algo)
  }, [algo, loadMoreItems])

  // ── Navigate to saved item ─────────────────────────────────────────────────
  const navigateToItem = useCallback((item: LitItem) => {
    setPanelOpen(false); setDetailItem(null)
    const el = containerRef.current; if (!el) return
    const idx = pool.findIndex(p=>p.id===item.id)
    if (idx!==-1) setTimeout(()=>el.scrollTo({top:idx*el.clientHeight,behavior:"smooth"}),300)
    else { setPool(prev=>[item,...prev]); setActiveIdx(0); setTimeout(()=>el.scrollTo({top:0,behavior:"smooth"}),300) }
  }, [pool])

  const navigate = useCallback((dir: 1|-1) => {
    containerRef.current?.scrollBy({top:dir*(containerRef.current?.clientHeight??0),behavior:"smooth"})
  }, [])

  const visiblePool = useMemo(() => {
    const start = Math.max(0, activeIdx-2)
    const end   = Math.min(pool.length-1, activeIdx+3)
    return { start, items: pool.slice(start, end+1) }
  }, [pool, activeIdx])

  // Swipe indicator color/label
  const swipeRatio    = swipeX / SWIPE_MAX
  const isSwipingRight = swipeX > 20
  const isSwipingLeft  = swipeX < -20

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{height:"100dvh"}}>
      <div className="absolute inset-0 z-0"><ShaderAnimation opacity={0.55} /></div>
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{background:"radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.65) 100%)"}} />

      {/* NAV */}
      <nav className={cn("absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14","transition-transform duration-300",navVisible?"translate-y-0":"-translate-y-full")}
        style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(32px) saturate(150%)",WebkitBackdropFilter:"blur(32px) saturate(150%)",borderBottom:"1px solid rgba(255,255,255,0.06)",paddingTop:"env(safe-area-inset-top)"}}>
        <button className="flex items-center gap-2 active:opacity-70 transition-opacity"
          onClick={() => window.location.reload()}>
          <BookOpen size={18} strokeWidth={1.5} className="text-white/70" />
          <span className="text-[19px] text-white tracking-[-0.5px]" style={{fontFamily:"Times New Roman, serif"}}>Lithos</span>
          <span className="text-[10px] text-white/30 uppercase tracking-widest ml-1 mt-1" style={{fontFamily:"Helvetica Neue, sans-serif"}}>Literature</span>
        </button>
        <div className="flex items-center gap-2">
          {fetching && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <Loader2 size={10} className="text-white/30 animate-spin" />
              <span className="text-[10px] text-white/30" style={{fontFamily:"Helvetica Neue, sans-serif"}}>Fetching…</span>
            </div>
          )}
          <button onClick={()=>setFilterOpen(o=>!o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-all active:scale-95"
            style={{fontFamily:"Helvetica Neue, sans-serif",background:activeFilter!=="all"?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.06)",color:activeFilter!=="all"?TYPE_COLORS[activeFilter as LitType]:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)"}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {activeFilter==="all"?"All":activeFilter.charAt(0).toUpperCase()+activeFilter.slice(1)}
          </button>
          <button onClick={()=>setPanelOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-all active:scale-95"
            style={{fontFamily:"Helvetica Neue, sans-serif",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)"}}>
            <Bookmark size={11} strokeWidth={1.5} />
            Saved
            {hydrated && savedIds.size>0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-semibold"
                style={{background:"#0a84ff"}}>{savedIds.size>9?"9+":savedIds.size}</span>
            )}
          </button>
          <ThemeToggle className="hidden sm:flex" />
        </div>
      </nav>

      {/* FILTER DROPDOWN */}
      {filterOpen && (
        <>
          <div className="absolute inset-0 z-[45]" onClick={()=>setFilterOpen(false)} />
          <div className="absolute top-16 right-4 z-[46] rounded-2xl overflow-hidden p-1.5 flex flex-col gap-0.5"
            style={{background:"rgba(18,18,22,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
            {(["all",...ALL_TYPES] as const).map(f=>(
              <button key={f} onClick={()=>applyFilter(f)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[13px] text-left transition-all"
                style={{fontFamily:"Helvetica Neue, sans-serif",background:activeFilter===f?"rgba(255,255,255,0.1)":"transparent",color:f==="all"?"rgba(255,255,255,0.8)":TYPE_COLORS[f as LitType]}}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{background:f==="all"?"rgba(255,255,255,0.4)":TYPE_COLORS[f as LitType]}} />
                {f==="all"?"All Types":f.charAt(0).toUpperCase()+f.slice(1)+"s"}
              </button>
            ))}
          </div>
        </>
      )}

      {/* FEED */}
      <div ref={containerRef} onScroll={handleScroll}
        className="absolute inset-0 z-[2] overflow-y-scroll"
        style={{scrollSnapType:"y mandatory",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",overscrollBehavior:"none"}}>

        {pool.length===0 && fetching && (
          <div className="w-full flex-shrink-0 flex items-center justify-center" style={{height:"100dvh"}}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={28} className="text-white/20 animate-spin" />
              <p className="text-[14px] italic" style={{color:"rgba(255,255,255,0.2)",fontFamily:"Times New Roman, serif"}}>
                Fetching literature from Wikipedia & Internet Archive…
              </p>
            </div>
          </div>
        )}

        {pool.map((item, i) => {
          const inWindow = i>=visiblePool.start && i<visiblePool.start+visiblePool.items.length
          const isThis   = i===activeIdx
          const tx       = isThis && swiping ? swipeX : 0
          const rot      = isThis && swiping ? swipeX * 0.04 : 0
          const likeAmt  = isThis && isSwipingRight ? Math.min(1, swipeX/SWIPE_THRESHOLD) : 0
          const dislikeAmt=isThis && isSwipingLeft  ? Math.min(1,-swipeX/SWIPE_THRESHOLD) : 0

          return (
            <div key={`${item.id}-${i}`}
              className="w-full flex-shrink-0 relative"
              style={{height:"100dvh",scrollSnapAlign:"start",scrollSnapStop:"always"}}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}>

              {/* Swipe overlays */}
              {isThis && likeAmt > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-start pl-8 pointer-events-none"
                  style={{opacity:likeAmt}}>
                  <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl"
                    style={{background:"rgba(48,209,88,0.15)",border:"1.5px solid rgba(48,209,88,0.5)",backdropFilter:"blur(8px)"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    <span className="text-[11px] font-semibold tracking-widest uppercase"
                      style={{color:"#30d158",fontFamily:"Helvetica Neue, sans-serif",letterSpacing:"0.1em"}}>Like</span>
                  </div>
                </div>
              )}
              {isThis && dislikeAmt > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-end pr-8 pointer-events-none"
                  style={{opacity:dislikeAmt}}>
                  <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl"
                    style={{background:"rgba(255,59,48,0.15)",border:"1.5px solid rgba(255,59,48,0.5)",backdropFilter:"blur(8px)"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                    <span className="text-[11px] font-semibold tracking-widest uppercase"
                      style={{color:"#ff3b30",fontFamily:"Helvetica Neue, sans-serif",letterSpacing:"0.1em"}}>Skip</span>
                  </div>
                </div>
              )}

              {/* Card wrapper with swipe transform */}
              <div style={{
                transform: `translateX(${tx}px) rotate(${rot}deg)`,
                transition: swiping ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {inWindow && (
                  <LitCard item={item} isActive={i===activeIdx}
                    savedIds={savedIds} likedIds={likedIds} dislikedIds={dislikedIds}
                    onSave={handleSave} onLike={handleLike} onDislike={handleDislike}
                    onDownload={handleDownload} />
                )}
              </div>
            </div>
          )
        })}

        {pool.length>0 && fetching && (
          <div className="w-full flex items-center justify-center py-8">
            <Loader2 size={18} className="text-white/20 animate-spin" />
          </div>
        )}
      </div>

      {/* NAV ARROWS */}
      <div className={cn("absolute right-4 z-30 flex flex-col gap-2 transition-all",navVisible?"opacity-100":"opacity-50")}
        style={{bottom:"calc(2rem + env(safe-area-inset-bottom))"}}>
        <button onClick={()=>navigate(-1)} disabled={activeIdx===0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-20"
          style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(12px)"}}>
          <ChevronUp size={16} className="text-white/70" />
        </button>
        <button onClick={()=>navigate(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(12px)"}}>
          <ChevronDown size={16} className="text-white/70" />
        </button>
      </div>

      {/* Swipe hint — shown once */}
      {pool.length>0 && activeIdx===0 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none"
          style={{opacity:0.35}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
          </svg>
          <span className="text-[10px] text-white/50" style={{fontFamily:"Helvetica Neue, sans-serif"}}>swipe to react</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </div>
      )}

      {/* PROGRESS DOTS */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
        {Array.from({length:Math.min(7,pool.length)}).map((_,i)=>{
          const dist = Math.abs(activeIdx-i)
          return (
            <div key={i} className="rounded-full transition-all duration-300" style={{
              width:activeIdx===i?3:2,
              height:activeIdx===i?20:dist<=1?8:5,
              background:activeIdx===i?"rgba(255,255,255,0.9)":`rgba(255,255,255,${Math.max(0.1,0.35-dist*0.08)})`,
            }} />
          )
        })}
      </div>

      {/* SAVED PANEL */}
      {panelOpen && (
        <div className="absolute inset-0 z-[60] flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={()=>setPanelOpen(false)} />
          <div className="w-full max-w-sm h-full flex flex-col"
            style={{background:"rgba(12,12,16,0.95)",backdropFilter:"blur(60px) saturate(180%)",WebkitBackdropFilter:"blur(60px) saturate(180%)",borderLeft:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="flex items-center justify-between px-6 py-5 border-b"
              style={{borderColor:"rgba(255,255,255,0.06)",paddingTop:"max(20px,env(safe-area-inset-top))"}}>
              <div>
                <span className="text-white text-[20px]" style={{fontFamily:"Times New Roman, serif"}}>Your Collection</span>
                {savedItems.length>0 && (
                  <p className="text-[11px] mt-0.5" style={{color:"rgba(255,255,255,0.3)",fontFamily:"Helvetica Neue, sans-serif"}}>
                    {savedItems.length} piece{savedItems.length!==1?"s":""} · tap to read
                  </p>
                )}
              </div>
              <button onClick={()=>setPanelOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}>
                <X size={13} className="text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-3">
              {savedItems.length===0 ? (
                <div className="text-center mt-16 flex flex-col items-center gap-3">
                  <Bookmark size={28} strokeWidth={1} className="text-white/20" />
                  <p className="text-[16px] italic" style={{color:"rgba(255,255,255,0.25)",fontFamily:"Times New Roman, serif"}}>Nothing saved yet.</p>
                  <p className="text-[12px] text-center leading-relaxed" style={{color:"rgba(255,255,255,0.18)",fontFamily:"Helvetica Neue, sans-serif"}}>
                    Tap Save on any piece — it stays here<br />even after you close the tab.
                  </p>
                </div>
              ) : (
                savedItems.map(item=>(
                  <div key={item.id}
                    className="rounded-2xl p-4 relative overflow-hidden cursor-pointer group transition-all duration-200"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}
                    onClick={()=>{
                      setDetailItem(item)
                      setDetailThumb(null)
                      fetchAuthorThumbnail(item.author).then(url=>setDetailThumb(url))
                    }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{background:"rgba(255,255,255,0.03)"}} />
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:TYPE_COLORS[item.type]}} />
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-[11px] font-medium uppercase tracking-wider"
                        style={{color:TYPE_COLORS[item.type],fontFamily:"Helvetica Neue, sans-serif",letterSpacing:"0.5px"}}>
                        {item.author} · {item.type}
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-0.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="text-[14px] leading-relaxed line-clamp-2"
                      style={{color:"rgba(255,255,255,0.7)",fontFamily:"Times New Roman, serif"}}>
                      {item.content}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={e=>{e.stopPropagation();navigateToItem(item)}}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-all active:scale-95"
                        style={{fontFamily:"Helvetica Neue, sans-serif",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.05)"}}>
                        Jump to
                      </button>
                      <button onClick={e=>{e.stopPropagation();handleSave(item)}}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-all active:scale-95"
                        style={{fontFamily:"Helvetica Neue, sans-serif",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.1)"}}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {savedItems.length>0 && (
              <div className="px-4 pb-6 pt-2 border-t" style={{borderColor:"rgba(255,255,255,0.06)",paddingBottom:"max(24px,env(safe-area-inset-bottom))"}}>
                <button onClick={()=>{setSavedItems([]);setSavedIds(new Set());persistSaved([]);showToast("Collection cleared")}}
                  className="w-full py-2.5 rounded-xl text-[12px] transition-all"
                  style={{fontFamily:"Helvetica Neue, sans-serif",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)"}}>
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAVED DETAIL MODAL */}
      {detailItem && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-6"
          onClick={()=>setDetailItem(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background:"rgba(12,12,18,0.97)",
              backdropFilter:"blur(60px)",WebkitBackdropFilter:"blur(60px)",
              border:"1px solid rgba(255,255,255,0.1)",
              boxShadow:"0 40px 100px rgba(0,0,0,0.8)",
              maxHeight:"85dvh",overflowY:"auto"
            }}
            onClick={e=>e.stopPropagation()}>

            {/* Accent strip */}
            <div className="h-[2px] w-full"
              style={{background:`linear-gradient(90deg,transparent,${TYPE_COLORS[detailItem.type]},transparent)`}} />

            <div className="p-7 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden"
                    style={{border:`1.5px solid ${TYPE_COLORS[detailItem.type]}44`}}>
                    {detailThumb ? (
                      <img src={detailThumb} alt={detailItem.author} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white"
                        style={{background:`radial-gradient(circle at 30% 30%,${TYPE_COLORS[detailItem.type]}44,${TYPE_COLORS[detailItem.type]}22)`,fontFamily:"Times New Roman, serif",fontSize:"18px"}}>
                        {detailItem.author.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[17px] font-medium text-white" style={{fontFamily:"Helvetica Neue, Helvetica, sans-serif"}}>{detailItem.author}</div>
                    <div className="text-[12px] mt-0.5" style={{color:"rgba(255,255,255,0.38)",fontFamily:"Helvetica Neue, Helvetica, sans-serif"}}>{detailItem.era}</div>
                    <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full w-fit text-[10px] uppercase"
                      style={{color:TYPE_COLORS[detailItem.type],border:`1px solid ${TYPE_COLORS[detailItem.type]}35`,background:`${TYPE_COLORS[detailItem.type]}12`,fontFamily:"Helvetica Neue, sans-serif",fontWeight:500,letterSpacing:"0.6px"}}>
                      {detailItem.type}
                    </div>
                  </div>
                </div>
                <button onClick={()=>setDetailItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <X size={13} className="text-white/60" />
                </button>
              </div>

              {/* Title */}
              {detailItem.title && (
                <div className="text-[13px] italic" style={{color:"rgba(255,255,255,0.35)",fontFamily:"Times New Roman, Times, serif"}}>
                  {detailItem.title}
                </div>
              )}

              {/* Full content */}
              <div className={cn(
                  "leading-relaxed text-white/90",
                  detailItem.type==="quote"&&"text-[20px] italic",
                  detailItem.type==="poem"&&"text-[16px] whitespace-pre-line",
                  detailItem.type!=="quote"&&detailItem.type!=="poem"&&"text-[16px]"
                )}
                style={{fontFamily:"Times New Roman, Times, serif",lineHeight:detailItem.type==="poem"?1.85:1.8}}>
                {detailItem.type==="quote"&&<span style={{color:TYPE_COLORS[detailItem.type],opacity:.7,fontSize:"1.4em",lineHeight:0,verticalAlign:"middle",marginRight:"4px"}}>"</span>}
                {detailItem.content}
                {detailItem.type==="quote"&&<span style={{color:TYPE_COLORS[detailItem.type],opacity:.7,fontSize:"1.4em",lineHeight:0,verticalAlign:"middle",marginLeft:"4px"}}>"</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t flex-wrap"
                style={{borderColor:"rgba(255,255,255,0.07)"}}>
                <a href={detailItem.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] transition-colors group"
                  style={{color:"rgba(255,255,255,0.35)",fontFamily:"Helvetica Neue, sans-serif"}}>
                  <ExternalLink size={11} className="group-hover:text-white/60 transition-colors" />
                  <span className="group-hover:text-white/60 transition-colors">{detailItem.source}</span>
                </a>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={()=>handleSave(detailItem)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] transition-all active:scale-95"
                    style={{fontFamily:"Helvetica Neue, sans-serif",background:savedIds.has(detailItem.id)?`${TYPE_COLORS[detailItem.type]}22`:"rgba(255,255,255,0.07)",color:savedIds.has(detailItem.id)?TYPE_COLORS[detailItem.type]:"rgba(255,255,255,0.5)",border:savedIds.has(detailItem.id)?`1px solid ${TYPE_COLORS[detailItem.type]}40`:"1px solid rgba(255,255,255,0.1)"}}>
                    <Bookmark size={12} strokeWidth={1.5} />
                    {savedIds.has(detailItem.id)?"Saved":"Save"}
                  </button>
                  <button onClick={()=>navigateToItem(detailItem)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] transition-all active:scale-95"
                    style={{fontFamily:"Helvetica Neue, sans-serif",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.12)"}}>
                    Jump to card →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={cn("absolute left-1/2 -translate-x-1/2 z-[80] px-5 py-2.5 rounded-full text-[13px] text-white","transition-all duration-400 pointer-events-none",toast?"opacity-100 translate-y-0":"opacity-0 translate-y-4")}
        style={{bottom:"calc(1.5rem + env(safe-area-inset-bottom))",background:"rgba(30,30,36,0.92)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"Helvetica Neue, sans-serif",whiteSpace:"nowrap"}}>
        {toast}
      </div>
    </div>
  )
}
