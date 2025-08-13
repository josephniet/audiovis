import type { VisualizationMode } from '../../types'
import { BaseRenderer } from './BaseRenderer'
import { BarRenderer } from './renderers/BarRenderer'
import { WaveformRenderer } from './renderers/WaveformRenderer'
import { CircleRenderer } from './renderers/CircleRenderer'
import { RadialRenderer } from './renderers/RadialRenderer'

export class VisualizationEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private currentMode: VisualizationMode = 'bars'
  private renderers: Map<VisualizationMode, BaseRenderer>
  private analyser: AnalyserNode | null = null

  constructor(
    canvas: HTMLCanvasElement,
    private config: {
      barSpacing?: number
      lineWidth?: number
      circleRadius?: number
      ringSpacing?: number
      maxRings?: number
      ringThickness?: number
    } = {}
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    
    this.renderers = new Map([
      ['bars', new BarRenderer(canvas, config.barSpacing)],
      ['waveform', new WaveformRenderer(canvas, config.lineWidth)],
      ['circles', new CircleRenderer(canvas, config.circleRadius)],
      ['radial', new RadialRenderer(canvas, config.ringSpacing, config.maxRings, config.ringThickness)]
    ])

    this.setupCanvas()
  }

  private setupCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  setAnalyser(analyser: AnalyserNode) {
    this.analyser = analyser
  }

  setMode(mode: VisualizationMode) {
    this.currentMode = mode
  }

  getCurrentMode(): VisualizationMode {
    return this.currentMode
  }

  startVisualization() {
    if (this.animationId) return
    
    const animate = () => {
      this.draw()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }

  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.clearCanvas()
  }

  private draw() {
    if (!this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    const renderer = this.renderers.get(this.currentMode)
    if (renderer) {
      renderer.draw(dataArray)
    }
  }

  private clearCanvas() {
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  resize() {
    this.setupCanvas()
    this.renderers.forEach(renderer => renderer.resize())
  }

  updateConfig(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig }
    
    // Update renderer configurations
    const barRenderer = this.renderers.get('bars') as BarRenderer
    if (barRenderer && newConfig.barSpacing !== undefined) {
      barRenderer.setBarSpacing(newConfig.barSpacing)
    }

    const waveformRenderer = this.renderers.get('waveform') as WaveformRenderer
    if (waveformRenderer && newConfig.lineWidth !== undefined) {
      waveformRenderer.setLineWidth(newConfig.lineWidth)
    }

    const circleRenderer = this.renderers.get('circles') as CircleRenderer
    if (circleRenderer && newConfig.circleRadius !== undefined) {
      circleRenderer.setCircleRadius(newConfig.circleRadius)
    }

    const radialRenderer = this.renderers.get('radial') as RadialRenderer
    if (radialRenderer) {
      if (newConfig.ringSpacing !== undefined) {
        radialRenderer.setRingSpacing(newConfig.ringSpacing)
      }
      if (newConfig.maxRings !== undefined) {
        radialRenderer.setMaxRings(newConfig.maxRings)
      }
      if (newConfig.ringThickness !== undefined) {
        radialRenderer.setRingThickness(newConfig.ringThickness)
      }
    }
  }

  cleanup() {
    this.stopVisualization()
    this.analyser = null
  }
}
