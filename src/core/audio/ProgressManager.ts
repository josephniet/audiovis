export class ProgressManager {
  private progressUpdateInterval: number | null = null
  private currentTime: number = 0
  private duration: number = 0

  // Events
  private onProgressUpdate: ((currentTime: number, duration: number) => void) | null = null
  private onSeek: ((time: number) => void) | null = null

  constructor(private updateInterval: number = 100) {}

  setEventHandlers(handlers: {
    onProgressUpdate?: (currentTime: number, duration: number) => void
    onSeek?: (time: number) => void
  }) {
    this.onProgressUpdate = handlers.onProgressUpdate || null
    this.onSeek = handlers.onSeek || null
  }

  startProgressUpdates() {
    if (this.progressUpdateInterval) return
    
    this.progressUpdateInterval = window.setInterval(() => {
      this.updateProgress()
    }, this.updateInterval)
  }

  stopProgressUpdates() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval)
      this.progressUpdateInterval = null
    }
  }

  updateProgress() {
    if (this.duration > 0) {
      this.onProgressUpdate?.(this.currentTime, this.duration)
    }
  }

  setCurrentTime(time: number) {
    this.currentTime = time
    this.updateProgress()
  }

  setDuration(duration: number) {
    this.duration = duration
    this.updateProgress()
  }

  getCurrentTime(): number {
    return this.currentTime
  }

  getDuration(): number {
    return this.duration
  }

  getProgress(): number {
    if (this.duration <= 0) return 0
    return (this.currentTime / this.duration) * 100
  }

  seekToProgress(progress: number) {
    const seekTime = (progress / 100) * this.duration
    this.currentTime = seekTime
    this.onSeek?.(seekTime)
    this.updateProgress()
  }

  seekToTime(time: number) {
    this.currentTime = Math.max(0, Math.min(time, this.duration))
    this.onSeek?.(this.currentTime)
    this.updateProgress()
  }

  reset() {
    this.currentTime = 0
    this.duration = 0
    this.stopProgressUpdates()
  }

  cleanup() {
    this.stopProgressUpdates()
    this.reset()
  }
}
