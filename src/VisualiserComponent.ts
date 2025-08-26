import visualiserTemplate from './visualiser.html?raw'
import visualiserCSS from './visualiser.css?raw'
import { BaseComponent } from './BaseComponent'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'
import type { ControlsData, AudioPlayerData } from '@/utils/Events'
import { createMonoFromStereo } from '@/utils/monoMaker'
import { drawGrid } from './visualiser/utils/drawGrid'
import { drawWaveform } from './visualiser/utils/drawWaveform'

export class VisualiserComponent extends BaseComponent {
    eventManager = new EventManager()
    progressElement: HTMLElement | null = null
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private audioCtx: AudioContext
    private analyser: AnalyserNode
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = visualiserTemplate
        this.canvas = shadowRoot.querySelector('canvas')!
        const style = document.createElement('style')
        style.textContent = visualiserCSS
        shadowRoot.appendChild(style)
    }
    private async getAudioData(): Promise<AudioPlayerData> {
        return new Promise((resolve, reject) => {
            const handler = (event: CustomEvent<AudioPlayerData>) => {
                console.log('audio player data recieved by visualiser', event.detail)
                resolve(event.detail)
            }
            this.eventManager.on(EVENT_NAMES.AUDIO_PLAYER_DATA, handler, { once: true })
            this.eventManager.emit(EVENT_NAMES.REQUEST_AUDIO_PLAYER_DATA)
        })
    }
    private async getProgressElement(): Promise<HTMLElement> {
        return new Promise((resolve, reject) => {
            const handler = (event: CustomEvent<ControlsData>) => {
                console.log('controls data recieved by visualiser', event.detail)
                resolve(event.detail.progressElement)
            }
            this.eventManager.on(EVENT_NAMES.CONTROLS_DATA, handler, { once: true })
            this.eventManager.emit(EVENT_NAMES.REQUEST_CONTROLS_DATA)
        })
    }
    async connectedCallback(): Promise<void> {
        console.log('visualiser component connected')
        const [audioData, progressElement] = await Promise.all([this.getAudioData(), this.getProgressElement()])
        console.log('visualiser component connected', audioData, progressElement)
        this.progressElement = progressElement
        this.audioCtx = audioData.audioContext
        this.analyser = this.audioCtx.createAnalyser()
        this.analyser.fftSize = 256
        this.analyser.smoothingTimeConstant = 0.8
        this.analyser.connect(this.audioCtx.destination)
        this.ctx = this.canvas.getContext('2d')!
        this.ctx.fillStyle = 'rgba(85, 118, 93, 0.5)'
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
        this.resizeCanvas()
        drawGrid(this.ctx, this.progressElement)
    }
    resizeCanvas() {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas or context not found')
        }
        // Set actual size in memory (scaled to account for extra pixel density).
        // const scale = Math.ceil(window.devicePixelRatio) // Change to 1 on retina screens to see blurry canvas.
        //TODO: Make this dynamic
        const scale = 1
        const width = window.innerWidth
        const height = window.innerHeight
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.canvas.width = Math.floor(width * scale);
        this.canvas.height = Math.floor(height * scale);
        this.scale = scale
        this.ctx.scale(this.scale, this.scale)
    }
}

customElements.define('visualiser-component', VisualiserComponent)