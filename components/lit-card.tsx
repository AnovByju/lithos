"use client"

import { useState, memo } from "react"
import { Bookmark, BookmarkCheck, ExternalLink, Quote, BookOpen, Feather, ScrollText, BookText, PenLine, Lightbulb } from "lucide-react"
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
  onSave: (item: LitItem) => void
}

export const LitCard = memo(function LitCard({ item, isActive, savedIds, onSave }: LitCardProps) {
  const isSaved = savedIds.has(item.id)
  const accentColor = TYPE_COLORS[item.type]
  const initial = item.author.split(" ").map(w => w[0]).join("").slice(0, 2)

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
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
      >
        {/* Accent top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        {/* Specular glass highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }}
        />

        <div className="relative z-10 p-7 md:p-9 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${accentColor}44, ${accentColor}22)`,
                  border: `1px solid ${accentColor}40`,
                  fontFamily: "Times New Roman, serif",
                  fontSize: "15px",
                  letterSpacing: "0.5px"
                }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[15px] font-medium text-white truncate"
                  style={{ fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}
                >
                  {item.author}
                </div>
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}
                >
                  {item.era}
                </div>
              </div>
            </div>

            {/* Type pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-[11px] tracking-wide uppercase"
              style={{
                color: accentColor,
                border: `1px solid ${accentColor}35`,
                background: `${accentColor}12`,
                fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.6px"
              }}
            >
              {TYPE_ICONS[item.type]}
              {item.type}
            </div>
          </div>

          {/* Title */}
          {item.title && (
            <div
              className="text-[13px] italic"
              style={{
                color: "rgba(255,255,255,0.35)",
                fontFamily: "Times New Roman, Times, serif",
                fontWeight: "normal"
              }}
            >
              {item.title}
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              "leading-relaxed text-white/90",
              item.type === "quote" && "text-[22px] italic",
              item.type === "poem" && "text-[16px] whitespace-pre-line",
              item.type !== "quote" && item.type !== "poem" && "text-[17px]",
            )}
            style={{
              fontFamily: "Times New Roman, Times, serif",
              fontWeight: "normal",
              lineHeight: item.type === "poem" ? 1.8 : 1.75,
            }}
          >
            {item.type === "quote" && (
              <span style={{ color: accentColor, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginRight: "4px" }}>"</span>
            )}
            {item.content}
            {item.type === "quote" && (
              <span style={{ color: accentColor, opacity: 0.7, fontSize: "1.4em", lineHeight: 0, verticalAlign: "middle", marginLeft: "4px" }}>"</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
            {/* Source */}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] min-w-0 group transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={10} className="flex-shrink-0 group-hover:text-white/60 transition-colors" />
              <span className="truncate group-hover:text-white/60 transition-colors">{item.source}</span>
            </a>

            {/* Save button */}
            <button
              onClick={(e) => { e.stopPropagation(); onSave(item) }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300",
                "active:scale-95"
              )}
              style={{
                fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                background: isSaved ? `${accentColor}22` : "rgba(255,255,255,0.07)",
                color: isSaved ? accentColor : "rgba(255,255,255,0.5)",
                border: isSaved ? `1px solid ${accentColor}40` : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {isSaved
                ? <BookmarkCheck size={13} strokeWidth={1.8} />
                : <Bookmark size={13} strokeWidth={1.5} />}
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
