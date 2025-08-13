export const AUDIO_CONFIG = {
  DEFAULT_FFT_SIZE: 256,
  DEFAULT_SMOOTHING_TIME_CONSTANT: 0.8,
  PROGRESS_UPDATE_INTERVAL: 100,
  DEFAULT_VOLUME: 0.7,
  SUPPORTED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
  DEFAULT_AUDIO_PATH: '/track 1.mp3'
} as const

export const FFT_SIZES = [128, 256, 512, 1024, 2048] as const
export type FFTSize = typeof FFT_SIZES[number]

export const SMOOTHING_VALUES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const
export type SmoothingValue = typeof SMOOTHING_VALUES[number]
