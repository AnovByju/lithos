"use client"

import { memo, useRef, useCallback } from "react"
import {
  Bookmark, BookmarkCheck, ExternalLink,
  Quote, BookOpen, Feather, ScrollText,
  BookText, PenLine, Lightbulb,
  ThumbsUp, ThumbsDown, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LitItem, LitType } from "@/lib/literature-data"
import { TYPE_COLORS } from "@/lib/literature-data"

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
}

export const LitCard = memo(function LitCard({
  item, isActive, savedIds, likedIds, dislikedIds,
  onSave, onLike, onDislike,
}: LitCardProps) {
  const isSaved    = savedIds.has(item.id)
  const isLiked    = likedIds.has(item.id)
  const isDisliked = dislikedIds.has(item.id)
  const accent     = TYPE_COLORS[item.type]
  const initial    = item.author.split(" ").map((w: string) => w[0]).join("").slice(0, 2)
  const cardRef    = useRef<HTMLDivElement>(null)

  // ── Download card as image ────────────────────────────────────────────────
  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!cardRef.current) return

    try {
      // Dynamically import html2canvas so it doesn't bloat the initial bundle
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // retina quality
        useCORS: true,
        logging: false,
        // Extend to capture the full card without clipping
        windowWidth: cardRef.current.scrollWidth,
        windowHeight: cardRef.current.scrollHeight,
      })

      // Draw a nice background behind the card
      const final = document.createElement("canvas")
      const pad = 48
      final.width  = canvas.width  + pad * 2
      final.height = canvas.height + pad * 2
      const ctx = final.getContext("2d")!

      // Dark gradient background matching the app
      const grad = ctx.createLinearGradient(0, 0, final.width, final.height)
      grad.addColorStop(0,   "#0a0a0f")
      grad.addColorStop(0.5, "#0d0d14")
      grad.addColorStop(1,   "#0a0a0f")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, final.width, final.height)

      // Subtle accent glow
      const glow = ctx.createRadialGradient(
        final.width / 2, final.height / 2, 0,
        final.width / 2, final.height / 2, final.width * 0.6
      )
      glow.addColorStop(0,   accent + "18")
      glow.addColorStop(1,   "transparent")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, final.width, final.height)

      // Draw the captured card centred
      ctx.drawImage(canvas, pad, pad)

      // "Lithos" watermark bottom-right
      ctx.font = "500 24px 'Times New Roman', serif"
      ctx.fillStyle = "rgba(255,255,255,0.18)"
      ctx.textAlign = "right"
      ctx.fillText("Lithos", final.width - pad, final.height - pad + 16)

      // Trigger download
      const link = document.createElement("a")
      const slug  = item.author.toLowerCase().replace(/\s+/g, "-").slice(0, 20)
      link.download = `lithos-${slug}.png`
      link.href = final.toDataURL("image/png", 1.0)
      link.click()
    } catch (err) {
      console.error("Download failed:", err)
    }
  }, [item, accent])

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-6 md:px-12">
      {/* cardRef wraps only the visual card — not the outer padding */}
      <div
        ref={cardRef}
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
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Accent top strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        {/* Specular highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }} />

        <div className="relative z-10 p-7 md:p-9 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${accent}44, ${accent}22)`,
                  border: `1px solid ${accent}40`,
                  fontFamily: "Times New Roman, serif",
                  fontSize: "15px",
                }}>
                {initial}
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
              {TYPE_ICONS[item.type]}
              {item.type}
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
          <div
            className={cn(
              "leading-relaxed text-white/90",
              item.type === "quote" && "text-[22px] italic",
              item.type === "poem"  && "text-[16px] whitespace-pre-line",
              item.type !== "quote" && item.type !== "poem" && "text-[17px]",
            )}
            style={{ fontFamily: "Times New Roman, Times, serif", lineHeight: item.type === "poem" ? 1.8 : 1.75 }}
          >
            {item.type === "quote" && (
              <span style={{ color: accent, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginRight: "4px" }}>"</span>
            )}
            {item.content}
            {item.type === "quote" && (
              <span style={{ color: accent, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginLeft: "4px" }}>"</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>

            {/* Source */}
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] min-w-0 group transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}
              onClick={e => e.stopPropagation()}>
              <ExternalLink size={10} className="flex-shrink-0 group-hover:text-white/60 transition-colors" />
              <span className="truncate group-hover:text-white/60 transition-colors">{item.source}</span>
            </a>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Dislike */}
              <button onClick={e => { e.stopPropagation(); onDislike(item) }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{
                  background: isDisliked ? "rgba(255,59,48,0.15)" : "rgba(255,255,255,0.06)",
                  border: isDisliked ? "1px solid rgba(255,59,48,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: isDisliked ? "#ff3b30" : "rgba(255,255,255,0.4)",
                }}
                title="Not for me">
                <ThumbsDown size={13} strokeWidth={isDisliked ? 2.5 : 1.5} />
              </button>

              {/* Like */}
              <button onClick={e => { e.stopPropagation(); onLike(item) }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{
                  background: isLiked ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.06)",
                  border: isLiked ? "1px solid rgba(48,209,88,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: isLiked ? "#30d158" : "rgba(255,255,255,0.4)",
                }}
                title="I like this">
                <ThumbsUp size={13} strokeWidth={isLiked ? 2.5 : 1.5} />
              </button>

              {/* Download */}
              <button onClick={handleDownload}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }}
                title="Save as image">
                <Download size={13} strokeWidth={1.5} />
              </button>

              {/* Save */}
              <button onClick={e => { e.stopPropagation(); onSave(item) }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300 active:scale-95"
                style={{
                  fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                  background: isSaved ? `${accent}22` : "rgba(255,255,255,0.07)",
                  color: isSaved ? accent : "rgba(255,255,255,0.5)",
                  border: isSaved ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.1)",
                }}>
                {isSaved ? <BookmarkCheck size={13} strokeWidth={1.8} /> : <Bookmark size={13} strokeWidth={1.5} />}
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
