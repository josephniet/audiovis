// src/events.ts
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
} as const;

export interface PlayEvent {
    // No payload needed
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