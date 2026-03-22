"use client"
import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  onChange?: (isDark: boolean) => void
}

export function ThemeToggle({ className, onChange }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true)

  const toggle = () => {
    setIsDark(!isDark)
    onChange?.(!isDark)
  }

  return (
    <div
      className={cn(
        "flex w-14 h-7 p-0.5 rounded-full cursor-pointer transition-all duration-300 select-none",
        isDark
          ? "bg-zinc-900 border border-zinc-700"
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggle()}
      aria-label="Toggle theme"
    >
      <div className="flex justify-between items-center w-full px-0.5">
        <div
          className={cn(
            "flex justify-center items-center w-5 h-5 rounded-full transition-all duration-300",
            isDark ? "bg-zinc-700 translate-x-0" : "bg-gray-100 translate-x-7"
          )}
        >
          {isDark
            ? <Moon className="w-3 h-3 text-white" strokeWidth={1.5} />
            : <Sun className="w-3 h-3 text-gray-600" strokeWidth={1.5} />}
        </div>
        <div className="flex justify-center items-center w-5 h-5">
          {isDark
            ? <Sun className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
            : <Moon className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />}
        </div>
      </div>
    </div>
  )
}
