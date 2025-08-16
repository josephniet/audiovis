export class AudioManager {
    private audioContext: AudioContext
    private audioElement: HTMLAudioElement
    private mediaSource: MediaElementAudioSourceNode;
    private audioBuffer: AudioBuffer | null = null
    private analyser: AnalyserNode

    constructor() {
        this.audioContext = new AudioContext()
        this.analyser = new AnalyserNode(this.audioContext)
        this.audioElement = new Audio()
        // Connect audio element to Web Audio API for analysis
        this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement)
        this.mediaSource.connect(this.analyser)
        this.mediaSource.connect(this.audioContext.destination)
        //configure analyser
        this.analyser.fftSize = 128
        this.analyser.smoothingTimeConstant = 0.8
    }
    async loadAudio(url: string) {
        try{
            this.audioElement.src = url
            const response = await fetch(url)
            await this.audioElement.load()
            return true
        } catch (error){
            throw new Error(`failed to load audio: ${error}`)
        }
    }
    getAnalyser() {
        return this.analyser
    }
    play(){
        this.audioElement.play()
    }
    pause(){
        this.audioElement.pause()
    }
    playAudio() {
        this.audioElement.play()
        this.isPlaying = true
    }
    togglePlayback(){
        if (this.audioElement.paused){
            this.audioElement.play()
        } else {
            this.audioElement.pause()
        }
    }

    stopAudio() {
        this.audioContext.close()
    }
    setVolume(volume: number) {
        this.audioElement.volume = volume
    }
    
    seekTo(progress: number) {
        if (this.audioElement.duration) {
            const seekTime = this.audioElement.duration * progress
            this.audioElement.currentTime = seekTime
        }
    }
    getCurrentTime() {
        return this.audioElement.currentTime
    }

    getDuration() {
        return this.audioElement.duration
    }

    getProgress() {
        if (this.audioElement.duration) {
            return this.audioElement.currentTime / this.audioElement.duration
        }
        return 0
    }

    isPlaying() {
        return !this.audioElement.paused
    }

    // Event listeners for progress updates
    onTimeUpdate(callback: () => void) {
        this.audioElement.addEventListener('timeupdate', callback)
    }

    onLoadedMetadata(callback: () => void) {
        this.audioElement.addEventListener('loadedmetadata', callback)
    }

    onEnded(callback: () => void) {
        this.audioElement.addEventListener('ended', callback)
    }
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
}




