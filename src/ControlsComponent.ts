import { BaseComponent } from './BaseComponent'
import controlsTemplate from '@/controls.html?raw'
import controlsCSS from '@/controls.css?raw'
import { formatTime } from '@/utils/formatTime'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'
import type { SeekEvent, VolumeEvent, ProgressUpdateEvent, PlayStateUpdateEvent, DurationUpdateEvent } from '@/utils/Events'

export default class ControlsComponent extends BaseComponent {
    private playButton: HTMLButtonElement
    private stopButton: HTMLButtonElement
    private progressSlider: HTMLInputElement
    private volumeSlider: HTMLInputElement
    private currentTime: HTMLElement
    private duration: HTMLElement
    private nextButton: HTMLButtonElement
    private previousButton: HTMLButtonElement
    private isPlaying: boolean = false
    private eventManager = new EventManager()
    private isDragging: boolean = false
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = controlsTemplate
        const style = document.createElement('style')
        style.textContent = controlsCSS
        shadowRoot.appendChild(style)
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
        console.log('controls component connected', this.connectedCount)
        this.setupControlListeners()
        this.setupExternalListeners()
    }

    pause() {
        this.eventManager.emit(EVENT_NAMES.PAUSE)
        this.isPlaying = false
        this.playButton.classList.remove('playing')
        this.playButton.classList.remove('paused')
    }
    play() {
        if (this.isPlaying) { return }
        this.eventManager.emit(EVENT_NAMES.PLAY)
        this.isPlaying = true
        this.playButton.classList.remove('paused')
        this.playButton.classList.add('playing')
    }
    handleProgress() {
        if (this.isDragging) { return }
        const time = parseFloat(this.progressSlider.value)
        this.eventManager.emit<SeekEvent>(EVENT_NAMES.SEEK, { currentTime: time })
    }
    private setupControlListeners() {
        this.playButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause()
            }
            else {
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
            this.handleProgress()
        })
        this.progressSlider.addEventListener('pointerdown', () => {
            this.isDragging = true
            this.handleProgress()
        })
        this.progressSlider.addEventListener('pointerup', () => {
            this.isDragging = false
            this.handleProgress()
        })
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(this.volumeSlider.value)
            this.eventManager.emit<VolumeEvent>(EVENT_NAMES.VOLUME, { volume })
        })
    }
    private setupExternalListeners() {
        this.eventManager.on<ProgressUpdateEvent>(EVENT_NAMES.PROGRESS_UPDATE, (event) => {
            if (this.isDragging) {
                return
            }
            const { currentTime, duration } = event.detail
            this.progressSlider.value = currentTime.toString()
            this.currentTime.textContent = formatTime(currentTime)
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
                throw new Error('currentTime is NaN', duration, event)
            }
            this.duration.textContent = formatTime(duration)
            this.progressSlider.max = duration.toString()
        })
    }
}
customElements.define('controls-component', ControlsComponent)