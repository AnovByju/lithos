"use client"

import { memo } from "react"
import {
  Bookmark, BookmarkCheck, ExternalLink,
  Quote, BookOpen, Feather, ScrollText,
  BookText, PenLine, Lightbulb,
  ThumbsUp, ThumbsDown
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
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }} />

        <div className="relative z-10 p-7 md:p-9 flex flex-col gap-5">
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

          {item.title && (
            <div className="text-[13px] italic"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Times New Roman, Times, serif" }}>
              {item.title}
            </div>
          )}

          <div
            className={cn(
              "leading-relaxed text-white/90",
              item.type === "quote" && "text-[22px] italic",
              item.type === "poem"  && "text-[16px] whitespace-pre-line",
              item.type !== "quote" && item.type !== "poem" && "text-[17px]",
            )}
            style={{ fontFamily: "Times New Roman, Times, serif", lineHeight: item.type === "poem" ? 1.8 : 1.75 }}
          >
            {item.type === "quote" && <span style={{ color: accent, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginRight: "4px" }}>"</span>}
            {item.content}
            {item.type === "quote" && <span style={{ color: accent, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginLeft: "4px" }}>"</span>}
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] min-w-0 group transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}
              onClick={e => e.stopPropagation()}>
              <ExternalLink size={10} className="flex-shrink-0 group-hover:text-white/60 transition-colors" />
              <span className="truncate group-hover:text-white/60 transition-colors">{item.source}</span>
            </a>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Dislike */}
              <button
                onClick={e => { e.stopPropagation(); onDislike(item) }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{
                  background: isDisliked ? "rgba(255,59,48,0.15)" : "rgba(255,255,255,0.06)",
                  border: isDisliked ? "1px solid rgba(255,59,48,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: isDisliked ? "#ff3b30" : "rgba(255,255,255,0.4)",
                }}>
                <ThumbsDown size={13} strokeWidth={isDisliked ? 2.5 : 1.5} />
              </button>

              {/* Like */}
              <button
                onClick={e => { e.stopPropagation(); onLike(item) }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
                style={{
                  background: isLiked ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.06)",
                  border: isLiked ? "1px solid rgba(48,209,88,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: isLiked ? "#30d158" : "rgba(255,255,255,0.4)",
                }}>
                <ThumbsUp size={13} strokeWidth={isLiked ? 2.5 : 1.5} />
              </button>

              {/* Save */}
              <button
                onClick={e => { e.stopPropagation(); onSave(item) }}
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
