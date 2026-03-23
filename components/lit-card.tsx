"use client"

import { memo, useRef, useCallback, useState, useEffect } from "react"
import {
  Bookmark, BookmarkCheck, ExternalLink,
  Quote, BookOpen, Feather, ScrollText,
  BookText, PenLine, Lightbulb, Download,
  ThumbsUp, ThumbsDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LitItem, LitType } from "@/lib/literature-data"
import { TYPE_COLORS } from "@/lib/literature-data"
import { fetchAuthorThumbnail } from "@/lib/fetcher"

const TYPE_ICONS: Record<LitType, React.ReactNode> = {
  poem:       <Feather size={13} strokeWidth={1.5} />,
  quote:      <Quote size={13} strokeWidth={1.5} />,
  story:      <BookOpen size={13} strokeWidth={1.5} />,
  letter:     <ScrollText size={13} strokeWidth={1.5} />,
  diary:      <PenLine size={13} strokeWidth={1.5} />,
  essay:      <BookText size={13} strokeWidth={1.5} />,
  philosophy: <Lightbulb size={13} strokeWidth={1.5} />,
}

interface LitCardProps {
  item: LitItem
  isActive: boolean
  savedIds: Set<string>
  likedIds: Set<string>
  dislikedIds: Set<string>
  onSave: (item: LitItem) => void
  onLike: (item: LitItem) => void
  onDislike: (item: LitItem) => void
  onDownload: (item: LitItem) => void
}

// ── Canvas-based card image renderer ─────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = []
  for (const para of text.split("\n")) {
    if (!para.trim()) { out.push(""); continue }
    let line = ""
    for (const word of para.split(" ")) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word }
      else line = test
    }
    if (line) out.push(line)
  }
  return out
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}

function drawInitials(ctx: CanvasRenderingContext2D, author: string, x: number, y: number, size: number, accent: string) {
  const g = ctx.createRadialGradient(x+size/2, y+size/2, 0, x+size/2, y+size/2, size/2)
  g.addColorStop(0, accent + "55"); g.addColorStop(1, accent + "22")
  ctx.fillStyle = g; ctx.fillRect(x, y, size, size)
  ctx.font = `${Math.round(size*0.38)}px "Times New Roman", serif`
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.textAlign = "center"
  ctx.fillText(author.split(" ").map(w => w[0]).join("").slice(0,2), x+size/2, y+size*0.65)
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image(); i.crossOrigin = "anonymous"
    i.onload = () => res(i); i.onerror = rej; i.src = src
  })
}

