export type VisualizationMode = 'bars' | 'waveform' | 'circles' | 'radial'

export interface AudioVisualizerConfig {
  fftSize?: number
  smoothingTimeConstant?: number
  barSpacing?: number
  circleRadius?: number
  ringSpacing?: number
  maxRings?: number
  ringThickness?: number
}

export interface VisualizationData {
  frequencyData: Uint8Array
  timeData?: Float32Array
  bufferLength: number
}

export interface ProgressData {
  currentTime: number
  duration: number
  progress: number
}

export interface TimeDisplay {
  currentTime: string
  duration: string
}

// New types for the modular structure
export interface AudioManagerConfig {
  fftSize: number
  smoothingTimeConstant: number
}

export interface ProgressManagerConfig {
  updateInterval: number
}

export interface VisualizationConfig {
  barSpacing?: number
  lineWidth?: number
  circleRadius?: number
}

export interface ControlManagerConfig {
  // Add any control-specific configuration here
}

export interface EventHandlers {
  onCanPlay?: () => void
  onEnded?: () => void
  onTimeUpdate?: () => void
  onProgressUpdate?: (currentTime: number, duration: number) => void
  onSeek?: (time: number) => void
  onFileSelect?: (file: File) => void
  onPlayToggle?: () => void
  onModeChange?: (mode: VisualizationMode) => void
  onVolumeChange?: (volume: number) => void
  onProgressInput?: (progress: number) => void
  onProgressChange?: (progress: number) => void
}
