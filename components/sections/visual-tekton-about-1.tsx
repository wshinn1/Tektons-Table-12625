"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface VisualTektonAbout1Props {
  label?: string
  headline?: string
  body1?: string
  body2?: string
  body3?: string
  media1_type?: "image" | "cdn"
  media1_url?: string
  media2_type?: "image" | "cdn"
  media2_url?: string
  button_text?: string
  button_url?: string
}

export default function VisualTektonAbout1({
  label = "EMPOWERING BRANDS WITH CREATIVITY",
  headline = "We craft & elevate digital experiences",
  body1 = "Algenix is a forward-thinking IT and digital agency dedicated to transforming businesses through innovative technology solutions.",
  body2 = "Our brand strategy service helps businesses define their identity and position in the market. We conduct thorough research and analysis to create a unique brand narrative that resonates with target audiences, ensuring long-term success.",
  body3 = "We value creativity, collaboration, and customer focus, ensuring that every project reflects our commitment to quality and client satisfaction. Founded in 2015, we have established ourselves as a trusted partner for businesses looking to enhance their digital footprint.",
  media1_type = "image",
  media1_url = "/woman-with-headphones-relaxing.jpg",
  media2_type = "image",
  media2_url = "/people-walking-motion-blur.jpg",
  button_text = "",
  button_url = "",
}: VisualTektonAbout1Props) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const [video1Loaded, setVideo1Loaded] = useState(false)
  const [video2Loaded, setVideo2Loaded] = useState(false)
  const [shouldLoadVideos, setShouldLoadVideos] = useState(false)

  useEffect(() => {
    const hasVideos = media1_type === "cdn" || media2_type === "cdn"
    if (!hasVideos) return

    const deferVideoLoad = () => {
      setShouldLoadVideos(true)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(deferVideoLoad, { timeout: 3000 })
    } else {
      setTimeout(deferVideoLoad, 1000)
    }
  }, [media1_type, media2_type])

  useEffect(() => {
    if (!shouldLoadVideos) return

    const loadAndPlayVideo = (video: HTMLVideoElement | null, url: string, setLoaded: (v: boolean) => void) => {
      if (!video || !url) return

      video.src = url
      video.load()

      const playVideo = async () => {
        try {
          video.muted = true
          await video.play()
          setLoaded(true)
        } catch (error) {
          const handleInteraction = async () => {
            try {
              await video.play()
              setLoaded(true)
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

    if (media1_type === "cdn" && media1_url) {
      loadAndPlayVideo(video1Ref.current, media1_url, setVideo1Loaded)
    }
    if (media2_type === "cdn" && media2_url) {
      loadAndPlayVideo(video2Ref.current, media2_url, setVideo2Loaded)
    }
  }, [media1_type, media1_url, media2_type, media2_url, shouldLoadVideos])

  const renderMedia = (
    type: "image" | "cdn",
    url: string,
    alt: string,
    className: string,
    videoRef?: React.RefObject<HTMLVideoElement | null>,
    videoLoaded?: boolean,
  ) => {
    if (type === "cdn") {
      if (!shouldLoadVideos) {
        // Return a placeholder div while waiting for video
        return <div className={`w-full h-full ${className} bg-muted`} />
      }
      return (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          className={`w-full h-full ${className} transition-opacity duration-500 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        >
          {/* Source added dynamically via useEffect */}
        </video>
      )
    }
    return (
      <Image
        src={url || "/placeholder.svg"}
        alt={alt}
        fill
        className={className}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    )
  }

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column */}
          <div className="flex flex-col">
            {label && (
              <span className="text-xs md:text-sm font-semibold tracking-widest text-neutral-800 uppercase mb-4">
                {label}
              </span>
            )}

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-neutral-900 leading-tight mb-8 text-balance">
              {headline}
            </h2>

            {body1 && <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-4">{body1}</p>}
            {body2 && <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-16 lg:mb-24">{body2}</p>}

            {/* Media 1 - Bottom Left */}
            {media1_url && (
              <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden bg-muted">
                {renderMedia(media1_type, media1_url, "Team member", "object-cover", video1Ref, video1Loaded)}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {/* Media 2 - Tall Right */}
            {media2_url && (
              <div className="relative w-full aspect-[11/16] rounded-2xl overflow-hidden mb-16 lg:mb-24 bg-muted">
                {renderMedia(media2_type, media2_url, "Office space", "object-cover", video2Ref, video2Loaded)}
              </div>
            )}

            {body3 && <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-xl">{body3}</p>}
          </div>
        </div>

        {button_text && button_url && (
          <div className="flex justify-center mt-12 md:mt-16">
            <Link
              href={button_url}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors duration-200"
            >
              {button_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
