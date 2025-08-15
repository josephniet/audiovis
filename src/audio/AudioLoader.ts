export default class AudioLoader {
    private audioContext: AudioContext
    //   private audioElement: HTMLAudioElement
    private audioBuffer: AudioBuffer | null = null
    private analyser: AnalyserNode

    constructor() {
        this.audioContext = new AudioContext()
        this.analyser = new AnalyserNode(this.audioContext)
    }
    async loadAudio(url: string) {
        try{
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
            this.audioBuffer = audioBuffer
            return audioBuffer
        } catch (error){
            throw new Error(`failed to load audio: ${error}`)
        }
    }
    getAnalyser() {
        return this.analyser
    }
    playAudio(audioBuffer: AudioBuffer) {
        const source = this.audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(this.audioContext.destination)
        source.start()
    }
    stopAudio() {
        this.audioContext.close()
    }
}




