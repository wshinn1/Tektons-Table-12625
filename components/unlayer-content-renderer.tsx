"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface UnlayerContentRendererProps {
  htmlContent: string
}

export function UnlayerContentRenderer({ htmlContent }: UnlayerContentRendererProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [allImages, setAllImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowLeft") navigatePrev()
      if (e.key === "ArrowRight") navigateNext()
    },
    [lightboxOpen, currentIndex, allImages],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  // Add click handlers to images after component mounts
  useEffect(() => {
    const container = document.querySelector(".unlayer-content")
    if (!container) return

    const images = container.querySelectorAll("img")
    const imageSrcs: string[] = []

    images.forEach((img, index) => {
      const src = img.getAttribute("src")
      if (src) {
        imageSrcs.push(src)
        img.style.cursor = "pointer"
        img.setAttribute("data-lightbox-index", index.toString())
        img.addEventListener("click", () => {
          setCurrentImage(src)
          setCurrentIndex(index)
          setLightboxOpen(true)
        })
      }
    })

    setAllImages(imageSrcs)

    return () => {
      images.forEach((img) => {
        img.removeEventListener("click", () => {})
      })
    }
  }, [htmlContent])

  const navigatePrev = () => {
    if (allImages.length <= 1) return
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setCurrentImage(allImages[newIndex])
  }

  const navigateNext = () => {
    if (allImages.length <= 1) return
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setCurrentImage(allImages[newIndex])
  }

  return (
    <>
      {/* Render the exported HTML content from Unlayer */}
      <div className="unlayer-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* Styles for Unlayer content */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .unlayer-content {
              width: 100%;
            }
            .unlayer-content img {
              max-width: 100%;
              height: auto;
              transition: opacity 0.2s ease;
            }
            .unlayer-content img:hover {
              opacity: 0.9;
            }
            .unlayer-content a {
              color: inherit;
            }
            .unlayer-content table {
              max-width: 100%;
            }
            @media (max-width: 768px) {
              .unlayer-content table,
              .unlayer-content tbody,
              .unlayer-content tr,
              .unlayer-content td {
                display: block !important;
                width: 100% !important;
              }
            }
          `,
        }}
      />

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navigation - Previous */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigatePrev()
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {/* Image container */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage || "/placeholder.svg"}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Navigation - Next */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateNext()
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
              aria-label="Next image"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
