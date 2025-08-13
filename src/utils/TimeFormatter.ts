export class TimeFormatter {
  static formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  static formatTimeWithHours(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  static parseTimeString(timeString: string): number {
    const parts = timeString.split(':').map(Number)
    
    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    
    return 0
  }

  static secondsToMinutes(seconds: number): number {
    return seconds / 60
  }

  static minutesToSeconds(minutes: number): number {
    return minutes * 60
  }
}
