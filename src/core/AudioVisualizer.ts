import type { AudioVisualizerConfig } from '../types'
import { AudioManager, ProgressManager } from './audio'
import { VisualizationEngine } from './visualization'
import { ControlManager } from '../ui'
import { TimeFormatter } from '../utils'
import { AUDIO_CONFIG, VISUAL_CONFIG } from '../constants'

export class AudioVisualizer {
  private audioManager: AudioManager
  private progressManager: ProgressManager
  private visualizationEngine: VisualizationEngine
  private controlManager: ControlManager

  constructor(config: AudioVisualizerConfig = {}) {
    const canvas = document.getElementById('visualizer') as HTMLCanvasElement
    
    // Initialize managers with configuration
    this.audioManager = new AudioManager(
      config.fftSize || AUDIO_CONFIG.DEFAULT_FFT_SIZE,
      config.smoothingTimeConstant || AUDIO_CONFIG.DEFAULT_SMOOTHING_TIME_CONSTANT
    )
    
    this.progressManager = new ProgressManager(
      AUDIO_CONFIG.PROGRESS_UPDATE_INTERVAL
    )
    
    this.visualizationEngine = new VisualizationEngine(canvas, {
      barSpacing: config.barSpacing || VISUAL_CONFIG.DEFAULT_BAR_SPACING,
      lineWidth: VISUAL_CONFIG.DEFAULT_LINE_WIDTH,
      circleRadius: config.circleRadius || VISUAL_CONFIG.DEFAULT_CIRCLE_RADIUS,
      ringSpacing: config.ringSpacing || VISUAL_CONFIG.DEFAULT_RING_SPACING,
      maxRings: config.maxRings || VISUAL_CONFIG.DEFAULT_MAX_RINGS,
      ringThickness: config.ringThickness || VISUAL_CONFIG.DEFAULT_RING_THICKNESS
    })
    
    this.controlManager = new ControlManager()
    
    this.setupEventHandlers()
    this.setupResizeHandler()
    
    // Load default audio file
    this.loadDefaultAudio()
  }

  private setupEventHandlers() {
    // Audio Manager events
    this.audioManager.setEventHandlers({
      onCanPlay: () => {
        this.controlManager.updatePlayButton(false)
        this.progressManager.setDuration(this.audioManager.getDuration())
        this.progressManager.startProgressUpdates()
      },
      onEnded: () => {
        this.controlManager.updatePlayButton(false)
        this.visualizationEngine.stopVisualization()
        this.progressManager.stopProgressUpdates()
        this.progressManager.reset()
      },
      onTimeUpdate: () => {
        const currentTime = this.audioManager.getCurrentTime()
        this.progressManager.setCurrentTime(currentTime)
      }
    })

    // Progress Manager events
    this.progressManager.setEventHandlers({
      onProgressUpdate: (currentTime, duration) => {
        const currentTimeStr = TimeFormatter.formatTime(currentTime)
        const durationStr = TimeFormatter.formatTime(duration)
        this.controlManager.updateTimeDisplay(currentTimeStr, durationStr)
        this.controlManager.updateProgress(this.progressManager.getProgress())
      },
      onSeek: (time) => {
        this.audioManager.setCurrentTime(time)
      }
    })

    // Control Manager events
    this.controlManager.setEventHandlers({
      onFileSelect: (file) => this.handleFileSelect(file),
      onPlayToggle: () => this.handlePlayToggle(),
      onModeChange: (mode) => this.handleModeChange(mode),
      onVolumeChange: (volume) => this.handleVolumeChange(volume),
      onProgressInput: (progress) => this.handleProgressInput(progress),
      onProgressChange: (progress) => this.handleProgressChange(progress)
    })
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.visualizationEngine.resize()
    })
  }

  private async loadDefaultAudio() {
    try {
      await this.audioManager.loadAudio(AUDIO_CONFIG.DEFAULT_AUDIO_PATH)
      this.controlManager.updateFileName('track 1.mp3 (default)')
      
      // Set up visualization
      const analyser = this.audioManager.getAnalyser()
      if (analyser) {
        this.visualizationEngine.setAnalyser(analyser)
      }
    } catch (error) {
      console.log('Default audio file not found, waiting for user upload...')
    }
  }

  private async handleFileSelect(file: File) {
    try {
      const url = URL.createObjectURL(file)
      await this.audioManager.loadAudio(url)
      this.controlManager.updateFileName(file.name)
      
      // Set up visualization
      const analyser = this.audioManager.getAnalyser()
      if (analyser) {
        this.visualizationEngine.setAnalyser(analyser)
      }
    } catch (error) {
      console.error('Error loading audio file:', error)
    }
  }

  private async handlePlayToggle() {
    const isPlaying = await this.audioManager.togglePlayback()
    this.controlManager.updatePlayButton(isPlaying)
    
    if (isPlaying) {
      this.visualizationEngine.startVisualization()
      this.progressManager.startProgressUpdates()
    } else {
      this.visualizationEngine.stopVisualization()
      this.progressManager.stopProgressUpdates()
    }
  }

  private handleModeChange(mode: string) {
    this.visualizationEngine.setMode(mode as any)
    this.controlManager.setMode(mode as any)
  }

  private handleVolumeChange(volume: number) {
    this.audioManager.setVolume(volume)
  }

  private handleProgressInput(progress: number) {
    // Don't seek while dragging, just update the time display
    const duration = this.audioManager.getDuration()
    if (duration > 0) {
      const seekTime = (progress / 100) * duration
      const seekTimeStr = TimeFormatter.formatTime(seekTime)
      const durationStr = TimeFormatter.formatTime(duration)
      this.controlManager.updateTimeDisplay(seekTimeStr, durationStr)
    }
  }

  private handleProgressChange(progress: number) {
    // Seek to the new position when user releases the slider
    this.progressManager.seekToProgress(progress)
  }

  // Public API methods
  updateConfig(newConfig: Partial<AudioVisualizerConfig>) {
    // Update audio manager config
    if (newConfig.fftSize || newConfig.smoothingTimeConstant) {
      // Note: Audio context needs to be recreated for FFT size changes
      // This is a limitation of the Web Audio API
      console.warn('FFT size and smoothing changes require audio reload')
    }
    
    // Update visualization config
    this.visualizationEngine.updateConfig({
      barSpacing: newConfig.barSpacing,
      lineWidth: VISUAL_CONFIG.DEFAULT_LINE_WIDTH,
      circleRadius: newConfig.circleRadius,
      ringSpacing: newConfig.ringSpacing,
      maxRings: newConfig.maxRings,
      ringThickness: newConfig.ringThickness
    })
  }

  getCurrentMode() {
    return this.visualizationEngine.getCurrentMode()
  }

  getIsPlaying() {
    return this.audioManager.getIsPlaying()
  }

  getCurrentTime() {
    return this.audioManager.getCurrentTime()
  }

  getDuration() {
    return this.audioManager.getDuration()
  }

  cleanup() {
    this.audioManager.cleanup()
    this.progressManager.cleanup()
    this.visualizationEngine.cleanup()
    this.controlManager.cleanup()
  }
}
