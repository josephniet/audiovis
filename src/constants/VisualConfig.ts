export const VISUAL_CONFIG = {
  DEFAULT_BAR_SPACING: 2,
  DEFAULT_LINE_WIDTH: 2,
  DEFAULT_CIRCLE_RADIUS: 3,
  DEFAULT_RING_SPACING: 8,
  DEFAULT_MAX_RINGS: 20,
  DEFAULT_RING_THICKNESS: 3,
  CANVAS_BACKGROUND: '#1a1a1a',
  DEFAULT_BAR_HEIGHT_MULTIPLIER: 0.8,
  DEFAULT_CIRCLE_OPACITY: 0.7,
  COLOR_SATURATION: 70,
  COLOR_LIGHTNESS: 60
} as const

export const BAR_SPACING_OPTIONS = [0, 1, 2, 3, 4, 5] as const
export type BarSpacing = typeof BAR_SPACING_OPTIONS[number]

export const LINE_WIDTH_OPTIONS = [1, 2, 3, 4, 5] as const
export type LineWidth = typeof LINE_WIDTH_OPTIONS[number]

export const CIRCLE_RADIUS_OPTIONS = [1, 2, 3, 4, 5, 6] as const
export type CircleRadius = typeof CIRCLE_RADIUS_OPTIONS[number]

export const RING_SPACING_OPTIONS = [4, 6, 8, 10, 12, 16] as const
export type RingSpacing = typeof RING_SPACING_OPTIONS[number]

export const MAX_RINGS_OPTIONS = [12, 16, 20, 24, 32, 40] as const
export type MaxRings = typeof MAX_RINGS_OPTIONS[number]

export const RING_THICKNESS_OPTIONS = [2, 3, 4, 5, 6, 8] as const
export type RingThickness = typeof RING_THICKNESS_OPTIONS[number]
