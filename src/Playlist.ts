import { EventManager } from "./utils/EventManager"
import { EVENT_NAMES } from "./utils/Events"
import type { Track } from "./utils/PlaylistData"


export class Playlist {
    private tracks: Track[] = []
    private currentTrackIndex = 0
    private isPlaying = false
    private eventManager = new EventManager()
    constructor() {
    }
    addTrack(track: Track) {
        this.tracks.push(track)
        this.eventManager.emit(EVENT_NAMES.TRACK_ADDED, track)
    }
    removeTrack(track: Track) {
        this.tracks = this.tracks.filter(t => t.src !== track.src)
        this.eventManager.emit(EVENT_NAMES.TRACK_REMOVED, track)
    }
    nextTrack() {
        const index = (this.currentTrackIndex + 1) % this.tracks.length
        this.goToTrack(index)
    }
    previousTrack() {
        const index = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length
        this.goToTrack(index)
    }
    goToTrack(index: number) {
        this.currentTrackIndex = index
        this.eventManager.emit(EVENT_NAMES.TRACK_CHANGED, { track: this.tracks[this.currentTrackIndex] as Track })
    }
    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex]
    }
    getTracks() {
        return this.tracks
    }
    getCurrentTrackIndex() {
        return this.currentTrackIndex
    }
    getIsPlaying() {
        return this.isPlaying
    }
}