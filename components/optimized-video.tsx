"use client"

import { useEffect, useRef, useState } from "react"

interface OptimizedVideoProps {
  src: string
  poster?: string
  className?: string
  fallbackBg?: string
}

/**
 * Optimized video component that defers loading until after LCP
 * to improve Core Web Vitals (LCP/FCP) scores.
 */
export function OptimizedVideo({ src, poster, className = "", fallbackBg = "#1a1a2e" }: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Use a combination of requestIdleCallback and setTimeout to ensure
    // the video doesn't block LCP
    const deferLoad = () => {
      setShouldLoad(true)
    }

    // Wait for the page to be fully interactive before loading video
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        // Use requestIdleCallback with a timeout to ensure it runs
        const id = requestIdleCallback(deferLoad, { timeout: 2500 })
        return () => cancelIdleCallback(id)
      } else {
        // Fallback for Safari - wait 1.5s after page load
        const timeout = setTimeout(deferLoad, 1500)
        return () => clearTimeout(timeout)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoad || !src) return

    // Set source and load
    video.src = src
    video.load()

    const handleCanPlay = async () => {
      try {
        video.muted = true
        await video.play()
        setIsLoaded(true)
      } catch {
        // Autoplay failed, try on user interaction
        const handleInteraction = async () => {
          try {
            await video.play()
            setIsLoaded(true)
          } catch {
            // Still failed, just show poster/fallback
          }
          document.removeEventListener("touchstart", handleInteraction)
          document.removeEventListener("click", handleInteraction)
        }
        document.addEventListener("touchstart", handleInteraction, { once: true })
        document.addEventListener("click", handleInteraction, { once: true })
      }
    }

    video.addEventListener("canplay", handleCanPlay, { once: true })

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [shouldLoad, src])

  return (
    <>
      {/* Fallback background shown immediately for good LCP */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: fallbackBg,
          backgroundImage: poster ? `url(${poster})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Video loads after LCP */}
      {shouldLoad && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </>
  )
}
