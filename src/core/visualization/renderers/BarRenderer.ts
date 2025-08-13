import { BaseRenderer } from '../BaseRenderer'

export class BarRenderer extends BaseRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    private barSpacing: number = 2
  ) {
    super(canvas)
  }

  draw(data: Uint8Array): void {
    this.clear()
    
    const { width, height } = this.getCanvasDimensions()
    const barWidth = width / data.length

    data.forEach((value, index) => {
      const barHeight = (value / 255) * height * 0.8
      const x = index * (barWidth + this.barSpacing)
      const y = height - barHeight

      const hue = (index / data.length) * 360
      this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
      this.ctx.fillRect(x, y, barWidth, barHeight)
    })
  }

  clear(): void {
    this.clearCanvas()
  }

  setBarSpacing(spacing: number) {
    this.barSpacing = spacing
  }
}
