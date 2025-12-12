"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroOverlayProps {
  title: string
  subtitle?: string
  backgroundType: "image" | "video"
  backgroundUrl: string
  overlayColor: string
  overlayOpacity: number
  textColor: string
  buttonText?: string
  buttonLink?: string
  buttonColor: string
}

function parseOpacity(value: any): number {
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return 40 // Safe default
  }
  return Math.max(0, Math.min(100, num)) // Clamp between 0-100
}

export default function HeroOverlay({
  title,
  subtitle,
  backgroundType,
  backgroundUrl,
  overlayColor,
  overlayOpacity,
  textColor,
  buttonText,
  buttonLink,
  buttonColor,
}: HeroOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const safeOpacity = parseOpacity(overlayOpacity)

  useEffect(() => {
    const video = videoRef.current
    if (video && backgroundType === "video") {
      const playVideo = async () => {
        try {
          video.muted = true
          await video.play()
        } catch (error) {
          const handleInteraction = async () => {
            try {
              await video.play()
              document.removeEventListener("touchstart", handleInteraction)
              document.removeEventListener("click", handleInteraction)
            } catch (e) {
              // Still failed, ignore
            }
          }
          document.addEventListener("touchstart", handleInteraction, { once: true })
          document.addEventListener("click", handleInteraction, { once: true })
        }
      }
      playVideo()
    }
  }, [backgroundType, backgroundUrl])

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundType === "image" ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }} />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: safeOpacity / 100,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance" style={{ color: textColor }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-pretty" style={{ color: textColor, opacity: 0.9 }}>
            {subtitle}
          </p>
        )}
        {buttonText && buttonLink && (
          <Button size="lg" style={{ backgroundColor: buttonColor }} asChild>
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
