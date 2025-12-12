"use client"

import { useEffect, useRef, useState } from "react"

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
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false)

  useEffect(() => {
    if (backgroundType !== "video") return

    const deferVideoRender = () => {
      setShouldRenderVideo(true)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(deferVideoRender)
    } else {
      setTimeout(deferVideoRender, 2000)
    }
  }, [backgroundType])

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

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundType === "video" ? (
        <>
          {/* Fallback background while video loads */}
          <div className="absolute inset-0 bg-neutral-900" style={{ zIndex: 0 }} />
          {shouldRenderVideo && (
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
              style={{ zIndex: 0 }}
            >
              <source src={backgroundUrl} type="video/mp4" />
            </video>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }} />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100,
          zIndex: 1,
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
