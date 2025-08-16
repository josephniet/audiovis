import audioPlayerTemplate from '@/visualiser/templates/audio-player.html?raw';
import { AudioManager } from '../AudioManager';
export class AudioPlayerComponent extends HTMLElement {

    private playlist: string[]
    private playlistIndex: number = 0
    private audioManager: AudioManager
    //elements
    private audioElement: HTMLAudioElement
    private playButton: HTMLButtonElement
    private stopButton: HTMLButtonElement
    private progressSlider: HTMLInputElement
    private volumeSlider: HTMLInputElement
    private currentTime: HTMLElement
    private duration: HTMLElement
    private nextButton: HTMLButtonElement
    private previousButton: HTMLButtonElement


    constructor(){
        super()
        console.log(audioPlayerTemplate)
        this.attachShadow({mode: 'open'})
        const tpl = document.createElement('template')
        tpl.innerHTML = audioPlayerTemplate
        this.shadowRoot?.appendChild(tpl.content.cloneNode(true))
        this.audioManager = new AudioManager()
    }
    setupPlaylist(){
        const playlist = this.getAttribute('playlist')
        if(playlist){
            this.playlist = playlist.split(',')
        }
    }
    initialiseElements(){
        this.audioElement = this.querySelector('audio') as HTMLAudioElement
        this.playButton = this.shadowRoot?.querySelector('.audio-btn--play') as HTMLButtonElement
        this.stopButton = this.shadowRoot?.querySelector('.audio-btn--stop') as HTMLButtonElement
        this.progressSlider = this.shadowRoot?.querySelector('.audio-progress__slider') as HTMLInputElement
        this.volumeSlider = this.shadowRoot?.querySelector('.audio-volume__slider') as HTMLInputElement
        this.currentTime = this.shadowRoot?.querySelector('.audio-time__current') as HTMLElement
        this.duration = this.shadowRoot?.querySelector('.audio-time__duration') as HTMLElement
        this.nextButton = this.shadowRoot?.querySelector('.audio-btn--next') as HTMLButtonElement
        this.previousButton = this.shadowRoot?.querySelector('.audio-btn--previous') as HTMLButtonElement
    }
    setupAudioListeners(){
        this.audioElement.addEventListener('timeupdate',()=>{
            const ratio = this.audioElement.currentTime / this.audioElement.duration
            this.progressSlider.value = ratio.toString()
            console.log('updating')
        })
    }
    nextTrack(){
        this.playlistIndex++
        if(this.playlistIndex >= this.playlist.length){
            this.playlistIndex = 0
        }
        this.audioElement.src = this.playlist[this.playlistIndex]
        this.audioElement.play()
    }
    previousTrack(){
        this.playlistIndex--
        if(this.playlistIndex < 0){
            this.playlistIndex = this.playlist.length - 1
        }
        this.audioElement.src = this.playlist[this.playlistIndex]
        this.audioElement.play()
    }
    setupControlListeners(){
        this.playButton.addEventListener('click', () => {
            if (this.audioElement.paused){
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
    connectedCallback(){
        this.initialiseElements()
        this.setupControlListeners()
        this.setupAudioListeners()
        this.setupPlaylist()
    }
}