import visualiserTemplate from '@/visualiser/templates/visualiser.html?raw'
import visualiserStyles from '@/visualiser/templates/visualiser.css?raw'


export class VisualiserComponent extends HTMLElement {
    private source: MediaElementAudioSourceNode | null = null
    private audioElement: HTMLAudioElement | null = null
    private audioContext: AudioContext | null = null
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private analyser: AnalyserNode | null = null
    private bufferLength: number = 0
    private dataArray: Uint8Array = new Uint8Array(0)
    private animationFrame: number | null = null
    private scale: number = 1
    private isPlaying: boolean = false
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const style = document.createElement('style')
        style.textContent = visualiserStyles
        this.shadowRoot?.appendChild(style)
        const tpl = document.createElement('template')
        tpl.innerHTML = visualiserTemplate
        this.shadowRoot?.appendChild(tpl.content.cloneNode(true))
        this.setupCanvas()
        this.addEventListener('audio-element-ready', (e) => {
            const { audioElement } = (e as CustomEvent<{ audioElement: HTMLAudioElement }>).detail;
            console.log('audio element ready', audioElement);
            //handle changing element src
            audioElement?.addEventListener('loadstart', () => {
                console.log('audio src changed, setting up audio')
                this.setupAudio(audioElement)
            })
            //initial setup
            this.setupAudio(audioElement)
        });
    }
    cleanupAudio(){
        if (this.animationFrame){
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = null
        }
        if(this.source){
            this.source.disconnect()
            this.source = null
        }
        if(this.analyser){
            this.analyser.disconnect()
            this.analyser = null
        }
        if(this.audioContext){
            this.audioContext.close()   
            this.audioContext = null
        }
    }
    async setupAudio(audioElement: HTMLAudioElement){
        this.cleanupAudio()
        //TODO: Make sure this only runs once
        this.audioElement = audioElement
        try{
            console.log('setting up audio')
            this.audioContext = new AudioContext()
            this.source = this.audioContext.createMediaElementSource(this.audioElement)
            this.analyser = new AnalyserNode(this.audioContext)
            this.analyser.fftSize = 256
            this.bufferLength = this.analyser.frequencyBinCount
            this.dataArray = new Uint8Array(this.bufferLength)
            this.source.connect(this.analyser)
            this.analyser.connect(this.audioContext.destination)
            // Resume audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                console.log('resuming audio context', this.audioContext)
                await this.audioContext.resume()
                console.log('audio context resumed')
            }
            console.log('audio setup complete')
            this.startAnimation()
        }catch(error){
            console.error('Error setting up audio', error)
        }
    }
    startAnimation(){
        console.log('starting animation')
        this.draw()
    }
    stopAnimation(){
        cancelAnimationFrame(this.animationFrame)
    }
    setupCanvas() {
        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement
        this.ctx = this.canvas.getContext('2d')
        this.resizeCanvas()
        this.setupListeners()
    }
    setupListeners() {
        window.addEventListener('resize', () => this.resizeCanvas())
    }
    resizeCanvas() {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas or context not found')
        }
        // Set actual size in memory (scaled to account for extra pixel density).
        const scale = Math.ceil(window.devicePixelRatio) // Change to 1 on retina screens to see blurry canvas.
        const width = window.innerWidth
        const height = window.innerHeight
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.canvas.width = Math.floor(width * scale);
        this.canvas.height = Math.floor(height * scale);
        this.scale = scale
        this.ctx.scale(this.scale, this.scale)
    }
    draw(){
        console.log('drawing')
        if (!this.ctx || !this.analyser || !this.canvas) return
        
        // Get frequency data from analyser
        this.analyser.getByteFrequencyData(this.dataArray)
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        // Calculate center of canvas
        const centerX = this.canvas.width / (2 * this.scale)
        const centerY = this.canvas.height / (2 * this.scale)
        
        // Calculate max radius (smaller of width/height, with some padding)
        const maxRadius = Math.min(centerX, centerY) * 0.8
        
        // Number of rings to draw
        const numRings = 8
        
        // Draw concentric rings
        for (let i = 0; i < numRings; i++) {
            const ringIndex = Math.floor((i / numRings) * this.bufferLength)
            const frequencyValue = this.dataArray[ringIndex] || 0
            
            // Calculate ring radius and thickness
            const ringRadius = (i / numRings) * maxRadius
            const ringThickness = maxRadius / numRings
            
            // Calculate opacity and color based on frequency data
            const opacity = frequencyValue / 255
            const hue = (i / numRings) * 360 // Different color for each ring
            const saturation = 80 + (opacity * 20) // 80-100%
            const lightness = 50 + (opacity * 30) // 50-80%
            
            // Set fill style
            this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
            
            // Draw ring (filled circle with inner circle cut out)
            this.ctx.beginPath()
            this.ctx.arc(centerX, centerY, ringRadius + ringThickness, 0, 2 * Math.PI)
            this.ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI, true) // Counter-clockwise for cutout
            this.ctx.fill()
        }
        
        // Continue animation loop
        this.animationFrame = requestAnimationFrame(() => this.draw())
    }
}

customElements.define('visualiser-component', VisualiserComponent)