import type { VisualizationMode, AudioVisualizerConfig, VisualizationData } from './types'

export class AudioVisualizer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private audioElement: HTMLAudioElement | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private isPlaying = false
  private currentMode: VisualizationMode = 'bars'
  private config: Required<AudioVisualizerConfig>
  private progressUpdateInterval: number | null = null

  constructor(config: AudioVisualizerConfig = {}) {
    this.config = {
      fftSize: 256,
      smoothingTimeConstant: 0.8,
      barSpacing: 2,
      circleRadius: 3,
      ...config
    } as Required<AudioVisualizerConfig>
    
    this.canvas = document.getElementById('visualizer') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.setupCanvas()
    this.setupEventListeners()
    
    // Load default audio file
    this.loadDefaultAudio()
  }

  private loadDefaultAudio() {
    try {
      const defaultAudioPath = '/track 1.mp3'
      this.loadAudio(defaultAudioPath)
      this.updateFileName('track 1.mp3')
    } catch (error) {
      console.log('Default audio file not found, waiting for user upload...')
    }
  }

  private setupCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private setupEventListeners() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    const playButton = document.getElementById('playButton') as HTMLButtonElement
    const modeButtons = document.querySelectorAll('.mode-btn') as NodeListOf<HTMLButtonElement>
    const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement
    const progressBar = document.getElementById('progressBar') as HTMLInputElement

    fileInput.addEventListener('change', (e) => this.handleFileSelect(e))
    playButton.addEventListener('click', () => this.togglePlayback())
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement
        this.setMode(target.dataset.mode as VisualizationMode)
      })
    })
    volumeSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.setVolume(parseFloat(target.value))
    })

    // Progress bar event listeners
    progressBar.addEventListener('input', (e) => this.handleProgressInput(e))
    progressBar.addEventListener('change', (e) => this.handleProgressChange(e))

    window.addEventListener('resize', () => this.handleResize())
  }

  private handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      this.loadAudio(url)
      this.updateFileName(file.name)
    }
  }

  private loadAudio(url: string) {
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
      this.stopProgressUpdates()
    }

    this.audioElement = new Audio(url)
    this.audioElement.crossOrigin = 'anonymous'
    
    this.audioElement.addEventListener('canplay', () => {
      this.initializeAudioContext()
      this.updatePlayButton(true)
      this.updateDuration()
      this.startProgressUpdates()
    })

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false
      this.updatePlayButton(false)
      this.stopVisualization()
      this.stopProgressUpdates()
      this.updateProgress(0)
    })

    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgress()
    })
  }

  private initializeAudioContext() {
    if (!this.audioElement) return

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    
    const source = this.audioContext.createMediaElementSource(this.audioElement)
    source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
    
    this.analyser.fftSize = this.config.fftSize
    this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant
  }

  private togglePlayback() {
    if (!this.audioElement) return

    if (this.isPlaying) {
      this.audioElement.pause()
      this.isPlaying = false
      this.stopVisualization()
      this.stopProgressUpdates()
    } else {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume()
      }
      this.audioElement.play()
      this.isPlaying = true
      this.startVisualization()
      this.startProgressUpdates()
    }
    
    this.updatePlayButton(this.isPlaying)
  }

  private startVisualization() {
    if (this.animationId) return
    
    const animate = () => {
      this.draw()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }

  private stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.clearCanvas()
  }

  private startProgressUpdates() {
    if (this.progressUpdateInterval) return
    
    this.progressUpdateInterval = window.setInterval(() => {
      this.updateProgress()
    }, 100) // Update every 100ms for smooth progress
  }

  private stopProgressUpdates() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval)
      this.progressUpdateInterval = null
    }
  }

  private updateProgress(seekTime?: number) {
    if (!this.audioElement) return

    const currentTime = seekTime !== undefined ? seekTime : this.audioElement.currentTime
    const duration = this.audioElement.duration || 0
    
    if (duration > 0) {
      const progress = (currentTime / duration) * 100
      const progressBar = document.getElementById('progressBar') as HTMLInputElement
      progressBar.value = progress.toString()
      
      this.updateTimeDisplay(currentTime, duration)
    }
  }

  private updateTimeDisplay(currentTime: number, duration: number) {
    const currentTimeElement = document.getElementById('currentTime')
    const durationElement = document.getElementById('duration')
    
    if (currentTimeElement) {
      currentTimeElement.textContent = this.formatTime(currentTime)
    }
    
    if (durationElement) {
      durationElement.textContent = this.formatTime(duration)
    }
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  private updateDuration() {
    if (this.audioElement) {
      this.updateTimeDisplay(0, this.audioElement.duration)
    }
  }

  private handleProgressInput(event: Event) {
    // Don't seek while dragging, just update the time display
    const target = event.target as HTMLInputElement
    const progress = parseFloat(target.value)
    
    if (this.audioElement && this.audioElement.duration) {
      const seekTime = (progress / 100) * this.audioElement.duration
      this.updateTimeDisplay(seekTime, this.audioElement.duration)
    }
  }

  private handleProgressChange(event: Event) {
    // Seek to the new position when user releases the slider
    const target = event.target as HTMLInputElement
    const progress = parseFloat(target.value)
    
    if (this.audioElement && this.audioElement.duration) {
      const seekTime = (progress / 100) * this.audioElement.duration
      this.audioElement.currentTime = seekTime
      this.updateProgress(seekTime)
    }
  }

  private draw() {
    if (!this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    this.clearCanvas()

    switch (this.currentMode) {
      case 'bars':
        this.drawBars(dataArray)
        break
      case 'waveform':
        this.drawWaveform(dataArray)
        break
      case 'circles':
        this.drawCircles(dataArray)
        break
    }
  }

  private drawBars(dataArray: Uint8Array) {
    const barWidth = this.canvas.width / dataArray.length
    const barSpacing = this.config.barSpacing

    dataArray.forEach((value, index) => {
      const barHeight = (value / 255) * this.canvas.height * 0.8
      const x = index * (barWidth + barSpacing)
      const y = this.canvas.height - barHeight

      const hue = (index / dataArray.length) * 360
      this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
      this.ctx.fillRect(x, y, barWidth, barHeight)
    })
  }

  private drawWaveform(dataArray: Uint8Array) {
    this.ctx.strokeStyle = '#00ff88'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()

    const sliceWidth = this.canvas.width / dataArray.length
    let x = 0

    dataArray.forEach((value, index) => {
      const v = value / 128.0
      const y = (v * this.canvas.height) / 2

      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }

      x += sliceWidth
    })

    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2)
    this.ctx.stroke()
  }

  private drawCircles(dataArray: Uint8Array) {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 3

    dataArray.forEach((value, index) => {
      const radius = (value / 255) * maxRadius
      const angle = (index / dataArray.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      const hue = (index / dataArray.length) * 360
      this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.config.circleRadius, 0, Math.PI * 2)
      this.ctx.fill()
    })
  }

  private clearCanvas() {
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private setMode(mode: VisualizationMode) {
    this.currentMode = mode
    
    // Update active button state
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active')
  }

  private setVolume(value: number) {
    if (this.audioElement) {
      this.audioElement.volume = value
    }
  }

  private updatePlayButton(isPlaying: boolean) {
    const playButton = document.getElementById('playButton') as HTMLButtonElement
    playButton.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play'
  }

  private updateFileName(name: string) {
    const fileNameElement = document.getElementById('fileName')
    if (fileNameElement) {
      fileNameElement.textContent = name
    }
  }

  private handleResize() {
    this.setupCanvas()
  }
}
