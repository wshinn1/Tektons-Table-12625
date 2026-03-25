"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronUp } from "lucide-react"

export function CollapsibleCTA({ subdomain }: { subdomain: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isExpanded && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 100)
    }
  }, [isExpanded])

  return (
    <section ref={sectionRef} className="relative w-full z-50 bg-white border-t border-gray-200 shadow-lg mt-auto">
      {/* Button bar - always visible at bottom */}
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center cursor-pointer group py-4"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse call to action" : "Expand call to action"}
        >
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:underline">Partner with Me</h2>
            <ChevronUp
              className={`h-5 w-5 text-gray-900 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          position: isExpanded ? "relative" : "absolute",
          bottom: isExpanded ? "auto" : "100%",
          left: 0,
          right: 0,
          background: "white",
        }}
      >
        <div className="container mx-auto px-4 max-w-4xl border-t border-gray-100">
          <div className="text-center space-y-4 py-6">
            <p className="text-sm text-pretty text-gray-600">
              Your support makes a real difference in the lives of those we serve.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="default" variant="default" asChild>
                <Link href={`/${subdomain}/giving`}>Make a Donation</Link>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-50 bg-transparent"
                asChild
              >
                <Link href={`/${subdomain}/contact`}>Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
