import { BaseRenderer } from '../BaseRenderer'

export class WaveformRenderer extends BaseRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    private lineWidth: number = 2,
    private strokeColor: string = '#00ff88'
  ) {
    super(canvas)
  }

  draw(data: Uint8Array): void {
    this.clear()
    
    const { width, height } = this.getCanvasDimensions()
    const sliceWidth = width / data.length

    this.ctx.strokeStyle = this.strokeColor
    this.ctx.lineWidth = this.lineWidth
    this.ctx.beginPath()

    let x = 0

    data.forEach((value, index) => {
      const v = value / 128.0
      const y = (v * height) / 2

      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }

      x += sliceWidth
    })

    this.ctx.lineTo(width, height / 2)
    this.ctx.stroke()
  }

  clear(): void {
    this.clearCanvas()
  }

  setLineWidth(width: number) {
    this.lineWidth = width
  }

  setStrokeColor(color: string) {
    this.strokeColor = color
  }
}
