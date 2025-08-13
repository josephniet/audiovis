export abstract class BaseRenderer {
  protected ctx: CanvasRenderingContext2D
  protected canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  abstract draw(data: Uint8Array): void
  abstract clear(): void

  protected getCanvasDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    }
  }

  protected clearCanvas() {
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  resize() {
    // Override in subclasses if needed
  }
}
