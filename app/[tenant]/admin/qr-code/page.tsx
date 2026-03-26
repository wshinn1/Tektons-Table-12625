"use client"

import { useParams } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Download, QrCode } from "lucide-react"

type DotType = "square" | "dots" | "rounded" | "classy" | "classy-rounded"
type CornerSquareType = "square" | "dot" | "extra-rounded"
type CornerDotType = "square" | "dot"

export default function QRCodePage() {
  const { tenant: subdomain } = useParams() as { tenant: string }
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<any>(null)
  const siteUrl = `https://${subdomain}.tektonstable.com`

  const [size, setSize] = useState(240)
  const [dotType, setDotType] = useState<DotType>("square")
  const [dotColor, setDotColor] = useState("#000000")
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("square")
  const [cornerOuterColor, setCornerOuterColor] = useState("#000000")
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("square")
  const [cornerInnerColor, setCornerInnerColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [transparent, setTransparent] = useState(false)

  useEffect(() => {
    const init = async () => {
      const QRCodeStyling = (await import("qr-code-styling")).default
      const config = {
        width: size,
        height: size,
        data: siteUrl,
        dotsOptions: { type: dotType, color: dotColor },
        cornersSquareOptions: { type: cornerSquareType, color: cornerOuterColor },
        cornersDotOptions: { type: cornerDotType, color: cornerInnerColor },
        backgroundOptions: { color: transparent ? "transparent" : bgColor },
        qrOptions: { errorCorrectionLevel: "H" as const },
      }
      if (!qrInstance.current) {
        qrInstance.current = new QRCodeStyling(config)
        if (qrRef.current) {
          qrRef.current.innerHTML = ""
          qrInstance.current.append(qrRef.current)
        }
      } else {
        qrInstance.current.update(config)
      }
    }
    init()
  }, [size, dotType, dotColor, cornerSquareType, cornerOuterColor, cornerDotType, cornerInnerColor, bgColor, transparent, siteUrl])

  const handleDownload = () => {
    qrInstance.current?.download({ name: `${subdomain}-qr-code`, extension: "png" })
  }

  const dotTypes: { value: DotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dots", label: "Dots" },
    { value: "rounded", label: "Rounded" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Rounded" },
  ]

  const cornerSquareTypes: { value: CornerSquareType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
    { value: "extra-rounded", label: "Extra Rounded" },
  ]

  const cornerDotTypes: { value: CornerDotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
        <p className="text-muted-foreground">Create a customized QR code for your site</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Customize</CardTitle>
            <CardDescription>Adjust the appearance of your QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["colors", "dots", "finder-outer", "finder-inner", "size"]} className="w-full">
              {/* Colors */}
              <AccordionItem value="colors">
                <AccordionTrigger>Colors</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        disabled={transparent}
                        className="w-10 h-10 rounded border cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transparent">Transparent Background</Label>
                    <Switch
                      id="transparent"
                      checked={transparent}
                      onCheckedChange={setTransparent}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Dots Color</Label>
                    <input
                      type="color"
                      value={dotColor}
                      onChange={(e) => setDotColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Finder Outer Color</Label>
                    <input
                      type="color"
                      value={cornerOuterColor}
                      onChange={(e) => setCornerOuterColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Finder Inner Color</Label>
                    <input
                      type="color"
                      value={cornerInnerColor}
                      onChange={(e) => setCornerInnerColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Dots Style */}
              <AccordionItem value="dots">
                <AccordionTrigger>Dots Style</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {dotTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={dotType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDotType(type.value)}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Finder Pattern Outer */}
              <AccordionItem value="finder-outer">
                <AccordionTrigger>Finder Pattern Outer</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {cornerSquareTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={cornerSquareType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCornerSquareType(type.value)}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Finder Pattern Inner */}
              <AccordionItem value="finder-inner">
                <AccordionTrigger>Finder Pattern Inner</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {cornerDotTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={cornerDotType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCornerDotType(type.value)}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Size */}
              <AccordionItem value="size">
                <AccordionTrigger>Size</AccordionTrigger>
                <AccordionContent className="pt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Size: {size}px</Label>
                  </div>
                  <Slider
                    value={[size]}
                    onValueChange={([value]) => setSize(value)}
                    min={128}
                    max={512}
                    step={8}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Preview + Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your Page QR Code
            </CardTitle>
            <CardDescription>{siteUrl}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div 
              className="p-4 bg-white rounded-xl border flex items-center justify-center" 
              style={{ minHeight: 280 }}
            >
              <div ref={qrRef} />
            </div>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
