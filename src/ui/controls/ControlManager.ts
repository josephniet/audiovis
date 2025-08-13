import type { VisualizationMode } from '../../types'

export class ControlManager {
  private fileInput: HTMLInputElement
  private playButton: HTMLButtonElement
  private modeButtons: NodeListOf<HTMLButtonElement>
  private volumeSlider: HTMLInputElement
  private progressBar: HTMLInputElement
  private currentTimeElement: HTMLElement
  private durationElement: HTMLElement
  private fileNameElement: HTMLElement

  // Events
  private onFileSelect: ((file: File) => void) | null = null
  private onPlayToggle: (() => void) | null = null
  private onModeChange: ((mode: VisualizationMode) => void) | null = null
  private onVolumeChange: ((volume: number) => void) | null = null
  private onProgressInput: ((progress: number) => void) | null = null
  private onProgressChange: ((progress: number) => void) | null = null

  constructor() {
    this.initializeElements()
    this.setupEventListeners()
  }

  private initializeElements() {
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement
    this.playButton = document.getElementById('playButton') as HTMLButtonElement
    this.modeButtons = document.querySelectorAll('.mode-btn') as NodeListOf<HTMLButtonElement>
    this.volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement
    this.progressBar = document.getElementById('progressBar') as HTMLInputElement
    this.currentTimeElement = document.getElementById('currentTime')!
    this.durationElement = document.getElementById('duration')!
    this.fileNameElement = document.getElementById('fileName')!
  }

  private setupEventListeners() {
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e))
    this.playButton.addEventListener('click', () => this.handlePlayToggle())
    
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleModeChange(e))
    })
    
    this.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e))
    this.progressBar.addEventListener('input', (e) => this.handleProgressInput(e))
    this.progressBar.addEventListener('change', (e) => this.handleProgressChange(e))
  }

  setEventHandlers(handlers: {
    onFileSelect?: (file: File) => void
    onPlayToggle?: () => void
    onModeChange?: (mode: VisualizationMode) => void
    onVolumeChange?: (volume: number) => void
    onProgressInput?: (progress: number) => void
    onProgressChange?: (progress: number) => void
  }) {
    this.onFileSelect = handlers.onFileSelect || null
    this.onPlayToggle = handlers.onPlayToggle || null
    this.onModeChange = handlers.onModeChange || null
    this.onVolumeChange = handlers.onVolumeChange || null
    this.onProgressInput = handlers.onProgressInput || null
    this.onProgressChange = handlers.onProgressChange || null
  }

  private handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file && file.type.startsWith('audio/')) {
      this.onFileSelect?.(file)
    }
  }

  private handlePlayToggle() {
    this.onPlayToggle?.()
  }

  private handleModeChange(event: Event) {
    const target = event.target as HTMLButtonElement
    const mode = target.dataset.mode as VisualizationMode
    this.onModeChange?.(mode)
  }

  private handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement
    const volume = parseFloat(target.value)
    this.onVolumeChange?.(volume)
  }

  private handleProgressInput(event: Event) {
    const target = event.target as HTMLInputElement
    const progress = parseFloat(target.value)
    this.onProgressInput?.(progress)
  }

  private handleProgressChange(event: Event) {
    const target = event.target as HTMLInputElement
    const progress = parseFloat(target.value)
    this.onProgressChange?.(progress)
  }

  updatePlayButton(isPlaying: boolean) {
    this.playButton.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play'
  }

  updateFileName(name: string) {
    this.fileNameElement.textContent = name
  }

  updateTimeDisplay(currentTime: string, duration: string) {
    this.currentTimeElement.textContent = currentTime
    this.durationElement.textContent = duration
  }

  updateProgress(progress: number) {
    this.progressBar.value = progress.toString()
  }

  setMode(mode: VisualizationMode) {
    // Update active button state
    this.modeButtons.forEach(btn => {
      btn.classList.remove('active')
    })
    
    const activeButton = document.querySelector(`[data-mode="${mode}"]`) as HTMLButtonElement
    if (activeButton) {
      activeButton.classList.add('active')
    }
  }

  setVolume(volume: number) {
    this.volumeSlider.value = volume.toString()
  }

  resetFileInput() {
    this.fileInput.value = ''
  }

  cleanup() {
    // Remove event listeners if needed
    this.resetFileInput()
  }
}
