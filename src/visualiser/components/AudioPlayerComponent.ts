import audioPlayerTemplate from '@/visualiser/templates/audio-player.html?raw';
import type { VisualiserComponent } from './VisualiserComponent';
export class AudioPlayerComponent extends HTMLElement {

    private playlist: string[] = []
    private playlistIndex: number = 0
    //elements
    private audioElement: HTMLAudioElement
    private visualiserSlot: HTMLSlotElement
    private playButton: HTMLButtonElement
    private stopButton: HTMLButtonElement
    private progressSlider: HTMLInputElement
    private volumeSlider: HTMLInputElement
    private currentTime: HTMLElement
    private duration: HTMLElement
    private nextButton: HTMLButtonElement
    private previousButton: HTMLButtonElement
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        const tpl = document.createElement('template')
        tpl.innerHTML = audioPlayerTemplate
        this.shadowRoot?.appendChild(tpl.content.cloneNode(true))
    }
    connectedCallback() {
        this.initialiseElements()
        this.setupControlListeners()
        this.setupAudioListeners()
        this.setupPlaylist()
        this.setupDomListeners()
        this.passContextToChildren(this.visualiserSlot)
    }
    disconnectedCallback() {

    }
    passContextToChildren(slot: HTMLSlotElement) {
        const assignedNodes = slot.assignedElements({ flatten: true });
        assignedNodes.forEach(el => {
          if (el.tagName.toLowerCase() === 'visualiser-component') {
            console.log('passing context to visualiser', el)
            el.dispatchEvent(new CustomEvent('audio-element-ready', {
                detail: {audioElement: this.audioElement},
                bubbles: true,
                composed: true
            }))
          }
        });
    }
    setupPlaylist() {
        const playlist = this.getAttribute('playlist')
        if (playlist) {
            this.playlist = playlist.split(',')
        }
    }
    initialiseElements() {
        this.audioElement = this.querySelector('audio') as HTMLAudioElement
        this.playButton = this.shadowRoot?.querySelector('.audio-btn--play') as HTMLButtonElement
        this.stopButton = this.shadowRoot?.querySelector('.audio-btn--stop') as HTMLButtonElement
        this.progressSlider = this.shadowRoot?.querySelector('.audio-progress__slider') as HTMLInputElement
        this.volumeSlider = this.shadowRoot?.querySelector('.audio-volume__slider') as HTMLInputElement
        this.currentTime = this.shadowRoot?.querySelector('.audio-time__current') as HTMLElement
        this.duration = this.shadowRoot?.querySelector('.audio-time__duration') as HTMLElement
        this.nextButton = this.shadowRoot?.querySelector('.audio-btn--next') as HTMLButtonElement
        this.previousButton = this.shadowRoot?.querySelector('.audio-btn--previous') as HTMLButtonElement
        this.visualiserSlot = this.shadowRoot?.querySelector('slot[name="visualiser"]') as HTMLSlotElement
    }
    setupDomListeners() {
        this.visualiserSlot.addEventListener('slotchange',()=>{
            console.log('slotchange')
            this.passContextToChildren(this.visualiserSlot)
        })
    }
    setupAudioListeners() {
        this.audioElement.addEventListener('timeupdate', () => {
            const ratio = this.audioElement.currentTime / this.audioElement.duration
            this.progressSlider.value = ratio.toString()
        })
        this.audioElement.addEventListener('ended', () => {
            this.nextTrack()
        })
    }
    nextTrack() {
        this.audioElement.pause()
        this.audioElement.currentTime = 0
        this.playlistIndex++
        if (this.playlistIndex >= this.playlist.length) {
            this.playlistIndex = 0
        }
        this.audioElement.src = this.playlist[this.playlistIndex]
        this.audioElement.currentTime = 0
        this.audioElement.play()
    }
    previousTrack() {
        this.audioElement.pause()
        this.audioElement.currentTime = 0
        this.playlistIndex--
        if (this.playlistIndex < 0) {
            this.playlistIndex = this.playlist.length - 1
        }
        this.audioElement.src = this.playlist[this.playlistIndex]
        this.audioElement.play()
    }
    setupControlListeners() {
        this.playButton.addEventListener('click', () => {
            if (this.audioElement.paused) {
                this.audioElement.play()
            } else {
                this.audioElement.pause()
            }
        })
        this.stopButton.addEventListener('click', () => {
            this.audioElement.pause()
            this.audioElement.currentTime = 0
        })
        this.nextButton.addEventListener('click', () => {
            this.nextTrack()
        })
        this.previousButton.addEventListener('click', () => {
            this.previousTrack()
        })
        this.progressSlider.addEventListener('input', (e) => {
            this.audioElement.currentTime = (this.audioElement.duration * (e.target as HTMLInputElement).value)
        })
        this.volumeSlider.addEventListener('input', (e) => {
            this.audioElement.volume = parseFloat((e.target as HTMLInputElement).value)
        })
        this.currentTime.textContent = '00:00'
        this.duration.textContent = '00:00'
    }

}