"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface HeroCenteredProps {
  props: {
    // Content
    heading?: string
    subheading?: string
    buttonText?: string
    buttonLink?: string
    buttonStyle?: "solid" | "outline"
    buttonColor?: string
    buttonTextColor?: string

    // Background
    backgroundType?: "image" | "video" | "gradient"
    backgroundImage?: string
    videoUrl?: string
    gradientStart?: string
    gradientEnd?: string
    gradientDirection?: string
    posterImage?: string

    // Overlay
    overlayColor?: string
    overlayOpacity?: number

    // Blur effects (top and bottom)
    enableBlur?: boolean
    blurIntensity?: number

    // Text styling
    textColor?: string
    headingFont?: "serif" | "sans" | "italic-serif"

    // Height
    minHeight?: string
  }
}

export default function HeroCentered({ props }: HeroCenteredProps) {
  const {
    // Content
    heading = "Everything missionaries need to raise support",
    subheading = "Replace 4+ tools with one platform. Save thousands per year. Built specifically for support-raising missionaries.",
    buttonText = "Get Started Free",
    buttonLink = "/auth/signup",
    buttonStyle = "solid",
    buttonColor = "#FACC15",
    buttonTextColor = "#1a1a1a",

    // Background
    backgroundType = "gradient",
    backgroundImage = "",
    videoUrl = "",
    gradientStart = "#1a1a2e",
    gradientEnd = "#16213e",
    gradientDirection = "to bottom",
    posterImage = "",

    // Overlay
    overlayColor = "#000000",
    overlayOpacity = 30,

    // Blur effects
    enableBlur = true,
    blurIntensity = 40,

    // Text styling
    textColor = "#ffffff",
    headingFont = "italic-serif",

    // Height
    minHeight = "100vh",
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const isVideo =
    backgroundType === "video" ||
    (videoUrl && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(videoUrl)) ||
    (backgroundImage && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(backgroundImage))

  const actualVideoUrl = videoUrl || (isVideo ? backgroundImage : "")

  useEffect(() => {
    const video = videoRef.current
    if (video && isVideo && actualVideoUrl) {
      // Wait for idle time before loading video
      const loadVideo = () => {
        video.src = actualVideoUrl
        video.load()

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
      }

      // Use requestIdleCallback for non-critical video loading
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadVideo, { timeout: 2000 })
      } else {
        setTimeout(loadVideo, 100)
      }
    }
  }, [isVideo, actualVideoUrl])

  const getBackgroundStyle = (): React.CSSProperties => {
    if (isVideo) {
      if (posterImage) {
        return {
          backgroundImage: `url(${posterImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      }
      return {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
      }
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
      case "gradient":
        return {
          background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
        }
      default:
        return { backgroundColor: "#1a1a2e" }
    }
  }

  const getHeadingFontClass = () => {
    switch (headingFont) {
      case "italic-serif":
        return "font-serif italic"
      case "serif":
        return "font-serif"
      case "sans":
      default:
        return "font-sans"
    }
  }

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        ...getBackgroundStyle(),
        minHeight,
      }}
    >
      {isVideo && actualVideoUrl && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={posterImage || undefined}
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ zIndex: 0 }}
        >
          {/* Source added dynamically after initial paint */}
        </video>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
          zIndex: 1,
        }}
      />

      {enableBlur && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: `${blurIntensity}%`,
            background: `linear-gradient(to bottom, ${overlayColor}CC, transparent)`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            maskImage: "linear-gradient(to bottom, black 30%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent)",
            zIndex: 2,
          }}
        />
      )}

      {enableBlur && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: `${blurIntensity}%`,
            background: `linear-gradient(to top, ${overlayColor}CC, transparent)`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            maskImage: "linear-gradient(to top, black 30%, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
            zIndex: 2,
          }}
        />
      )}

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance ${getHeadingFontClass()}`}
          style={{ color: textColor }}
        >
          {heading}
        </h1>

        {subheading && (
          <p
            className="text-base sm:text-lg md:text-xl mb-10 leading-relaxed max-w-3xl mx-auto text-pretty"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {subheading}
          </p>
        )}

        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className={`inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-semibold rounded-full transition-all hover:scale-105 hover:shadow-lg ${
              buttonStyle === "outline" ? "border-2 bg-transparent" : ""
            }`}
            style={{
              backgroundColor: buttonStyle === "solid" ? buttonColor : "transparent",
              color: buttonStyle === "solid" ? buttonTextColor : buttonColor,
              borderColor: buttonColor,
            }}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  )
}
