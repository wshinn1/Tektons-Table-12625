"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Youtube } from "lucide-react"

interface Hero1Props {
  props: {
    // Content
    subtitle?: string
    headline?: string
    description?: string
    buttonText?: string
    buttonLink?: string
    buttonColor?: string

    // Background
    backgroundType?: "image" | "cdn" | "gradient" | "video"
    backgroundImage?: string
    cdnLink?: string
    videoUrl?: string
    gradientStart?: string
    gradientEnd?: string
    gradientDirection?: string

    // Overlay
    overlayColor?: string
    overlayOpacity?: number

    // Text colors
    textColor?: string

    // Social links
    showSocialIcons?: boolean
    facebookUrl?: string
    instagramUrl?: string
    youtubeUrl?: string

    // Pagination dots (for visual similarity, static)
    showPaginationDots?: boolean
  }
}

export default function Hero1({ props }: Hero1Props) {
  const {
    // Content
    subtitle = "WELCOME",
    headline = "Discover New Places",
    description = "These cases are perfectly simple and easy to distinguish. In a free hour when our power of choice is untrammelled and when nothing prevents our being able to do what we like best every pleasure.",
    buttonText = "Learn More",
    buttonLink = "/about",
    buttonColor = "#2563eb",

    // Background
    backgroundType = "image",
    backgroundImage = "/majestic-mountain-vista.png",
    cdnLink = "",
    videoUrl = "",
    gradientStart = "#1a1a2e",
    gradientEnd = "#16213e",
    gradientDirection = "to-br",

    // Overlay
    overlayColor = "#000000",
    overlayOpacity = 40,

    // Text color
    textColor = "#ffffff",

    // Social links
    showSocialIcons = true,
    facebookUrl = "#",
    instagramUrl = "#",
    youtubeUrl = "#",

    // Pagination dots
    showPaginationDots = true,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false)

  const isVideo =
    backgroundType === "video" ||
    (videoUrl && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(videoUrl)) ||
    (cdnLink && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(cdnLink))

  const actualVideoUrl = videoUrl || (isVideo && cdnLink ? cdnLink : "")

  useEffect(() => {
    if (!isVideo || !actualVideoUrl) return

    const deferVideoRender = () => {
      setShouldRenderVideo(true)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(deferVideoRender)
    } else {
      setTimeout(deferVideoRender, 2000)
    }
  }, [isVideo, actualVideoUrl])

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
            // Still failed, ignore
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
      return { backgroundColor: "#1a1a2e" } // Fallback color while video loads
    }

    switch (backgroundType) {
      case "image":
        return backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#1a1a2e" }
      case "cdn":
        return cdnLink
          ? {
              backgroundImage: `url(${cdnLink})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#1a1a2e" }
      case "gradient":
        const direction = gradientDirection.replace("to-", "to ")
        return {
          background: `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`,
        }
      default:
        return { backgroundColor: "#1a1a2e" }
    }
  }

  return (
    <section
      className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden"
      style={getBackgroundStyle()}
    >
      {isVideo && actualVideoUrl && shouldRenderVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <source src={actualVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-2xl">
          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-sm md:text-base font-semibold tracking-widest uppercase mb-4"
              style={{ color: textColor, opacity: 0.9 }}
            >
              {subtitle}
            </p>
          )}

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance"
            style={{ color: textColor }}
          >
            {headline}
          </h1>

          {/* Description */}
          {description && (
            <p
              className="text-base md:text-lg mb-8 leading-relaxed text-pretty max-w-xl"
              style={{ color: textColor, opacity: 0.85 }}
            >
              {description}
            </p>
          )}

          {/* CTA Button */}
          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonColor,
                color: "#ffffff",
              }}
            >
              {buttonText}
            </Link>
          )}
        </div>
      </div>

      {/* Pagination Dots */}
      {showPaginationDots && (
        <div className="absolute bottom-8 left-6 lg:left-12 z-10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: buttonColor }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: textColor, opacity: 0.4 }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: textColor, opacity: 0.4 }} />
        </div>
      )}

      {/* Social Icons */}
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
