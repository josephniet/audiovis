import { BaseRenderer } from '../BaseRenderer'

export class CircleRenderer extends BaseRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    private circleRadius: number = 3
  ) {
    super(canvas)
  }

  draw(data: Uint8Array): void {
    this.clear()
    
    const { width, height } = this.getCanvasDimensions()
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 3

    data.forEach((value, index) => {
      const radius = (value / 255) * maxRadius
      const angle = (index / data.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      const hue = (index / data.length) * 360
      this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.circleRadius, 0, Math.PI * 2)
      this.ctx.fill()
    })
  }

  clear(): void {
    this.clearCanvas()
  }

  setCircleRadius(radius: number) {
    this.circleRadius = radius
  }
}
