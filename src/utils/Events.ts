// src/events.ts
import type { Track } from "@/Playlist"



export const EVENT_NAMES = {
    PLAY: 'jojo-play',
    PAUSE: 'jojo-pause',
    STOP: 'jojo-stop',
    SEEK: 'jojo-seek',
    VOLUME: 'jojo-volume',
    NEXT: 'jojo-next',
    PREVIOUS: 'jojo-previous',
    PROGRESS_UPDATE: 'jojo-progress-update',
    PLAY_STATE_UPDATE: 'jojo-play-state-update',
    DURATION_UPDATE: 'jojo-duration-update',
    AUDIO_CONTEXT_READY: 'jojo-audio-context-ready',
    LOAD_METADATA: 'jojo-load-metadata',
    AUDIO_READY: 'jojo-audio-ready',
    TRACK_ADDED: 'jojo-track-added',
    TRACK_REMOVED: 'jojo-track-removed',
    TRACK_CHANGED: 'jojo-track-changed',
    AUDIO_PLAYER_DATA: 'jojo-audio-player-data',
    REQUEST_AUDIO_PLAYER_DATA: 'jojo-request-audio-player-data',
    REQUEST_CONTROLS_DATA: 'jojo-request-controls-data',
    CONTROLS_DATA: 'jojo-controls-data'
}

// export type EventMap = new Map<string, string>()


export interface PlayEvent {
    // No payload needed
}
export interface ControlsData {
    progressElement: HTMLElement
    // volume?: number
    // isPlaying?: boolean
    // currentTime?: number
    // duration?: number,
}
export interface AudioPlayerData {
    audioElement: HTMLAudioElement
    audioContext: AudioContext
    duration: number
    track: Track
}

export interface AudioReadyEvent {
    audioElement: HTMLAudioElement
    audioContext: AudioContext
    duration: number
    track: Track
}


export interface PauseEvent {
    // No payload needed
}

export interface StopEvent {
    // No payload needed
}

export interface SeekEvent {
    time: number; // Time to seek to (in seconds)
}

export interface VolumeEvent {
    volume: number; // Volume level (0 to 1)
}

export interface NextEvent {
    // No payload needed
}

export interface PreviousEvent {
    // No payload needed
}

export interface ProgressUpdateEvent {
    currentTime: number;
    duration: number;
}

export interface AudioContextReadyEvent {
    audioContext: AudioContext
}

export interface PlayStateUpdateEvent {
    isPlaying: boolean;
}

export interface DurationUpdateEvent {
    duration: number;
}

export interface LoadMetadataEvent {
    duration: number;
}

export interface TrackAddedEvent {
    track: Track
}

export interface TrackRemovedEvent {
    track: Track
}
export interface TrackChangedEvent {
    track: Track
}


export type AudioEvents = AudioReadyEvent | PlayEvent | PauseEvent | StopEvent | SeekEvent | VolumeEvent | NextEvent | PreviousEvent | ProgressUpdateEvent | AudioContextReadyEvent | PlayStateUpdateEvent | DurationUpdateEvent | LoadMetadataEvent | TrackAddedEvent | TrackRemovedEvent | TrackChangedEvent;
export type Event = AudioEvents;