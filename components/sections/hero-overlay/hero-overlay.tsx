"use client"

import { useEffect, useRef } from "react"

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

export function HeroOverlay({
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
      {backgroundType === "video" ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }} />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ color: textColor }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl mb-8" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}
        {buttonText && buttonLink && (
          <a
            href={buttonLink}
            className="inline-block px-8 py-4 rounded-lg font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  )
}
