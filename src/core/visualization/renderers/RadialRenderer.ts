import { BaseRenderer } from '../BaseRenderer'

export class RadialRenderer extends BaseRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    private ringSpacing: number = 8,
    private maxRings: number = 20,
    private ringThickness: number = 3
  ) {
    super(canvas)
  }

  draw(data: Uint8Array): void {
    this.clear()
    
    const { width, height } = this.getCanvasDimensions()
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2 - 50 // Leave some margin

    // Create frequency bands by averaging adjacent frequencies
    const bands = this.createFrequencyBands(data, this.maxRings)
    
    // Calculate proper spacing to avoid overlapping rings
    const startRadius = this.ringThickness + this.ringSpacing
    
    bands.forEach((intensity, index) => {
      // Calculate radius with proper spacing
      const radius = startRadius + index * (this.ringThickness * 2 + this.ringSpacing)
      
      // Skip if ring would be outside canvas
      if (radius > maxRadius) return
      
      const alpha = Math.max(0.1, intensity / 255)
      
      // Create gradient for each ring with safe radius values
      const innerRadius = Math.max(0.1, radius - this.ringThickness)
      const outerRadius = radius + this.ringThickness
      
      // Ensure we have valid radius values for the gradient
      if (innerRadius >= 0 && outerRadius > innerRadius) {
        const gradient = this.ctx.createRadialGradient(
          centerX, centerY, innerRadius,
          centerX, centerY, outerRadius
        )
        
        const hue = (index / bands.length) * 360
        const baseColor = `hsla(${hue}, 70%, 60%, ${alpha})`
        const glowColor = `hsla(${hue}, 70%, 80%, ${alpha * 0.3})`
        
        gradient.addColorStop(0, baseColor)
        gradient.addColorStop(0.5, glowColor)
        gradient.addColorStop(1, baseColor)
        
        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        this.ctx.fill()
        
        // Add inner glow effect for high intensity
        if (intensity > 100) {
          this.ctx.shadowColor = baseColor
          this.ctx.shadowBlur = intensity / 10
          this.ctx.strokeStyle = glowColor
          this.ctx.lineWidth = this.ringThickness
          this.ctx.stroke()
          this.ctx.shadowBlur = 0
        }
      }
    })
  }

  private createFrequencyBands(data: Uint8Array, numBands: number): Uint8Array {
    const bands = new Uint8Array(numBands)
    const samplesPerBand = Math.floor(data.length / numBands)
    
    for (let i = 0; i < numBands; i++) {
      const startIndex = i * samplesPerBand
      const endIndex = startIndex + samplesPerBand
      let sum = 0
      let count = 0
      
      for (let j = startIndex; j < endIndex && j < data.length; j++) {
        sum += data[j]
        count++
      }
      
      bands[i] = count > 0 ? sum / count : 0
    }
    
    return bands
  }

  clear(): void {
    this.clearCanvas()
  }

  setRingSpacing(spacing: number) {
    this.ringSpacing = spacing
  }

  setMaxRings(rings: number) {
    this.maxRings = rings
  }

  setRingThickness(thickness: number) {
    this.ringThickness = thickness
  }
}
