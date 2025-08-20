import controlsHtml from '@/visualiser/templates/controls.html?raw';
import controlsCss from '@/visualiser/templates/controls.css?raw';
import { EventManager } from '@/visualiser/utils/event-manager';
import { EVENT_NAMES } from '@/visualiser/utils/events';
import type { EVENT_NAMES, ProgressUpdateEvent, PlayStateUpdateEvent, DurationUpdateEvent, SeekEvent, VolumeEvent } from '@/visualiser/utils/events'

export class ControlsComponent extends HTMLElement {
    private connectedCount = 0
    private playButton: HTMLButtonElement
    private stopButton: HTMLButtonElement
    private progressSlider: HTMLInputElement
    private volumeSlider: HTMLInputElement
    private currentTime: HTMLElement
    private duration: HTMLElement
    private nextButton: HTMLButtonElement
    private previousButton: HTMLButtonElement
    private isPlaying: boolean = false
    private isDragging: boolean = false
    private eventManager: EventManager
    constructor() {
        super()
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.innerHTML = controlsHtml
        const style = document.createElement('style')
        style.textContent = controlsCss
        shadow.appendChild(style)
        this.eventManager = new EventManager()
        this.initialiseElements()
    }
    initialiseElements() {
        this.playButton = this.shadowRoot?.querySelector('.audio-btn--play') as HTMLButtonElement
        this.stopButton = this.shadowRoot?.querySelector('.audio-btn--stop') as HTMLButtonElement
        this.progressSlider = this.shadowRoot?.querySelector('.audio-progress__slider') as HTMLInputElement
        this.volumeSlider = this.shadowRoot?.querySelector('.audio-volume__slider') as HTMLInputElement
        this.currentTime = this.shadowRoot?.querySelector('.audio-time__current') as HTMLElement
        this.duration = this.shadowRoot?.querySelector('.audio-time__duration') as HTMLElement
        this.nextButton = this.shadowRoot?.querySelector('.audio-btn--next') as HTMLButtonElement
        this.previousButton = this.shadowRoot?.querySelector('.audio-btn--previous') as HTMLButtonElement
    }
    connectedCallback() {
        this.connectedCount++
        if (this.connectedCount > 1) {
            console.log('controls already connected')
            return
        }
        console.log('connected controls', this.connectedCount)
        this.setupControlListeners()
        this.setupExternalListeners()
    }
    pause() {
        this.isPlaying = false
        this.playButton.classList.remove('playing')
        this.playButton.classList.remove('paused')
    }
    play() {
        this.isPlaying = true
        this.playButton.classList.remove('paused')
        this.playButton.classList.add('playing')
    }

    private setupControlListeners() {
        this.playButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.eventManager.emit(EVENT_NAMES.PAUSE)
                this.pause()
            }
            else {
                this.eventManager.emit(EVENT_NAMES.PLAY)
                this.play()
            }
        })
        this.stopButton.addEventListener('click', () => {
            this.eventManager.emit(EVENT_NAMES.STOP)
            this.pause()
        })
        this.nextButton.addEventListener('click', () => {
            this.eventManager.emit(EVENT_NAMES.NEXT)
        })
        this.previousButton.addEventListener('click', () => {
            this.eventManager.emit(EVENT_NAMES.PREVIOUS)
        })
        this.progressSlider.addEventListener('input', (e) => {
            const time = parseFloat(this.progressSlider.value)
            this.eventManager.emit<SeekEvent>(EVENT_NAMES.SEEK, { time })
        })
        this.progressSlider.addEventListener('pointerdown', () => {
            this.isDragging = true
        })
        this.progressSlider.addEventListener('pointerup', () => {
            this.isDragging = false
            const time = parseFloat(this.progressSlider.value)
            this.eventManager.emit<SeekEvent>(EVENT_NAMES.SEEK, { time: this.progressSlider.value })
        })
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(this.volumeSlider.value)
            this.eventManager.emit<VolumeEvent>(EVENT_NAMES.VOLUME, { volume })
        })
    }
    private formatTime(time: number) {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    private setupExternalListeners() {
        this.eventManager.on<ProgressUpdateEvent>(EVENT_NAMES.PROGRESS_UPDATE, (event) => {
            if (this.isDragging) {
                return
            }
            const { currentTime, duration } = event.detail
            this.progressSlider.value = currentTime.toString()
            this.currentTime.textContent = this.formatTime(currentTime)
        })
        this.eventManager.on<PlayStateUpdateEvent>(EVENT_NAMES.PLAY_STATE_UPDATE, (event) => {
            this.isPlaying = event.detail.isPlaying
            if (this.isPlaying) {
                this.play()
            }
            else {
                this.pause()
            }
        })
        this.eventManager.on<DurationUpdateEvent>(EVENT_NAMES.DURATION_UPDATE, (event) => {
            const { duration } = event.detail
            console.log('duration update x', duration)
            if (isNaN(duration)) {
                throw new Error('currentTime is NaN')
            }
            this.duration.textContent = this.formatTime(duration)
            this.progressSlider.max = duration.toString()
        })
    }
}

customElements.define('controls-component', ControlsComponent)