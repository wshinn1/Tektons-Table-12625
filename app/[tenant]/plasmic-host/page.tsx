"use client"

import { PlasmicCanvasHost, initPlasmicLoader } from "@plasmicapp/loader-nextjs"
import { useEffect, useState } from "react"

export default function PlasmicHost() {
  const [plasmic, setPlasmic] = useState<any>(null)

  useEffect(() => {
    const loader = initPlasmicLoader({
      projects: [
        {
          id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || "",
          token: process.env.NEXT_PUBLIC_PLASMIC_API_TOKEN || "",
        },
      ],
      preview: true,
    })
    setPlasmic(loader)
  }, [])

  if (!plasmic) {
    return <div>Loading Plasmic editor...</div>
  }

  return <PlasmicCanvasHost />
}
