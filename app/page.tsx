"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Download, Copy, Check, Move, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ParticipationCardGenerator() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [cropPosition, setCropPosition] = useState({ x: 100, y: 50 })
  const [cropSize, setCropSize] = useState(150)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const { toast } = useToast()

  const linkedInPost =
    "I attended Zero to Maker by Tinkerhub and I would like to share a small experience from it. It was an amazing journey of learning, building, and connecting with like-minded makers! 🚀 #Tinkerhub #ZeroToMaker #MBCCET"

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
        setShowCropper(true)
        setCroppedPhoto(null)
        setGeneratedCard(null)
        
        // Set initial crop position and size based on screen size
        const containerWidth = Math.min(400, window.innerWidth - 40)
        const centerX = containerWidth / 2
        const centerY = (containerWidth * 0.75) / 2
        const defaultSize = Math.min(150, containerWidth * 0.4)
        
        setCropPosition({ 
          x: centerX - defaultSize / 2, 
          y: centerY - defaultSize / 2 
        })
        setCropSize(defaultSize)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = cropCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    const handleSize = 30 // Larger for mobile
    const edgeThreshold = 15 // Distance from edge to trigger resize

    // Check for corner handles (priority over edges)
    // Top-left
    if (x >= cropPosition.x - handleSize/2 && x <= cropPosition.x + handleSize/2 &&
        y >= cropPosition.y - handleSize/2 && y <= cropPosition.y + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('top-left')
      return
    }
    // Top-right
    if (x >= cropPosition.x + cropSize - handleSize/2 && x <= cropPosition.x + cropSize + handleSize/2 &&
        y >= cropPosition.y - handleSize/2 && y <= cropPosition.y + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('top-right')
      return
    }
    // Bottom-left
    if (x >= cropPosition.x - handleSize/2 && x <= cropPosition.x + handleSize/2 &&
        y >= cropPosition.y + cropSize - handleSize/2 && y <= cropPosition.y + cropSize + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('bottom-left')
      return
    }
    // Bottom-right
    if (x >= cropPosition.x + cropSize - handleSize/2 && x <= cropPosition.x + cropSize + handleSize/2 &&
        y >= cropPosition.y + cropSize - handleSize/2 && y <= cropPosition.y + cropSize + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('bottom-right')
      return
    }

    // Check for edge handles
    // Top edge
    if (x >= cropPosition.x + edgeThreshold && x <= cropPosition.x + cropSize - edgeThreshold &&
        y >= cropPosition.y - handleSize/2 && y <= cropPosition.y + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('top')
      return
    }
    // Bottom edge
    if (x >= cropPosition.x + edgeThreshold && x <= cropPosition.x + cropSize - edgeThreshold &&
        y >= cropPosition.y + cropSize - handleSize/2 && y <= cropPosition.y + cropSize + handleSize/2) {
      setIsResizing(true)
      setResizeHandle('bottom')
      return
    }
    // Left edge
    if (x >= cropPosition.x - handleSize/2 && x <= cropPosition.x + handleSize/2 &&
        y >= cropPosition.y + edgeThreshold && y <= cropPosition.y + cropSize - edgeThreshold) {
      setIsResizing(true)
      setResizeHandle('left')
      return
    }
    // Right edge
    if (x >= cropPosition.x + cropSize - handleSize/2 && x <= cropPosition.x + cropSize + handleSize/2 &&
        y >= cropPosition.y + edgeThreshold && y <= cropPosition.y + cropSize - edgeThreshold) {
      setIsResizing(true)
      setResizeHandle('right')
      return
    }

    // Check if clicking inside crop area for dragging
    if (
      x >= cropPosition.x &&
      x <= cropPosition.x + cropSize &&
      y >= cropPosition.y &&
      y <= cropPosition.y + cropSize
    ) {
      setIsDragging(true)
      setDragOffset({
        x: x - cropPosition.x,
        y: y - cropPosition.y,
      })
    }
  }

  const handleCropMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = cropCanvasRef.current
    if (!canvas || (!isDragging && !isResizing)) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      if (isResizing && resizeHandle) {
        let newX = cropPosition.x
        let newY = cropPosition.y
        let newSize = cropSize

        const minSize = 50

        switch (resizeHandle) {
          case 'top-left':
            newX = Math.min(x, cropPosition.x + cropSize - minSize)
            newY = Math.min(y, cropPosition.y + cropSize - minSize)
            newSize = Math.max(minSize, cropPosition.x + cropSize - newX, cropPosition.y + cropSize - newY)
            newSize = Math.min(newSize, cropPosition.x + cropSize, cropPosition.y + cropSize)
            newX = cropPosition.x + cropSize - newSize
            newY = cropPosition.y + cropSize - newSize
            break
          case 'top-right':
            newY = Math.min(y, cropPosition.y + cropSize - minSize)
            newSize = Math.max(minSize, x - cropPosition.x, cropPosition.y + cropSize - newY)
            newSize = Math.min(newSize, canvas.width - cropPosition.x, cropPosition.y + cropSize)
            newY = cropPosition.y + cropSize - newSize
            break
          case 'bottom-left':
            newX = Math.min(x, cropPosition.x + cropSize - minSize)
            newSize = Math.max(minSize, cropPosition.x + cropSize - newX, y - cropPosition.y)
            newSize = Math.min(newSize, cropPosition.x + cropSize, canvas.height - cropPosition.y)
            newX = cropPosition.x + cropSize - newSize
            break
          case 'bottom-right':
            newSize = Math.max(minSize, Math.min(x - cropPosition.x, y - cropPosition.y))
            newSize = Math.min(newSize, canvas.width - cropPosition.x, canvas.height - cropPosition.y)
            break
          case 'top':
            newY = Math.min(y, cropPosition.y + cropSize - minSize)
            newSize = Math.max(minSize, cropPosition.y + cropSize - newY)
            newSize = Math.min(newSize, cropPosition.y + cropSize)
            newY = cropPosition.y + cropSize - newSize
            break
          case 'bottom':
            newSize = Math.max(minSize, y - cropPosition.y)
            newSize = Math.min(newSize, canvas.height - cropPosition.y)
            break
          case 'left':
            newX = Math.min(x, cropPosition.x + cropSize - minSize)
            newSize = Math.max(minSize, cropPosition.x + cropSize - newX)
            newSize = Math.min(newSize, cropPosition.x + cropSize)
            newX = cropPosition.x + cropSize - newSize
            break
          case 'right':
            newSize = Math.max(minSize, x - cropPosition.x)
            newSize = Math.min(newSize, canvas.width - cropPosition.x)
            break
        }

        setCropPosition({ x: newX, y: newY })
        setCropSize(newSize)
      } else if (isDragging) {
        const newX = Math.max(0, Math.min(x - dragOffset.x, canvas.width - cropSize))
        const newY = Math.max(0, Math.min(y - dragOffset.y, canvas.height - cropSize))
        setCropPosition({ x: newX, y: newY })
      }
    })
  }

  const handleCropEnd = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const drawCropPreview = useCallback(() => {
    const canvas = cropCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !photoPreview) return

    const img = new Image()
    img.onload = () => {
      // Set canvas dimensions based on container/screen size
      const containerWidth = Math.min(400, window.innerWidth - 40)
      const containerHeight = Math.round(containerWidth * 0.75) // 4:3 aspect ratio
      
      canvas.width = containerWidth
      canvas.height = containerHeight

      const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (containerWidth - scaledWidth) / 2
      const offsetY = (containerHeight - scaledHeight) / 2

      // Clear canvas
      ctx.clearRect(0, 0, containerWidth, containerHeight)
      
      // Draw the full image first
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

      // Draw overlay (darkened areas outside crop)
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, containerWidth, containerHeight)

      // Clear and redraw the crop area (bright/unmasked area)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(cropPosition.x, cropPosition.y, cropSize, cropSize)
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

      // Draw crop border
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 3
      ctx.strokeRect(cropPosition.x, cropPosition.y, cropSize, cropSize)

      // Draw grid lines for rule of thirds
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(cropPosition.x + cropSize / 3, cropPosition.y)
      ctx.lineTo(cropPosition.x + cropSize / 3, cropPosition.y + cropSize)
      ctx.moveTo(cropPosition.x + (cropSize * 2) / 3, cropPosition.y)
      ctx.lineTo(cropPosition.x + (cropSize * 2) / 3, cropPosition.y + cropSize)
      ctx.stroke()
      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(cropPosition.x, cropPosition.y + cropSize / 3)
      ctx.lineTo(cropPosition.x + cropSize, cropPosition.y + cropSize / 3)
      ctx.moveTo(cropPosition.x, cropPosition.y + (cropSize * 2) / 3)
      ctx.lineTo(cropPosition.x + cropSize, cropPosition.y + (cropSize * 2) / 3)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw resize handles (corners and edges) - optimized for mobile
      const handleSize = 24
      const handleColor = "#3B82F6"
      const handleBorder = "#FFFFFF"
      
      // Corner handles
      const corners = [
        { x: cropPosition.x, y: cropPosition.y }, // top-left
        { x: cropPosition.x + cropSize, y: cropPosition.y }, // top-right
        { x: cropPosition.x, y: cropPosition.y + cropSize }, // bottom-left
        { x: cropPosition.x + cropSize, y: cropPosition.y + cropSize }, // bottom-right
      ]
      
      corners.forEach(corner => {
        ctx.fillStyle = handleColor
        ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize)
        ctx.fillStyle = handleBorder
        ctx.fillRect(corner.x - handleSize/2 + 3, corner.y - handleSize/2 + 3, handleSize - 6, handleSize - 6)
      })

      // Edge handles (middle of each side)
      const edgeHandleSize = 20
      const edges = [
        { x: cropPosition.x + cropSize / 2, y: cropPosition.y }, // top
        { x: cropPosition.x + cropSize / 2, y: cropPosition.y + cropSize }, // bottom
        { x: cropPosition.x, y: cropPosition.y + cropSize / 2 }, // left
        { x: cropPosition.x + cropSize, y: cropPosition.y + cropSize / 2 }, // right
      ]
      
      edges.forEach(edge => {
        ctx.fillStyle = handleColor
        ctx.fillRect(edge.x - edgeHandleSize/2, edge.y - edgeHandleSize/2, edgeHandleSize, edgeHandleSize)
        ctx.fillStyle = handleBorder
        ctx.fillRect(edge.x - edgeHandleSize/2 + 2, edge.y - edgeHandleSize/2 + 2, edgeHandleSize - 4, edgeHandleSize - 4)
      })
    }
    img.src = photoPreview
  }, [photoPreview, cropPosition, cropSize])

  // Draw crop preview when cropper is shown or crop settings change
  useEffect(() => {
    if (showCropper && photoPreview) {
      // Small delay to ensure canvas is mounted
      setTimeout(() => {
        drawCropPreview()
      }, 100)
    }
  }, [showCropper, photoPreview, drawCropPreview])

  // Redraw on position/size changes with debouncing
  useEffect(() => {
    if (showCropper && photoPreview && (isDragging || isResizing)) {
      drawCropPreview()
    }
  }, [cropPosition, cropSize, showCropper, photoPreview, isDragging, isResizing, drawCropPreview])

  const applyCrop = () => {
    const canvas = cropCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !photoPreview) return

    const img = new Image()
    img.onload = () => {
      // Get current canvas dimensions
      const containerWidth = canvas.width
      const containerHeight = canvas.height
      
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (containerWidth - scaledWidth) / 2
      const offsetY = (containerHeight - scaledHeight) / 2

      // Calculate crop area in original image coordinates
      const cropX = Math.max(0, (cropPosition.x - offsetX) / scale)
      const cropY = Math.max(0, (cropPosition.y - offsetY) / scale)
      const cropWidth = Math.min(img.width - cropX, cropSize / scale)
      const cropHeight = Math.min(img.height - cropY, cropSize / scale)

      // Create a new canvas for the cropped image
      const croppedCanvas = document.createElement("canvas")
      const croppedCtx = croppedCanvas.getContext("2d")
      if (!croppedCtx) return

      croppedCanvas.width = cropWidth
      croppedCanvas.height = cropHeight

      // Draw the cropped portion
      croppedCtx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

      const croppedDataURL = croppedCanvas.toDataURL("image/png")
      setCroppedPhoto(croppedDataURL)
      setShowCropper(false)

      toast({
        title: "Image Cropped!",
        description: "Your image has been cropped successfully.",
      })
    }
    img.src = photoPreview
  }

  const resetCrop = () => {
    const canvas = cropCanvasRef.current
    if (canvas) {
      // Reset crop position to center and appropriate size for current canvas
      const containerWidth = Math.min(400, window.innerWidth - 40)
      const centerX = containerWidth / 2
      const centerY = (containerWidth * 0.75) / 2
      const defaultSize = Math.min(150, containerWidth * 0.4)
      
      setCropPosition({ 
        x: centerX - defaultSize / 2, 
        y: centerY - defaultSize / 2 
      })
      setCropSize(defaultSize)
    } else {
      // Fallback values
      setCropPosition({ x: 125, y: 75 })
      setCropSize(150)
    }
  }

  const generateCard = async () => {
    if (!croppedPhoto || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to match frame2.png dimensions (1:1 ratio - 1920x1920)
    canvas.width = 1920
    canvas.height = 1920

    const frameImg = new Image()
    frameImg.onload = () => {
      const img = new Image()
      img.onload = () => {
        // White box specs - centered in 1920x1920 canvas
        const PHOTO_RECT = {
          x: (1920 - 1000) / 2,  // Center horizontally
          y: (1920 - 1000) / 2,  // Center vertically
          width: 1000,
          height: 1000,
          radius: 40,
        }

        // 1. Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 2. Draw frame first
        ctx.drawImage(frameImg, 0, 0, 1920, 1920)

        // 3. Clip to white area
        ctx.save()
        roundedRectPath(
          ctx,
          PHOTO_RECT.x,
          PHOTO_RECT.y,
          PHOTO_RECT.width,
          PHOTO_RECT.height,
          PHOTO_RECT.radius
        )
        ctx.clip()

        // 4. Draw user image with "cover" fit
        const iw = img.width
        const ih = img.height
        const scale = Math.max(PHOTO_RECT.width / iw, PHOTO_RECT.height / ih)
        const newW = iw * scale
        const newH = ih * scale

        const dx = PHOTO_RECT.x + (PHOTO_RECT.width - newW) / 2
        const dy = PHOTO_RECT.y + (PHOTO_RECT.height - newH) / 2

        ctx.drawImage(img, dx, dy, newW, newH)

        ctx.restore()

        // 5. Load and draw astro.png on top
        const astroImg = new Image()
        astroImg.onload = () => {
          ctx.drawImage(astroImg, 0, 0, 1920, 1920)
          
          const dataURL = canvas.toDataURL("image/png")
          setGeneratedCard(dataURL)
        }
        astroImg.src = "/astro.png"
      }
      img.src = croppedPhoto
    }
    frameImg.src = "/frame3.png"
  }

  const roundedRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const drawStars = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#F59E0B"
    const starPositions = [
      { x: 120, y: 120 },
      { x: 1080, y: 140 },
      { x: 150, y: 400 },
      { x: 1050, y: 420 },
      { x: 80, y: 650 },
      { x: 1120, y: 680 },
      { x: 180, y: 800 },
      { x: 1020, y: 820 },
    ]

    starPositions.forEach((pos) => {
      drawStar(ctx, pos.x, pos.y, 15, 5, 8)
    })
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    points: number,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / points
      const px = Math.cos(angle) * radius
      const py = Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawConfetti = (ctx: CanvasRenderingContext2D) => {
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      const x = Math.random() * 1200
      const y = Math.random() * 900
      const size = Math.random() * 8 + 4

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.random() * Math.PI * 2)
      ctx.fillRect(-size / 2, -size / 2, size, size)
      ctx.restore()
    }
  }

  const drawText = (ctx: CanvasRenderingContext2D, userName: string) => {
    ctx.fillStyle = "#1F2937"
    ctx.textAlign = "center"

    ctx.font = "bold 48px Arial"
    const text1 = `Hello, I'm ${userName} 😉`
    ctx.fillText(text1, 600, 420)

    ctx.font = "bold 42px Arial"
    const text2 = "and I just participated in"
    ctx.fillText(text2, 600, 500)

    ctx.font = "bold 56px Arial"
    ctx.fillStyle = "#DC2626"
    const text3 = "Zero to Maker"
    ctx.fillText(text3, 600, 600)

    ctx.font = "bold 48px Arial"
    ctx.fillStyle = "#1F2937"
    const text4 = "by Tinkerhub MBCCET 🚀"
    ctx.fillText(text4, 600, 680)

    ctx.font = "bold 36px Arial"
    ctx.fillStyle = "#6B7280"
    ctx.fillText("Tinkerhub MBCCET", 600, 820)
  }

  const downloadCard = () => {
    if (!generatedCard) return

    const link = document.createElement("a")
    link.download = `participation-card.png`
    link.href = generatedCard
    link.click()

    toast({
      title: "Card Downloaded!",
      description: "Your participation card has been saved to your device.",
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkedInPost)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "LinkedIn post text copied to clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually.",
        variant: "destructive",
      })
    }
  }

  const canGenerate = croppedPhoto

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Basilian-01 Profile Generator</h1>
          <p className="text-lg text-slate-200">Generate your personalized profile picture for Baselion rocket launching event</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                1
              </span>
              Enter Your Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
                {croppedPhoto && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={croppedPhoto || "/placeholder.svg"}
                      alt="Cropped Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            {showCropper && photoPreview && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Move className="w-5 h-5 flex-shrink-0" />
                    Adjust Crop Area
                  </div>
                  <Button onClick={resetCrop} variant="ghost" size="sm" className="flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="block sm:inline">Drag inside to move • </span>
                  <span className="block sm:inline">Drag corners/edges to resize</span>
                </p>
                <div className="flex justify-center overflow-hidden">
                  <canvas
                    ref={cropCanvasRef}
                    className="border border-gray-300 cursor-move max-w-full h-auto touch-none select-none rounded-lg"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      touchAction: "none", // Prevent page scrolling during touch
                    }}
                    onMouseDown={handleCropStart}
                    onMouseMove={handleCropMove}
                    onMouseUp={handleCropEnd}
                    onMouseLeave={handleCropEnd}
                    onTouchStart={handleCropStart}
                    onTouchMove={handleCropMove}
                    onTouchEnd={handleCropEnd}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={applyCrop} className="flex-1 min-h-[48px] text-base">
                    Apply Crop
                  </Button>
                  <Button
                    onClick={() => {
                      setCroppedPhoto(photoPreview)
                      setShowCropper(false)
                    }}
                    variant="outline"
                    className="flex-1 min-h-[48px] text-base"
                  >
                    Skip Cropping
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={generateCard}
              disabled={!canGenerate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              Generate Participation Card
            </Button>
          </CardContent>
        </Card>

        {generatedCard && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Your Participation Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={generatedCard || "/placeholder.svg"}
                  alt="Participation Card"
                  className="max-w-full h-auto rounded-2xl shadow-lg border-2 border-gray-200"
                />
              </div>
              <Button
                onClick={downloadCard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
