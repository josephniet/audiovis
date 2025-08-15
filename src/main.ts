import './style.css'
import AudioLoader from './audio/AudioLoader.ts';
import { AudioVisualiser } from './visualisation/AudioVisualiser.ts';

document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button')
  button.textContent = 'Play Audio'
  document.body.appendChild(button)
  button.addEventListener('click', () => {
      const audioLoader = new AudioLoader()
      audioLoader.loadAudio('/public/track 1.mp3').then(audioBuffer => {
          audioLoader.playAudio(audioBuffer)
          const audioVisualiser = new AudioVisualiser(audioBuffer)
      })
  })
})