export async function renderCardCanvas(item: LitItem, accent: string, thumbUrl: string | null): Promise<HTMLCanvasElement> {
  const SC  = 2, CW = 720, PAD = 44, INNER = CW - PAD*2, CARD_R = 22

  // Measure content height
  const probe = document.createElement("canvas")
  probe.width = INNER * SC; probe.height = 10
  const pc = probe.getContext("2d")!
  pc.scale(SC, SC)
  const isPoem  = item.type === "poem"
  const isQuote = item.type === "quote"
  const fSize   = isQuote ? 22 : isPoem ? 16 : 17
  const lineH   = isPoem ? fSize * 1.85 : fSize * 1.75
  pc.font = `${isQuote?"italic ":""}${fSize}px "Times New Roman", serif`
  const lines   = wrapText(pc, item.content, INNER - 32)

  const headerH  = 72
  const titleH   = item.title ? 28 : 0
  const contentH = lines.length * lineH + 16
  const footerH  = 56
  const cardH    = headerH + titleH + contentH + footerH + 24

  const BG = 52
  const fullW = CW + BG*2
  const fullH = cardH + BG*2 + 32

  const cv = document.createElement("canvas")
  cv.width = fullW * SC; cv.height = fullH * SC
  const ctx = cv.getContext("2d")!
  ctx.scale(SC, SC)

  // Background
  const bg = ctx.createLinearGradient(0, 0, fullW, fullH)
  bg.addColorStop(0, "#060610"); bg.addColorStop(1, "#0c0c18")
  ctx.fillStyle = bg; ctx.fillRect(0, 0, fullW, fullH)
  const glow = ctx.createRadialGradient(fullW/2, fullH/2, 0, fullW/2, fullH/2, fullW*0.55)
  glow.addColorStop(0, accent+"22"); glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow; ctx.fillRect(0, 0, fullW, fullH)

  // Card shadow
  ctx.shadowColor = "rgba(0,0,0,0.75)"; ctx.shadowBlur = 64; ctx.shadowOffsetY = 16
  roundRect(ctx, BG, BG, CW, cardH, CARD_R)
  ctx.fillStyle = "rgba(14,14,20,0.95)"; ctx.fill()
  ctx.shadowColor = "transparent"

  // Card border
  roundRect(ctx, BG, BG, CW, cardH, CARD_R)
  ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1; ctx.stroke()

  // Accent top strip
  const strip = ctx.createLinearGradient(BG, 0, BG+CW, 0)
  strip.addColorStop(0,"transparent"); strip.addColorStop(0.5,accent); strip.addColorStop(1,"transparent")
  roundRect(ctx, BG, BG, CW, 3, CARD_R)
  ctx.fillStyle = strip; ctx.fill()

  // Specular
  const spec = ctx.createLinearGradient(0, BG, 0, BG+cardH*0.4)
  spec.addColorStop(0,"rgba(255,255,255,0.05)"); spec.addColorStop(1,"transparent")
  roundRect(ctx, BG, BG, CW, cardH*0.4, CARD_R)
  ctx.fillStyle = spec; ctx.fill()

  // Clip inner content
  roundRect(ctx, BG, BG, CW, cardH, CARD_R)
  ctx.clip()

  const cx = BG + PAD
  let   cy = BG + 28

  // Avatar
  const AV = 46
  ctx.save()
  ctx.beginPath(); ctx.arc(cx+AV/2, cy+AV/2, AV/2, 0, Math.PI*2); ctx.clip()
  if (thumbUrl) {
    try {
      const img = await loadImg(thumbUrl)
      const s   = Math.min(img.naturalWidth, img.naturalHeight)
      ctx.drawImage(img, (img.naturalWidth-s)/2, (img.naturalHeight-s)/2, s, s, cx, cy, AV, AV)
    } catch { drawInitials(ctx, item.author, cx, cy, AV, accent) }
  } else { drawInitials(ctx, item.author, cx, cy, AV, accent) }
  ctx.restore()
  ctx.beginPath(); ctx.arc(cx+AV/2, cy+AV/2, AV/2, 0, Math.PI*2)
  ctx.strokeStyle = accent+"44"; ctx.lineWidth = 1.2; ctx.stroke()

  // Author name
  ctx.font = "600 15px 'Helvetica Neue', Helvetica, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.textAlign = "left"
  ctx.fillText(item.author, cx+AV+14, cy+18)
  ctx.font = "12px 'Helvetica Neue', Helvetica, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.36)"
  ctx.fillText(item.era, cx+AV+14, cy+34)

  // Type pill
  ctx.font = "600 10px 'Helvetica Neue', Helvetica, sans-serif"
  const ptxt  = item.type.toUpperCase()
  const ptxtW = ctx.measureText(ptxt).width
  const pW = ptxtW + 22, pH = 24
  const pX = BG + CW - PAD - pW, pY = cy + 10
  roundRect(ctx, pX, pY, pW, pH, 12)
  ctx.fillStyle = accent+"18"; ctx.fill()
  roundRect(ctx, pX, pY, pW, pH, 12)
  ctx.strokeStyle = accent+"44"; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = accent; ctx.textAlign = "center"
  ctx.fillText(ptxt, pX+pW/2, pY+16)

  cy += AV + 20

  // Title
  if (item.title) {
    ctx.font = `italic 13px "Times New Roman", serif`
    ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.textAlign = "left"
    ctx.fillText(item.title, cx, cy); cy += 26
  }

  // Content
  ctx.font = `${isQuote?"italic ":""}${fSize}px "Times New Roman", serif`
  ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.textAlign = "left"
  if (isQuote) {
    ctx.fillStyle = accent; ctx.font = `italic ${fSize*1.4}px "Times New Roman", serif`
    ctx.fillText("\u201C", cx, cy+fSize)
    ctx.font = `italic ${fSize}px "Times New Roman", serif`; ctx.fillStyle = "rgba(255,255,255,0.88)"
  }
  for (const line of lines) {
    ctx.fillText(line, cx + (isQuote ? 18 : 0), cy + fSize); cy += lineH
  }
  cy += 20

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(BG+CW-PAD, cy); ctx.stroke()
  cy += 16

  // Source
  ctx.font = "11px 'Helvetica Neue', Helvetica, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.textAlign = "left"
  ctx.fillText("↗  " + item.source, cx, cy+12)

  // Watermark
  ctx.font = `italic 16px "Times New Roman", serif`
  ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.textAlign = "right"
  ctx.fillText("Lithos", BG+CW-PAD, BG+cardH+BG*0.6)

  return cv
}

