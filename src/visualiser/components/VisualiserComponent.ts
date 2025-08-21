import type { ProgressUpdateEvent, PlayStateUpdateEvent, DurationUpdateEvent, SeekEvent, VolumeEvent } from '@/visualiser/types/events';
import { EVENT_NAMES } from '@/visualiser/utils/events';
import { EventManager } from '@/visualiser/utils/event-manager';
import type { AudioReadyEvent } from '@/visualiser/utils/events';
import { AudioPlayerComponent } from './AudioPlayerComponent';
import visualiserTemplate from '@/visualiser/templates/visualiser.html?raw'
import visualiserStyles from '@/visualiser/templates/visualiser.css?raw'
import type { ReadyComponent } from '@/visualiser/utils/component-bootstrap';

export class VisualiserComponent extends HTMLElement implements ReadyComponent {
    public ready: Promise<void>
    public readyState: 'pending' | 'resolved' | 'rejected'
    private connectedCount = 0
    private initialised = false
    private source: MediaElementAudioSourceNode | null = null
    private audioElement: HTMLAudioElement | null = null
    private audioContext: AudioContext | null = null
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private analyser: AnalyserNode | null = null
    private bufferLength: number = 0
    private dataArray: Uint8Array = new Uint8Array(0)
    private timeDomainDataArray: Uint8Array = new Uint8Array(0)
    private animationFrame: number | null = null
    private scale: number = 1
    private isPlaying: boolean = false
    private waveformContainer: HTMLDivElement | null = null
    private eventManager: EventManager
    private resolveReady: (value: unknown) => void
    private rejectReady: (reason?: any) => void
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.eventManager = new EventManager()
        this.ready = new Promise((resolve, reject) => {
            this.readyState = 'pending'
            this.resolveReady = resolve
            this.rejectReady = reject
        })
    }
    setAudioContext(audioContext: AudioContext) {
        this.audioContext = audioContext
    }
    async initialise() {
        if (this.initialised) {
            return
        }
        this.initialised = true
        await customElements.whenDefined('audio-player-component');
        const parentAudioPlayer = this.closest('audio-player-component') as AudioPlayerComponent
        if (!parentAudioPlayer) {
            console.warn('No parent audio player found for visualiser')
            return
        }
        const { audioElement, audioContext, duration } = await parentAudioPlayer.ready
        this.audioElement = audioElement
        this.audioContext = audioContext
        console.log('initialiser', audioElement, audioContext, duration)
    }
    // async setupAudioContext(): Promise<void> {
    //     await customElements.whenDefined('audio-player');
    //     this.parentAudioPlayer = this.closest('audio-player-component') as AudioPlayerComponent

    //     if (!this.parentAudioPlayer) {
    //         console.warn('No parent audio player found for visualiser')
    //         return
    //     }
    //     console.log('parent audio player', this.parentAudioPlayer.getAudioContext())
    //     const audioContext = this.parentAudioPlayer.getAudioContext()
    //     if (audioContext) {
    //         this.setAudioContext(audioContext)
    //         return
    //     }

    //     // Wait for audio context to be ready
    //     return new Promise<void>((resolve, reject) => {
    //         const handler = () => {
    //             this.parentAudioPlayer?.removeEventListener(EVENT_NAMES.AUDIO_CONTEXT_READY, handler)
    //             const currentAudioContext = this.parentAudioPlayer?.getAudioContext()
    //             if (currentAudioContext) {
    //                 this.setAudioContext(currentAudioContext)
    //                 resolve()
    //             } else {
    //                 reject(new Error('Audio context not available after ready event'))
    //             }
    //         }

    //         // Add timeout to prevent hanging
    //         const timeout = setTimeout(() => {
    //             this.parentAudioPlayer?.removeEventListener(EVENT_NAMES.AUDIO_CONTEXT_READY, handler)
    //             reject(new Error('Audio context ready event timeout'))
    //         }, 10000) // 10 second timeout

    //         this.parentAudioPlayer.addEventListener(EVENT_NAMES.AUDIO_CONTEXT_READY, () => {
    //             clearTimeout(timeout)
    //             handler()
    //         })
    //     })
    // }
    async connectedCallback() {
        this.connectedCount++
        console.log('connected visualiser', this.connectedCount)
        if (this.connectedCount > 1) {
            console.log('visualiser already connected')
            return
        }
        const style = document.createElement('style')
        style.textContent = visualiserStyles
        this.shadowRoot?.appendChild(style)
        const tpl = document.createElement('template')
        tpl.innerHTML = visualiserTemplate
        this.shadowRoot?.appendChild(tpl.content.cloneNode(true))
        this.waveformContainer = this.shadowRoot?.querySelector('#waveform') as HTMLDivElement
        this.setupCanvas()
        await this.initialise()
        await this.setupAudio()
        this.resolveReady()
    }
    cleanupAudio() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = null
        }
        if (this.source) {
            this.source.disconnect()
            this.source = null
        }
        if (this.analyser) {
            this.analyser.disconnect()
            this.analyser = null
        }
        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }
    }
    async setupAudio() {
        //TODO: Make sure this only runs once
        try {
            console.log('setting up audio')

            // Always try to resume the audio context first
            if (this.audioContext.state === 'suspended') {
                console.log('Audio context suspended, attempting to resume...')
                try {
                    await this.audioContext.resume()
                    console.log('Audio context resumed successfully')
                } catch (resumeError) {
                    console.log('Resume failed, user interaction may be required')
                    // Don't throw here, continue with setup
                }
            }
            this.source = this.audioContext.createMediaElementSource(this.audioElement)
            console.log('Source channels:', this.source.channelCount);
            this.analyser = new AnalyserNode(this.audioContext)
            this.analyser.fftSize = 2048
            this.bufferLength = this.analyser.frequencyBinCount
            this.dataArray = new Uint8Array(this.bufferLength)
            this.timeDomainDataArray = new Uint8Array(this.bufferLength)
            const monoSource = this.createMonoFromStereo(this.audioContext, this.source)
            monoSource.connect(this.analyser)
            this.analyser.connect(this.audioContext.destination)
            this.analyser.channelCount = 1;
            this.analyser.channelCountMode = 'explicit';
            console.log('monoSource channel count', monoSource.channelCount)
            console.log('analyser channel count', this.analyser.channelCount)

            console.log('audio setup complete')
            this.startAnimation()
        } catch (error) {
            console.error('Error setting up audio', error)
        }
    }
    startAnimation() {
        console.log('starting animation')
        this.animationFrame = requestAnimationFrame(() => this.draw())
    }
    stopAnimation() {
        console.log('stopping animation', this.animationFrame)
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = null
        }
    }
    setupCanvas() {
        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement
        this.ctx = this.canvas.getContext('2d')
        this.resizeCanvas()
        this.setupListeners()
    }
    setupAudioListeners() {
        this.audioElement?.addEventListener('play', () => this.startAnimation())
        this.audioElement?.addEventListener('pause', () => this.stopAnimation())
    }
    setupListeners() {
        window.addEventListener('resize', () => this.resizeCanvas())
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

    draw() {
        if (!this.ctx || !this.analyser || !this.canvas) return
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawWaveform()
        // this.drawRings()
        // Continue animation loop
        if (this.animationFrame === null) return
        this.animationFrame = requestAnimationFrame(() => this.draw())
    }
    private filterData(data) {

    }
    private createMonoFromStereo(audioContext: AudioContext, source: MediaElementAudioSourceNode) {
        const splitter = audioContext?.createChannelSplitter(2)
        const merger = audioContext.createChannelMerger(1)
        const leftGain = audioContext?.createGain()
        const rightGain = audioContext.createGain()
        leftGain.gain.value = 0.5
        rightGain.gain.value = 0.5
        source.connect(splitter)
        splitter.connect(leftGain, 0)
        splitter.connect(rightGain, 1)
        leftGain.connect(merger, 0, 0)
        rightGain.connect(merger, 0, 0)
        return merger
    }

    drawGrid(ctx: CanvasRenderingContext2D, container: HTMLElement) {
        const cellWidth = 40
        const cellHeight = 40
        const width = container.clientWidth
        const height = container.clientHeight
        ctx.lineWidth = 1
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'
        ctx.translate(container.offsetLeft, container.offsetTop)
        for (let x = 0; x <= width; x += cellWidth) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()
        }
        for (let y = 0; y <= height; y += cellHeight) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }
        ctx.resetTransform()
    }
    drawWaveform() {
        if (!this.ctx || !this.analyser || !this.canvas) return
        const bufferLength = this.analyser.frequencyBinCount
        this.analyser.getByteTimeDomainData(this.timeDomainDataArray)
        // console.log(this.timeDomainDataArray)
        // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        // Calculate center of canvas
        this.drawGrid(this.ctx, this.waveformContainer)
        const width = this.waveformContainer?.clientWidth || 0
        const height = this.waveformContainer?.clientHeight || 0
        const left = this.waveformContainer?.offsetLeft || 0
        const top = this.waveformContainer?.offsetTop || 0
        const bottom = top + height
        const right = left + width
        const centerX = this.canvas.width / 2
        const centerY = top + (height / 2)
        //begin path
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = 'white'
        this.ctx.moveTo(left, centerY)
        this.ctx.beginPath()
        this.ctx.translate(0, top + (height / 2))
        const sliceWidth = width / bufferLength
        let x = left
        for (let i = 0; i < bufferLength; i++) {
            //normalize to 0-1
            const amplitude = (-0.5 + (this.timeDomainDataArray[i] / 255)) * 2
            const y = amplitude * (height / 2)
            if (i === 0) {
                this.ctx.moveTo(x, y)
            } else {
                this.ctx.lineTo(x, y)
            }
            x += sliceWidth
        }
        this.ctx.stroke()
        this.ctx.resetTransform()

    }
}

customElements.define('visualiser-component', VisualiserComponent)