"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface FullWidthVisualHeroDisplay1Props {
  // Content
  heading?: string
  subheading?: string
  subheadingItalic?: string
  heading2?: string

  // Background options
  backgroundType?: "image" | "video" | "gradient"
  backgroundImage?: string
  videoUrl?: string
  gradientStart?: string
  gradientEnd?: string
  gradientDirection?: string

  // Image parallax
  enableParallax?: boolean

  // Border options
  showBorder?: boolean
  borderWidth?: number
  borderColor?: string
  borderOpacity?: number

  // Overlay
  overlayColor?: string
  overlayOpacity?: number

  // Text styling
  textColor?: string
  headingFont?: string
  subheadingFont?: string

  // Decorative lines
  showDecorativeLines?: boolean
  decorativeLineColor?: string
  decorativeLineWidth?: number
}

export default function FullWidthVisualHeroDisplay1({
  heading = "WHAT IF YOU FALL?",
  subheading = "",
  subheadingItalic = "but oh my darling",
  heading2 = "WHAT IF YOU FLY?",
  backgroundType = "image",
  backgroundImage = "/inspirational-scene.jpg",
  videoUrl = "",
  gradientStart = "#1e3a5f",
  gradientEnd = "#0f172a",
  gradientDirection = "to bottom right",
  enableParallax = false,
  showBorder = true,
  borderWidth = 2,
  borderColor = "#ffffff",
  borderOpacity = 80,
  overlayColor = "#000000",
  overlayOpacity = 40,
  textColor = "#ffffff",
  headingFont = "sans-serif",
  subheadingFont = "serif",
  showDecorativeLines = true,
  decorativeLineColor = "#ffffff",
  decorativeLineWidth = 60,
}: FullWidthVisualHeroDisplay1Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Defer video loading for performance
  useEffect(() => {
    if (backgroundType !== "video") return

    const deferVideoLoad = () => {
      if (document.readyState === "complete") {
        setTimeout(() => setShouldLoadVideo(true), 2000)
      } else {
        window.addEventListener(
          "load",
          () => {
            setTimeout(() => setShouldLoadVideo(true), 2000)
          },
          { once: true },
        )
      }
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(deferVideoLoad, { timeout: 7000 })
    } else {
      setTimeout(deferVideoLoad, 7000)
    }
  }, [backgroundType])

  // Load and play video when ready
  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current || !videoUrl) return

    const video = videoRef.current
    video.src = videoUrl
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
            // Failed, ignore
          }
        }
        document.addEventListener("touchstart", handleInteraction, { once: true })
        document.addEventListener("click", handleInteraction, { once: true })
      }
    }

    video.addEventListener("canplay", playVideo, { once: true })
  }, [shouldLoadVideo, videoUrl])

  const backgroundStyles = () => {
    if (backgroundType === "gradient") {
      return {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
      }
    }
    if (backgroundType === "image" && !enableParallax) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return {}
  }

  const headingFontClass = headingFont === "serif" ? "font-serif" : headingFont === "mono" ? "font-mono" : "font-sans"
  const subheadingFontClass =
    subheadingFont === "serif" ? "font-serif" : subheadingFont === "mono" ? "font-mono" : "font-sans"

  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      {backgroundType === "image" && backgroundImage && !enableParallax ? (
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt="Hero background"
          fill
          quality={85}
          sizes="100vw"
          loading="lazy"
          className="object-cover"
        />
      ) : backgroundType === "image" && enableParallax ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      ) : backgroundType === "gradient" ? (
        <div className="absolute inset-0" style={backgroundStyles()} />
      ) : backgroundType === "video" && shouldLoadVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : backgroundType === "video" && !shouldLoadVideo ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
          }}
        />
      ) : null}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content Container with Border */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-center min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
        <div
          className="relative w-full max-w-5xl py-16 px-8 md:py-20 md:px-16 flex flex-col items-center justify-center text-center"
          style={
            showBorder
              ? {
                  border: `${borderWidth}px solid ${borderColor}`,
                  borderColor: `${borderColor}${Math.round((borderOpacity / 100) * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                }
              : {}
          }
        >
          {/* Heading 1 */}
          {heading && (
            <h1
              className={`text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-6 ${headingFontClass}`}
              style={{ color: textColor }}
            >
              {heading}
            </h1>
          )}

          {/* Decorative Line 1 */}
          {showDecorativeLines && (
            <div
              className="h-px mb-6"
              style={{
                width: `${decorativeLineWidth}px`,
                backgroundColor: decorativeLineColor,
              }}
            />
          )}

          {/* Subheading (Italic) */}
          {subheadingItalic && (
            <p
              className={`text-2xl md:text-4xl lg:text-5xl italic mb-6 ${subheadingFont === "serif" ? "font-serif" : subheadingFontClass}`}
              style={{ color: textColor }}
            >
              {subheadingItalic}
            </p>
          )}

          {/* Regular Subheading */}
          {subheading && (
            <p className={`text-xl md:text-2xl mb-6 ${headingFontClass}`} style={{ color: textColor }}>
              {subheading}
            </p>
          )}

          {/* Heading 2 */}
          {heading2 && (
            <h2
              className={`text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider mb-6 ${headingFontClass}`}
              style={{ color: textColor }}
            >
              {heading2}
            </h2>
          )}

          {/* Decorative Line 2 */}
          {showDecorativeLines && (
            <div
              className="h-px"
              style={{
                width: `${decorativeLineWidth}px`,
                backgroundColor: decorativeLineColor,
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