// ── Component ─────────────────────────────────────────────────────────────────
export const LitCard = memo(function LitCard({
  item, isActive, savedIds, likedIds, dislikedIds,
  onSave, onLike, onDislike, onDownload,
}: LitCardProps) {
  const isSaved    = savedIds.has(item.id)
  const isLiked    = likedIds.has(item.id)
  const isDisliked = dislikedIds.has(item.id)
  const accent     = TYPE_COLORS[item.type]
  const initial    = item.author.split(" ").map(w => w[0]).join("").slice(0, 2)

  // Live author thumbnail from Wikipedia
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!isActive) return
    fetchAuthorThumbnail(item.author).then(url => {
      if (url) setThumbUrl(url)
    })
  }, [item.author, isActive])

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-6 md:px-12">
      <div
        className={cn(
          "relative w-full max-w-2xl rounded-3xl overflow-hidden",
          "transition-all duration-700",
          isActive ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
        )}
        style={{
          background: "rgba(15,15,18,0.85)",
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
        <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,transparent 100%)" }} />

        <div className="relative z-10 p-7 md:p-9 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden"
                style={{ border: `1px solid ${accent}44` }}>
                {thumbUrl ? (
                  <img src={thumbUrl} alt={item.author}
                    className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 30% 30%,${accent}44,${accent}22)`,
                      fontFamily: "Times New Roman, serif", fontSize: "15px", color: "#fff"
                    }}>
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-white truncate"
                  style={{ fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}>
                  {item.author}
                </div>
                <div className="text-[11px] mt-0.5 truncate"
                  style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}>
                  {item.era}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-[11px] uppercase"
              style={{
                color: accent, border: `1px solid ${accent}35`, background: `${accent}12`,
                fontFamily: "Helvetica Neue, Helvetica, sans-serif", fontWeight: 500, letterSpacing: "0.6px"
              }}>
              {TYPE_ICONS[item.type]}{item.type}
            </div>
          </div>

          {/* Title */}
          {item.title && (
            <div className="text-[13px] italic"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Times New Roman, Times, serif" }}>
              {item.title}
            </div>
          )}

          {/* Content */}
          <div className={cn(
              "leading-relaxed text-white/90",
              item.type === "quote" && "text-[22px] italic",
              item.type === "poem"  && "text-[16px] whitespace-pre-line",
              item.type !== "quote" && item.type !== "poem" && "text-[17px]",
            )}
            style={{ fontFamily: "Times New Roman, Times, serif", lineHeight: item.type==="poem" ? 1.8 : 1.75 }}>
            {item.type === "quote" && <span style={{ color:accent,opacity:.7,fontSize:"1.4em",lineHeight:0,verticalAlign:"middle",marginRight:"4px" }}>"</span>}
            {item.content}
            {item.type === "quote" && <span style={{ color:accent,opacity:.7,fontSize:"1.4em",lineHeight:0,verticalAlign:"middle",marginLeft:"4px" }}>"</span>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t"
            style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] min-w-0 group transition-colors"
              style={{ color:"rgba(255,255,255,0.28)", fontFamily:"Helvetica Neue, Helvetica, sans-serif" }}
              onClick={e => e.stopPropagation()}>
              <ExternalLink size={10} className="flex-shrink-0 group-hover:text-white/60 transition-colors" />
              <span className="truncate group-hover:text-white/60 transition-colors">{item.source}</span>
            </a>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Swipe hint dots */}
              <div className="flex items-center gap-1 mr-1 opacity-30">
                <div className="w-1 h-1 rounded-full bg-red-400" />
                <div className="w-3 h-px bg-white/30" />
                <div className="w-1 h-1 rounded-full bg-green-400" />
              </div>

              {/* Download */}
              <button onClick={e => { e.stopPropagation(); onDownload(item) }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}
                title="Save as image">
                <Download size={13} strokeWidth={1.5} />
              </button>

              {/* Save */}
              <button onClick={e => { e.stopPropagation(); onSave(item) }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300 active:scale-95"
                style={{
                  fontFamily:"Helvetica Neue, Helvetica, sans-serif",
                  background: isSaved ? `${accent}22` : "rgba(255,255,255,0.07)",
                  color: isSaved ? accent : "rgba(255,255,255,0.5)",
                  border: isSaved ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.1)",
                }}>
                {isSaved ? <BookmarkCheck size={13} strokeWidth={1.8}/> : <Bookmark size={13} strokeWidth={1.5}/>}
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
