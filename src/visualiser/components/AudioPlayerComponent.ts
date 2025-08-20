import audioPlayerTemplate from '@/visualiser/templates/audio-player.html?raw';
import type { VisualiserComponent } from './VisualiserComponent';
import type { ProgressUpdateEvent, PlayStateUpdateEvent, DurationUpdateEvent, SeekEvent, VolumeEvent } from '@/visualiser/utils/events';
import { EVENT_NAMES } from '@/visualiser/utils/events';
import { EventManager } from '@/visualiser/utils/event-manager';
export class AudioPlayerComponent extends HTMLElement {

    private playlist: string[] = []
    private playlistIndex: number = 0
    //elements
    private audioElement: HTMLAudioElement
    private eventManager: EventManager
    private audioContext: AudioContext
    constructor() {
        super()
        this.audioContext = new AudioContext()
        this.eventManager = new EventManager()
        this.attachShadow({ mode: 'open' })
        const tpl = document.createElement('template')
        tpl.innerHTML = audioPlayerTemplate
        this.shadowRoot?.appendChild(tpl.content.cloneNode(true))
    }
    public getAudioContext() {
        return this.audioContext
    }
    connectedCallback() {
        this.initialiseElements()
        this.setupControlListeners()
        this.setupAudioListeners()
        this.setupPlaylist()
    }
    disconnectedCallback() {
        this.audioContext.close();
    }

    setupPlaylist() {
        const scriptTag = this.querySelector('script[type="application/json"][data-config="playlist"]');
        if (scriptTag) {
            try {
                const jsonData = JSON.parse(scriptTag.textContent || '{}')
                this.playlist = jsonData.playlist
                console.log('audio playlist data', jsonData)
            } catch (error) {
                console.error('Error parsing audio playlist data', error)
            }
        }
    }
    initialiseElements() {
        this.audioElement = this.querySelector('audio') as HTMLAudioElement
        this.durationUpdate()
    }
    durationUpdate() {
        this.eventManager.emit<DurationUpdateEvent>(EVENT_NAMES.DURATION_UPDATE, {
            duration: this.audioElement.duration
        })
    }

    setupAudioListeners() {
        this.audioElement.addEventListener('timeupdate', () => {
            this.eventManager.emit<ProgressUpdateEvent>(EVENT_NAMES.PROGRESS_UPDATE, {
                currentTime: this.audioElement.currentTime,
                duration: this.audioElement.duration
            })
        })
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.durationUpdate()
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
        this.audioElement.src = this.playlist[this.playlistIndex].src
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
        this.audioElement.src = this.playlist[this.playlistIndex].src
        this.audioElement.play()
    }
    setupControlListeners() {
        this.eventManager.on(EVENT_NAMES.PLAY, () => {
            this.audioElement.play()
            this.eventManager.emit(EVENT_NAMES.PLAY_STATE_UPDATE, { isPlaying: true })
        })
        this.eventManager.on(EVENT_NAMES.PAUSE, () => {
            this.audioElement.pause()
            this.eventManager.emit(EVENT_NAMES.PLAY_STATE_UPDATE, { isPlaying: false })
        })
        this.eventManager.on(EVENT_NAMES.STOP, () => {
            this.audioElement.pause()
            this.audioElement.currentTime = 0
            this.eventManager.emit(EVENT_NAMES.PLAY_STATE_UPDATE, { isPlaying: false })
        })
        this.eventManager.on(EVENT_NAMES.NEXT, () => {
            this.nextTrack()
        })
        this.eventManager.on(EVENT_NAMES.PREVIOUS, () => {
            this.previousTrack()
        })
        this.eventManager.on(EVENT_NAMES.SEEK, (event) => {
            this.audioElement.currentTime = event.detail.time
        })
        this.eventManager.on(EVENT_NAMES.VOLUME, (event) => {
            this.audioElement.volume = event.detail.volume
        })
    }

}