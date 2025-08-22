import { BaseComponent } from './BaseComponent'
import { playlistData, type Track } from '@/utils/PlaylistData'
import audioPlayerTemplate from '@/audio-player.html?raw'
import audioPlayerCSS from '@/audio-player.css?raw'
import type ControlsComponent from './ControlsComponent'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'
import type { AudioReadyEvent, ProgressUpdateEvent } from '@/utils/Events'
import { Playlist } from '@/Playlist'
import Liricle from 'liricle'

const liricle = new Liricle();

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
        console.log('audio element', this.audioElement)
        console.log('cover image', this.coverImage)
        console.log('visualiser canvas', this.visualiserCanvas)
        console.log('controls component', this.controlsComponent)
        this.setupHandlers()
        this.setupPlaylist()
        this.playlist.goToTrack(0)
    }
    setupPlaylist() {
        playlistData.forEach((track) => {
            this.playlist.addTrack(track)
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
            this.playlist.nextTrack()
        })
    }
    durationUpdate() {
        this.eventManager.emit(EVENT_NAMES.DURATION_UPDATE, {
            duration: this.audioElement.duration
        })
    }
    setupHandlers() {
        this.handlers = {
            [EVENT_NAMES.PLAY]: this.play,
            [EVENT_NAMES.PAUSE]: this.pause,
            [EVENT_NAMES.STOP]: this.stop,
            [EVENT_NAMES.NEXT]: this.nextTrack,
            [EVENT_NAMES.PREVIOUS]: this.previousTrack,
            [EVENT_NAMES.SEEK]: this.seek,
            [EVENT_NAMES.VOLUME]: this.volume,
            [EVENT_NAMES.TRACK_CHANGED]: this.trackChanged,
        }
        for (const [event, handler] of Object.entries(this.handlers as Record<keyof typeof EVENT_NAMES, (event: CustomEvent<unknown>) => void>)) {
            this.eventManager.on(event as keyof typeof EVENT_NAMES, handler as (event: CustomEvent<unknown>) => void)
        }
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
        const track = event.detail.track
        console.log('track change received', track)
        const isPaused = this.audioElement.paused
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