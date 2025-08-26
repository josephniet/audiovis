import { BaseComponent } from './BaseComponent'
import { playlistData, type Track } from '@/utils/PlaylistData'
import audioPlayerTemplate from '@/audio-player.html?raw'
import audioPlayerCSS from '@/audio-player.css?raw'
import type ControlsComponent from './ControlsComponent'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'
import type { AudioReadyEvent, ProgressUpdateEvent, AudioPlayerData } from '@/utils/Events'
import { Playlist } from '@/Playlist'
import type { LyricsComponent } from './LyricsComponent'

export default class AudioPlayerComponent extends BaseComponent {
    private audioElement: HTMLAudioElement
    private coverImage: HTMLImageElement
    private visualiserCanvas: HTMLCanvasElement
    private controlsComponent: ControlsComponent
    private eventManager = new EventManager()
    private audioContext = new AudioContext()
    private playlist = new Playlist()
    private handlers: Record<keyof typeof EVENT_NAMES, (event: CustomEvent<unknown>) => void> = {
        [EVENT_NAMES.PLAY]: this.play,
    }
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = audioPlayerTemplate
        const style = document.createElement('style')
        style.textContent = audioPlayerCSS
        shadowRoot.appendChild(style)
        this.controlsComponent = this.shadowRoot?.querySelector('controls-component') as ControlsComponent
        this.audioElement = this.shadowRoot?.querySelector('audio') as HTMLAudioElement
        this.coverImage = this.shadowRoot?.querySelector('#cover-image') as HTMLImageElement
        this.visualiserCanvas = this.shadowRoot?.querySelector('#visualiser-canvas') as HTMLCanvasElement
    }
    connectedCallback() {
        console.log('audio player component connected', this.connectedCount)
        this.connectedCount++
        this.setupHandlers()
        this.setupAudioListeners()
        this.setupPlaylist()
        this.playlist.goToTrack(0)
        this.setupLyricsListeners()
    }
    public getaudioElement() {
        return this.audioElement
    }
    setupPlaylist() {
        playlistData.forEach((track) => {
            this.playlist.addTrack(track)
        })
    }
    emitAudioPlayerData() {
        this.eventManager.emit(EVENT_NAMES.AUDIO_PLAYER_DATA, {
            audioElement: this.audioElement,
            audioContext: this.audioContext,
            duration: this.audioElement.duration,
            track: this.playlist.getCurrentTrack()
        })
    }
    setupLyricsListeners() {
        this.eventManager.on(EVENT_NAMES.REQUEST_AUDIO_PLAYER_DATA, (event: CustomEvent<{ audioPlayerComponent: AudioPlayerComponent }>) => {
            this.emitAudioPlayerData()
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
            if (this.readyState === 'pending') {
                this.resolveReady()
            }
            this.durationUpdate()
        })
        this.audioElement.addEventListener('ended', () => {
            this.nextTrack()
            this.play()
        })
    }
    durationUpdate() {
        this.eventManager.emit(EVENT_NAMES.DURATION_UPDATE, {
            duration: this.audioElement.duration
        })
    }
    setupHandlers() {
        const eventManager = this.eventManager
        this.handlers = {
            [EVENT_NAMES.PLAY]: this.play,
            [EVENT_NAMES.PAUSE]: this.pause,
            [EVENT_NAMES.STOP]: this.stop,
            [EVENT_NAMES.NEXT]: this.nextTrack,
            [EVENT_NAMES.PREVIOUS]: this.previousTrack,
            [EVENT_NAMES.TRACK_CHANGED]: this.trackChanged,
        }
        for (const [event, handler] of Object.entries(this.handlers as Record<keyof typeof EVENT_NAMES, (event: CustomEvent<unknown>) => void>)) {
            this.eventManager.on(event as keyof typeof EVENT_NAMES, handler as (event: CustomEvent<unknown>) => void)
        }
        eventManager.on(EVENT_NAMES.SEEK, (event: CustomEvent<{ currentTime: number }>) => {
            this.seek(event.detail.currentTime)
        })
        eventManager.on(EVENT_NAMES.VOLUME, (event: CustomEvent<{ volume: number }>) => {
            this.volume(event.detail.volume)
        })
    }
    load() {
        this.audioElement.load()
    }
    play = () => {
        console.log('play')
        this.audioElement.play()
        this.eventManager.emit(EVENT_NAMES.PLAY_STATE_UPDATE, { isPlaying: true })
    }
    pause = () => { this.audioElement.pause() }
    stop = () => { this.audioElement.pause(); this.audioElement.currentTime = 0 }
    nextTrack = () => {
        this.playlist.nextTrack();
    }
    trackChanged = (event: CustomEvent<{ track: Track }>) => {
        console.log('track changed event received', event)
        const track = event.detail.track
        const isPaused = this.audioElement.paused
        console.log('track change received', track, isPaused)
        this.audioElement.src = track.src
        this.coverImage.src = track.cover
        this.load()
        if (isPaused) return
        this.play()
    }
    previousTrack = () => { this.playlist.previousTrack() }
    seek = (time: number) => {
        console.log('seek', time)
        this.audioElement.currentTime = time
    }
    volume = (volume: number) => { this.audioElement.volume = volume }

}

customElements.define('audio-player-component', AudioPlayerComponent)