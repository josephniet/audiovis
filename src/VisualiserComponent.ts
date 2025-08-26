import visualiserTemplate from './visualiser.html?raw'
import visualiserCSS from './visualiser.css?raw'
import { BaseComponent } from './BaseComponent'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'
import type { ControlsData, AudioPlayerData, PlayStateUpdateEvent } from '@/utils/Events'
import { createMonoFromStereo } from '@/utils/monoMaker'
import { drawGrid } from './visualiser/utils/drawGrid'
import { drawWaveform } from './visualiser/utils/drawWaveform'
import { BeatDetector } from './visualiser/utils/BeatDetector'
import { BeatDetectorBasic } from './visualiser/utils/BeatDetectorBasic'

export class VisualiserComponent extends BaseComponent {
    eventManager = new EventManager()
    progressElement: HTMLElement | null = null
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private audioContext: AudioContext
    private analyser: AnalyserNode
    private source: MediaElementAudioSourceNode
    private audioElement: HTMLAudioElement
    private animationFrame: number | null = null
    private scale: number = 1
    private timeDomainDataArray: Uint8Array
    private beatDetector: BeatDetectorBasic
    private isPlaying: boolean = false
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
        // await new Promise(resolve => setTimeout(resolve, 3000)) // waiting for audio to play
        console.log('debug waited')
        const [audioData, progressElement] = await Promise.all([this.getAudioData(), this.getProgressElement()])
        console.log('visualiser component connected', audioData, progressElement)
        this.progressElement = progressElement
        this.audioContext = audioData.audioContext
        this.audioElement = audioData.audioElement
        this.source = this.audioContext.createMediaElementSource(this.audioElement)
        // const gainNode = this.audioContext.createGain()
        // this.source.connect(gainNode)
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 2048
        // this.analyser.smoothingTimeConstant = 1
        this.analyser.connect(this.audioContext.destination)
        this.source.connect(this.analyser)
        this.beatDetector = new BeatDetectorBasic(this.analyser, this.audioContext)
        // this.source.connect(this.audioContext.destination)
        this.ctx = this.canvas.getContext('2d')!
        this.ctx.fillStyle = 'rgba(85, 118, 93, 0.5)'
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
        this.resizeCanvas()
        this.setupExternalListeners()
        // this.timeDomainDataArray = new Uint8Array(this.analyser.frequencyBinCount)
    }
    setupExternalListeners() {
        this.eventManager.on(EVENT_NAMES.PLAY_STATE_UPDATE, (event: CustomEvent<PlayStateUpdateEvent>) => {
            if (this.isPlaying === event.detail.isPlaying) return
            if (event.detail.isPlaying) {
                this.play()
            } else {
                this.pause()
            }
        })
    }
    play() {
        this.isPlaying = true
        this.animationFrame = requestAnimationFrame(() => this.draw())
    }
    pause() {
        this.isPlaying = false
        cancelAnimationFrame(this.animationFrame!)
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
    sigmoidEasing(value: number, threshold: number, steepness: number = 10): number {
        // Normalize to center around threshold
        const normalized = (value - threshold) / (1 - threshold);

        // Apply sigmoid function
        const sigmoid = 1 / (1 + Math.exp(-steepness * normalized));

        return sigmoid;
    }
    draw() {
        if (!this.progressElement) {
            throw new Error('Progress element not found')
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const beat = this.beatDetector.detectAsRatio(0, 200)
        // const easedBeat = Math.pow(beat, 10)
        const easedBeat = this.sigmoidEasing(beat, 0.9, 10)
        // const color2 = Math.sin(this.animationFrame! / 1000) * 255
        // const easedBeat = Math.round(Math.pow(beat, 3))
        // console.log('beat', beat)
        this.ctx.fillStyle = `rgb(${easedBeat * 255}, 0, 0)`
        // this.ctx.fillStyle = `hsl(${Math.sin(this.animationFrame! / 200) * 360}, 100%, ${this.sigmoidEasing(beat, 0.9, 10) * 80}%)`1
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        // Clear canvas
        drawGrid(this.ctx, this.progressElement)
        drawWaveform({
            ctx: this.ctx,
            analyser: this.analyser,
            container: this.progressElement
        })
        if (this.animationFrame === null) return
        this.animationFrame = requestAnimationFrame(() => this.draw())
    }
}

customElements.define('visualiser-component', VisualiserComponent)