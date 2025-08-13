export class AudioManager {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private audioElement: HTMLAudioElement | null = null
  private isPlaying = false

  // Events
  private onCanPlay: (() => void) | null = null
  private onEnded: (() => void) | null = null
  private onTimeUpdate: (() => void) | null = null

  constructor(
    private fftSize: number = 256,
    private smoothingTimeConstant: number = 0.8
  ) {}

  setEventHandlers(handlers: {
    onCanPlay?: () => void
    onEnded?: () => void
    onTimeUpdate?: () => void
  }) {
    this.onCanPlay = handlers.onCanPlay || null
    this.onEnded = handlers.onEnded || null
    this.onTimeUpdate = handlers.onTimeUpdate || null
  }

  loadAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.src = ''
      }

      this.audioElement = new Audio(url)
      this.audioElement.crossOrigin = 'anonymous'
      
      this.audioElement.addEventListener('canplay', () => {
        this.initializeAudioContext()
        this.isPlaying = false
        this.onCanPlay?.()
        resolve()
      })

      this.audioElement.addEventListener('error', (error) => {
        reject(error)
      })

      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false
        this.onEnded?.()
      })

      this.audioElement.addEventListener('timeupdate', () => {
        this.onTimeUpdate?.()
      })
    })
  }

  private initializeAudioContext() {
    if (!this.audioElement) return

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    
    const source = this.audioContext.createMediaElementSource(this.audioElement)
    source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
    
    this.analyser.fftSize = this.fftSize
    this.analyser.smoothingTimeConstant = this.smoothingTimeConstant
  }

  async togglePlayback(): Promise<boolean> {
    if (!this.audioElement) return false

    if (this.isPlaying) {
      this.audioElement.pause()
      this.isPlaying = false
    } else {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }
      await this.audioElement.play()
      this.isPlaying = true
    }
    
    return this.isPlaying
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause()
      this.isPlaying = false
    }
  }

  play() {
    if (this.audioElement) {
      this.audioElement.play()
      this.isPlaying = true
    }
  }

  setVolume(value: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, value))
    }
  }

  setCurrentTime(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time
    }
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0
  }

  getDuration(): number {
    return this.audioElement?.duration || 0
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement
  }

  cleanup() {
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.audioContext = null
    this.analyser = null
    this.audioElement = null
    this.isPlaying = false
  }
}
