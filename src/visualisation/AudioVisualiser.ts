export class AudioVisualiser {
    private canvas: HTMLCanvasElement = document.createElement('canvas')
    private ctx: CanvasRenderingContext2D
    private analyser: AnalyserNode
    private audioContext: AudioContext
    private audioBuffer: AudioBuffer | null = null
    private animationFrameId: number | null = null

    constructor(audioBuffer: AudioBuffer) {
        document.body.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
        // this.audioContext = audioContext
        this.analyser = new AnalyserNode(audioContext)
        this.audioBuffer = audioBuffer
        this.animationFrameId = null
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = 'white'
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'
    }
    private drawVisualisation() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.canvas.height / 2)
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2)
        this.ctx.stroke()
    }
    private animate() {
        this.drawVisualisation()
        this.animationFrameId = requestAnimationFrame(() => this.animate())
    }
    public start() {
        this.animate()
    }
    public stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId)
        }
    }
}