"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type StatItem = {
  value: string
  description: string
  delay: number
}
type DataPoint = {
  id: number
  left: number
  top: number
  height: number
  direction: "up" | "down"
  delay: number
}
const stats: StatItem[] = [
  {
    value: "500+",
    description: "Techniques\ntaught",
    delay: 0,
  },
  {
    value: "8",
    description: "Martial arts\ndisciplines",
    delay: 0.2,
  },
  {
    value: "100+",
    description: "Structured\nlessons",
    delay: 0.4,
  },
  {
    value: "Expert",
    description: "Instructor-led\ncourses",
    delay: 0.6,
  },
]

const generateDataPoints = (): DataPoint[] => {
  const points: DataPoint[] = []
  const baseLeft = 1
  const spacing = 32
  for (let i = 0; i < 50; i++) {
    const direction = i % 2 === 0 ? "down" : "up"
    const height = Math.floor(Math.random() * 120) + 88
    const top = direction === "down" ? Math.random() * 150 + 250 : Math.random() * 100 - 80
    points.push({
      id: i,
      left: baseLeft + i * spacing,
      top,
      height,
      direction,
      delay: i * 0.035,
    })
  }
  return points
}

// @component: BankingScaleHero
export const Features = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [dataPoints] = useState<DataPoint[]>(generateDataPoints())
  const [typingComplete, setTypingComplete] = useState(false)
  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setTypingComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // @return
  return (
    <div className="w-full overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl md:px-0! px-8 py-24 pt-16">
        <div className="grid grid-cols-12 gap-5 gap-y-16">
          <div className="col-span-12 md:col-span-6 relative z-10">
            <div className="relative h-6 inline-flex items-center font-mono uppercase text-xs text-primary mb-12 px-2">
              <div className="flex items-center gap-0.5 overflow-hidden">
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "auto",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="block whitespace-nowrap overflow-hidden text-primary relative z-10"
                >
                  Built for serious fighters
                </motion.span>
                <motion.span
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: typingComplete ? [1, 0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="block w-1.5 h-3 bg-primary ml-0.5 relative z-10 rounded-sm"
                />
              </div>
            </div>

            <h2 className="text-[40px] font-normal leading-tight tracking-tight text-foreground mb-6">
              Structured learning systems{" "}
              <span className="text-muted-foreground">
                that break down complex techniques into clear, actionable steps.
              </span>
            </h2>

            <p className="text-lg leading-6 text-muted-foreground mt-0 mb-6">
              Master BJJ, Boxing, MMA, and more through step-by-step courses designed by expert instructors. Track your progress, build skills systematically, and accelerate your development.
            </p>

            <Button asChild variant="outline" className="mt-5 group bg-transparent">
              <Link href={"/courses"}>
                <span className="relative z-10 flex items-center gap-1">
                  Explore courses
                  <ArrowRight className="w-4 h-4 -mr-1 transition-transform duration-150 group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="relative w-full h-[416px] -ml-[200px]">
              <div className="absolute top-0 left-[302px] w-[680px] h-[416px] pointer-events-none">
                <div className="relative w-full h-full">
                  {dataPoints.map((point) => (
                    <motion.div
                      key={point.id}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={
                        isVisible
                          ? {
                            opacity: [0, 1, 1],
                            height: [0, point.height, point.height],
                          }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        delay: point.delay,
                        ease: [0.5, 0, 0.01, 1],
                      }}
                      className="absolute w-1.5 rounded-[3px] bg-muted"
                      style={{
                        left: `${point.left}px`,
                        top: `${point.top}px`,
                      }}
                    >
                      <motion.div
                        initial={{
                          opacity: 0,
                        }}
                        animate={
                          isVisible
                            ? {
                              opacity: [0, 1],
                            }
                            : {}
                        }
                        transition={{
                          duration: 0.3,
                          delay: point.delay + 1.7,
                        }}
                        className="absolute -left-[1px] w-2 h-2 bg-primary rounded-full"
                        style={{
                          top: point.direction === "down" ? "0px" : `${point.height - 8}px`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="overflow-visible pb-5">
              <div className="grid grid-cols-12 gap-5 relative z-10">
                {stats.map((stat, index) => (
                  <div key={index} className="col-span-6 md:col-span-3">
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                        filter: "blur(4px)",
                      }}
                      animate={
                        isVisible
                          ? {
                            opacity: [0, 1, 1],
                            y: [20, 0, 0],
                            filter: ["blur(4px)", "blur(0px)", "blur(0px)"],
                          }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        delay: stat.delay,
                        ease: [0.1, 0, 0.1, 1],
                      }}
                      className="flex flex-col gap-2"
                    >
                      <span className="text-2xl font-medium leading-[26.4px] tracking-tight text-primary">
                        {stat.value}
                      </span>
                      <p className="text-xs leading-[13.2px] text-muted-foreground m-0 whitespace-pre-line">
                        {stat.description}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}