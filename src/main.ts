import './style.css'
import { AudioVisualizer } from './core/AudioVisualizer'

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // You can customize the visualizer configuration here
  const visualizer = new AudioVisualizer({
    fftSize: 256,           // Higher values = more detailed visualization
    smoothingTimeConstant: 0.8,  // Lower values = more responsive
    barSpacing: 2,          // Space between frequency bars
    circleRadius: 3          // Size of circle particles
  })

  // Example: Update configuration at runtime
  // visualizer.updateConfig({ barSpacing: 4, circleRadius: 5 })

  // Example: Get current state
  // console.log('Current mode:', visualizer.getCurrentMode())
  // console.log('Is playing:', visualizer.getIsPlaying())
})
