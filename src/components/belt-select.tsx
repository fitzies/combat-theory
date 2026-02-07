"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

export interface BeltColor {
  name: string
  hex: string
  barHex?: string
}

const BJJ_BELTS: BeltColor[] = [
  { name: "White", hex: "#f5f5f0" },
  { name: "Blue", hex: "#1e40af" },
  { name: "Purple", hex: "#6b21a8" },
  { name: "Brown", hex: "#78350f" },
  { name: "Black", hex: "#1a1a1a", barHex: "#dc2626" },
]

const JUDO_BELTS: BeltColor[] = [
  { name: "White", hex: "#f5f5f0" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#1e40af" },
  { name: "Brown", hex: "#78350f" },
  { name: "Black", hex: "#1a1a1a" },
]

const KARATE_BELTS: BeltColor[] = [
  { name: "White", hex: "#f5f5f0" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#1e40af" },
  { name: "Purple", hex: "#6b21a8" },
  { name: "Brown", hex: "#78350f" },
  { name: "Black", hex: "#1a1a1a" },
]

const TAEKWONDO_BELTS: BeltColor[] = [
  { name: "White", hex: "#f5f5f0" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#1e40af" },
  { name: "Red", hex: "#dc2626" },
  { name: "Black", hex: "#1a1a1a" },
]

export const BELT_CONFIGS: Record<
  string,
  { belts: BeltColor[]; maxStripes: number; maxDan: number }
> = {
  "Brazilian Jiu-Jitsu": { belts: BJJ_BELTS, maxStripes: 4, maxDan: 6 },
  Judo: { belts: JUDO_BELTS, maxStripes: 0, maxDan: 10 },
  Karate: { belts: KARATE_BELTS, maxStripes: 0, maxDan: 10 },
  Taekwondo: { belts: TAEKWONDO_BELTS, maxStripes: 0, maxDan: 10 },
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

interface BeltSelectorProps {
  belts: BeltColor[]
  maxStripes?: number
  maxDan?: number
  initialBelt?: string
  initialStripe?: number
  initialDan?: number
  onChange?: (belt: string, stripe: number, dan: number) => void
  className?: string
}

export function BeltSelector({
  belts,
  maxStripes = 0,
  maxDan = 0,
  initialBelt,
  initialStripe = 0,
  initialDan = 0,
  onChange,
  className,
}: BeltSelectorProps) {
  const initialIndex = initialBelt
    ? Math.max(0, belts.findIndex((b) => b.name === initialBelt))
    : 0

  const [beltIndex, setBeltIndex] = useState(initialIndex)
  const [stripes, setStripes] = useState(initialStripe)
  const [dan, setDan] = useState(initialDan)

  const belt = belts[beltIndex]
  const isLastBelt = beltIndex === belts.length - 1
  const isFirstBelt = beltIndex === 0
  const isLight = belt.hex === "#f5f5f0" || belt.hex === "#ffffff"
  const barColor = belt.barHex ?? "#1a1a1a"

  const fireChange = useCallback(
    (idx: number, s: number, d: number) => {
      const isLast = idx === belts.length - 1
      onChange?.(belts[idx].name, isLast ? 0 : s, isLast ? d : 0)
    },
    [belts, onChange],
  )

  const increment = useCallback(() => {
    if (isLastBelt) {
      if (dan >= maxDan) return
      const next = dan + 1
      setDan(next)
      fireChange(beltIndex, stripes, next)
    } else if (stripes < maxStripes) {
      const next = stripes + 1
      setStripes(next)
      fireChange(beltIndex, next, dan)
    } else {
      const next = beltIndex + 1
      setBeltIndex(next)
      setStripes(0)
      setDan(0)
      fireChange(next, 0, 0)
    }
  }, [beltIndex, stripes, dan, maxStripes, maxDan, isLastBelt, fireChange])

  const decrement = useCallback(() => {
    if (isLastBelt && dan > 0) {
      const next = dan - 1
      setDan(next)
      fireChange(beltIndex, stripes, next)
    } else if (isLastBelt && dan === 0) {
      const next = beltIndex - 1
      setBeltIndex(next)
      setStripes(maxStripes)
      setDan(0)
      fireChange(next, maxStripes, 0)
    } else if (stripes > 0) {
      const next = stripes - 1
      setStripes(next)
      fireChange(beltIndex, next, dan)
    } else if (!isFirstBelt) {
      const next = beltIndex - 1
      setBeltIndex(next)
      setStripes(maxStripes)
      setDan(0)
      fireChange(next, maxStripes, 0)
    }
  }, [beltIndex, stripes, dan, maxStripes, isLastBelt, isFirstBelt, fireChange])

  const atMin = isFirstBelt && stripes === 0
  const atMax = isLastBelt && dan >= maxDan

  // Visual: stripes for non-black, gold dan markers for black
  const markerCount = isLastBelt ? dan : stripes
  const markerColor = isLastBelt ? "#d4a843" : "#f5f5f0"

  // Label
  let label = `${belt.name} Belt`
  if (isLastBelt && dan > 0) {
    label += ` · ${ordinal(dan)} Dan`
  } else if (!isLastBelt && stripes > 0) {
    label += ` · ${stripes} Stripe${stripes !== 1 ? "s" : ""}`
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        {label}
      </p>

      <div
        className="relative w-60"
        role="img"
        aria-label={label}
      >
        <div
          className={cn(
            "relative h-14 rounded-sm overflow-hidden shadow-lg",
            isLight && "ring-1 ring-inset ring-foreground/10",
          )}
        >
          <div className="absolute inset-0" style={{ backgroundColor: belt.hex }} />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-end pr-2.5 gap-[3px]"
            style={{ backgroundColor: barColor }}
          >
            {Array.from({ length: markerCount }).map((_, i) => (
              <div
                key={i}
                className="h-full w-1"
                style={{ backgroundColor: markerColor }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={decrement}
          disabled={atMin}
          aria-label="Decrease rank"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border border-border transition-colors",
            atMin
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-accent active:scale-95",
          )}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={increment}
          disabled={atMax}
          aria-label="Increase rank"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border border-border transition-colors",
            atMax
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-accent active:scale-95",
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
