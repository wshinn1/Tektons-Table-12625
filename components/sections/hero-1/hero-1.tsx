"use client"

import { useEffect, useState, useRef } from "react"
import type React from "react"
import Link from "next/link"
import { Facebook, Instagram, Youtube } from "lucide-react"

interface Hero1Props {
  props: {
    // Content
    headline?: string
    subtitle?: string
    buttonText?: string
    buttonLink?: string
    buttonColor?: string

    // Background
    backgroundType?: "image" | "cdn" | "color"
    backgroundUrl?: string
    backgroundImage?: string
    backgroundColor?: string

    // Overlay
    overlayColor?: string
    overlayOpacity?: number

    // Text colors
    textColor?: string

    // Social links (hidden by default)
    showSocialIcons?: boolean
    facebookUrl?: string
    instagramUrl?: string
    youtubeUrl?: string

    // Pagination dots (hidden by default)
    showPaginationDots?: boolean

    // Blur effects
    enableTopBlur?: boolean
    enableBottomBlur?: boolean
  }
}

export default function Hero1({ props }: Hero1Props) {
  const {
    // Content
    headline = "Discover New Places",
    subtitle = "Stop paying $200+/month for multiple tools. Get fundraising pages, email newsletters, CRM, and more — all in one platform for zero monthly fees.",
    buttonText = "Learn More",
    buttonLink = "/about",
    buttonColor = "#FDB913",

    // Background
    backgroundType = "cdn",
    backgroundUrl = "",
    backgroundImage = "",
    backgroundColor = "#1a1a2e",

    // Overlay
    overlayColor = "#000000",
    overlayOpacity = 50,

    // Text color
    textColor = "#ffffff",

    showSocialIcons = false,
    facebookUrl = "#",
    instagramUrl = "#",
    youtubeUrl = "#",

    showPaginationDots = false,

    // Blur effects
    enableTopBlur = true,
    enableBottomBlur = true,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false)

  const isVideo = backgroundUrl && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(backgroundUrl)

  useEffect(() => {
    if (!isVideo || !backgroundUrl) return

    const deferVideoRender = () => {
      setShouldRenderVideo(true)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(deferVideoRender)
    } else {
      setTimeout(deferVideoRender, 100)
    }
  }, [isVideo, backgroundUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldRenderVideo) return

    const playVideo = async () => {
      try {
        video.muted = true
        await video.play()
        setVideoLoaded(true)
      } catch (error) {
        const handleInteraction = async () => {
          try {
            await video.play()
            setVideoLoaded(true)
            document.removeEventListener("touchstart", handleInteraction)
            document.removeEventListener("click", handleInteraction)
          } catch (e) {
            console.error("[v0] Video play failed:", e)
          }
        }
        document.addEventListener("touchstart", handleInteraction, { once: true })
        document.addEventListener("click", handleInteraction, { once: true })
      }
    }

    video.addEventListener("canplay", playVideo, { once: true })

    return () => {
      video.removeEventListener("canplay", playVideo)
    }
  }, [shouldRenderVideo])

  const getBackgroundStyle = (): React.CSSProperties => {
    if (isVideo) {
      return { backgroundColor: "#000000" }
    }

    if (backgroundType === "color") {
      return { backgroundColor }
    }

    // For both "cdn" and "image" types, use backgroundUrl or backgroundImage
    const imageUrl = backgroundUrl || backgroundImage
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }

    return { backgroundColor }
  }

  return (
    <section
      className="relative min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden"
      style={getBackgroundStyle()}
    >
      {isVideo && backgroundUrl && shouldRenderVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      )}

      {/* Top blur effect */}
      {enableTopBlur && (
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-[1]"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}

      {/* Bottom blur effect */}
      {enableBottomBlur && (
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-[1]"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance italic"
            style={{ color: "#ffffff" }}
          >
            {headline}
          </h1>

          {subtitle && (
            <p
              className="text-base md:text-xl mb-8 leading-relaxed text-pretty max-w-3xl mx-auto"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full transition-transform hover:scale-105 shadow-lg"
              style={{
                backgroundColor: buttonColor,
                color: "#000000",
              }}
            >
              {buttonText}
            </Link>
          )}
        </div>
      </div>

      {showPaginationDots && (
        <div className="absolute bottom-8 left-6 lg:left-12 z-10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: buttonColor }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: textColor, opacity: 0.4 }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: textColor, opacity: 0.4 }} />
        </div>
      )}

      {showSocialIcons && (
        <div className="absolute bottom-8 right-6 lg:right-12 z-10 flex items-center gap-3">
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ borderColor: `${textColor}40`, color: textColor }}
            >
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ borderColor: `${textColor}40`, color: textColor }}
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ borderColor: `${textColor}40`, color: textColor }}
            >
              <Youtube className="w-5 h-5" />
            </a>
          )}
        </div>
      )}
    </section>
  )
}
