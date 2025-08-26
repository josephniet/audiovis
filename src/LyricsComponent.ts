import { BaseComponent } from "./BaseComponent";
import { EVENT_NAMES } from "./utils/Events";
import { EventManager } from "./utils/EventManager";
import Liricle from 'liricle'
import { Playlist } from "./Playlist";
import type { Track } from "./utils/PlaylistData";
import type AudioPlayerComponent from "./AudioPlayerComponent";
import type { AudioPlayerData } from "./utils/Events";
import lyricsCSS from './LyricsComponent.css?raw'

export class LyricsComponent extends BaseComponent {
    lyricsContainer: HTMLElement
    eventManager = new EventManager()
    liricle = new Liricle()
    lyricsData = {}
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        const template = document.createElement('template')
        template.innerHTML = '<div id="lyrics"></div>'
        shadowRoot.appendChild(template.content.cloneNode(true))
        this.lyricsContainer = shadowRoot.querySelector('#lyrics') as HTMLElement
        const style = document.createElement('style')
        style.textContent = lyricsCSS
        shadowRoot.appendChild(style)
    }
    connectedCallback(): void {
        this.eventManager.on(EVENT_NAMES.TRACK_CHANGED, (event: CustomEvent<{ track: Track }>) => {
            console.log('track changed recieved by lyrics', event.detail.track)
            this.updateTrack(event.detail.track)
        })
        this.eventManager.on(EVENT_NAMES.PROGRESS_UPDATE, (event: CustomEvent<{ currentTime: number }>) => {
            this.audioUpdate(event.detail.currentTime)
        })
        this.eventManager.on(EVENT_NAMES.AUDIO_PLAYER_DATA, (event: CustomEvent<AudioPlayerData>) => {
            console.log('audio player data recieved by lyrics', event.detail)
            this.updateTrack(event.detail.track)
        })
        this.eventManager.emit(EVENT_NAMES.REQUEST_AUDIO_PLAYER_DATA)
        // Register the load event
        this.liricle.on("load", (data) => {
            console.log("Lyrics loaded:", data);
        });

        // If you load lyrics from a URL, you can listen for the loaderror event when loading fails
        this.liricle.on("loaderror", (error) => {
            console.error("Failed to load lyrics:", error.message);
        });

        // Register the sync event
        this.liricle.on("sync", (line, word) => {
            console.log("current line => ", line);
            console.log("current word => ", word);
            this.updateLyrics(line, word)
        });
    }
    updateTrack(track: Track) {
        console.log('lrc', track.lrc)
        if (!track.lrc) {
            throw new Error('No lyrics found for track')
        }
        this.liricle.load({
            text: track.lrc,
            skipBlankLine: false
        });
    }
    audioUpdate(currentTime: number) {
        console.log('updateLyrics', currentTime)
        const time = currentTime;
        // sync lyric when the audio time updated
        this.liricle.sync(time, false);
    }
    updateLyrics(line: line, word: word) {
        console.log("Sync event:", line, word);
        this.lyricsContainer.innerHTML = line.text
    }
}

interface line {
    index: number
    text: string
    time: number
}
interface word {
    index: number
    text: string
    time: number
}


customElements.define('lyrics-component', LyricsComponent)