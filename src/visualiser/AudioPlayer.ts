import { AudioManager } from "./AudioManager"
import { Visualiser } from "./visualiser"
import { TemplateLoader } from "./utils/template-loader"
import { BaseComponent } from "./components/BaseComponent"

export class AudioPlayer extends BaseComponent {
    private audioManager: AudioManager
    private visualiser: Visualiser | null = null
    private elements!: {
        playButton: HTMLButtonElement
        stopButton: HTMLButtonElement
        progressSlider: HTMLInputElement
        volumeSlider: HTMLInputElement
        currentTime: HTMLElement
        duration: HTMLElement
    }

    constructor(containerSelector: string = '[data-audio-player="main"]') {
        super(containerSelector)
        this.audioManager = new AudioManager()
        this.initializeAsync()
    }

    private async initializeAsync() {
        try {
            await this.render()
            this.elements = this.initializeElements()
            this.setupEventListeners()
            this.setupAudioEvents()
            await this.loadAudio('/public/track 1.mp3')
        } catch (error) {
            console.error('Failed to initialize audio player:', error)
            this.showError('Failed to initialize audio player')
        }
    }

    protected async render() {
        const template = await this.getTemplate()
        this.container.innerHTML = template
    }

        private async getTemplate(): Promise<string> {
        try {
            // Try to load from external template file first
            return await TemplateLoader.loadTemplate('/src/visualiser/templates/audio-player.html')
        } catch (error) {
            // Fallback to embedded template
            console.warn('Using embedded template, external template failed to load:', error)
            return TemplateLoader.loadTemplateSync('audio-player')
        }
    }

    private initializeElements() {
        const elements = {
            playButton: this.container.querySelector('[data-audio-action="play"]') as HTMLButtonElement,
            stopButton: this.container.querySelector('[data-audio-action="stop"]') as HTMLButtonElement,
            progressSlider: this.container.querySelector('[data-audio-control="progress"]') as HTMLInputElement,
            volumeSlider: this.container.querySelector('[data-audio-control="volume"]') as HTMLInputElement,
            currentTime: this.container.querySelector('[data-audio-time="current"]') as HTMLElement,
            duration: this.container.querySelector('[data-audio-time="duration"]') as HTMLElement
        }

        // Validate all elements exist
        Object.entries(elements).forEach(([name, element]) => {
            if (!element) {
                throw new Error(`Required element not found: ${name}`)
            }
        })

        return elements
    }

    private setupEventListeners() {
        // Play button
        this.elements.playButton.addEventListener('click', () => {
            this.togglePlayback()
        })

        // Stop button
        this.elements.stopButton.addEventListener('click', () => {
            this.stopPlayback()
        })

        // Progress slider
        this.elements.progressSlider.addEventListener('input', (e) => {
            const progress = parseFloat((e.target as HTMLInputElement).value)
            this.seekTo(progress)
        })

        // Volume slider
        this.elements.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat((e.target as HTMLInputElement).value)
            this.setVolume(volume)
        })
    }

    private setupAudioEvents() {
        // Update progress bar as audio plays
        this.audioManager.onTimeUpdate(() => {
            this.updateProgress()
        })

        // Update duration when metadata loads
        this.audioManager.onLoadedMetadata(() => {
            this.updateDuration()
        })

        // Handle when audio ends
        this.audioManager.onEnded(() => {
            this.updatePlayButton(false)
            this.resetProgress()
        })
    }

    private async loadAudio(url: string) {
        try {
            await this.audioManager.loadAudio(url)
            const analyser = this.audioManager.getAnalyser()
            this.visualiser = new Visualiser(analyser)
            this.visualiser.start()
        } catch (error) {
            console.error('Failed to load audio:', error)
            this.showError('Failed to load audio file')
        }
    }

    private togglePlayback() {
        try {
            this.audioManager.togglePlayback()
            const isPlaying = this.audioManager.isPlaying()
            this.updatePlayButton(isPlaying)
        } catch (error) {
            console.error('Playback error:', error)
            this.showError('Playback error occurred')
        }
    }

    private stopPlayback() {
        try {
            this.audioManager.stopAudio()
            this.updatePlayButton(false)
            this.resetProgress()
        } catch (error) {
            console.error('Stop error:', error)
            this.showError('Stop error occurred')
        }
    }

    private setVolume(volume: number) {
        try {
            this.audioManager.setVolume(volume)
        } catch (error) {
            console.error('Volume error:', error)
        }
    }

    private seekTo(progress: number) {
        try {
            this.audioManager.seekTo(progress)
        } catch (error) {
            console.error('Seek error:', error)
        }
    }

    private updateProgress() {
        try {
            const progress = this.audioManager.getProgress()
            this.elements.progressSlider.value = progress.toString()
            
            // Update time display
            const currentTime = this.formatTime(this.audioManager.getCurrentTime())
            this.elements.currentTime.textContent = currentTime
        } catch (error) {
            console.error('Progress update error:', error)
        }
    }

    private resetProgress() {
        try {
            this.elements.progressSlider.value = '0'
            this.elements.currentTime.textContent = '00:00'
        } catch (error) {
            console.error('Progress reset error:', error)
        }
    }

    private updateDuration() {
        try {
            const duration = this.formatTime(this.audioManager.getDuration())
            this.elements.duration.textContent = duration
        } catch (error) {
            console.error('Duration update error:', error)
        }
    }

    private updatePlayButton(isPlaying: boolean) {
        try {
            if (isPlaying) {
                this.elements.playButton.classList.add('playing')
            } else {
                this.elements.playButton.classList.remove('playing')
            }
        } catch (error) {
            console.error('Button update error:', error)
        }
    }

    private formatTime(seconds: number): string {
        if (isNaN(seconds) || seconds < 0) return '00:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }



    // Public methods for external control
    public play() {
        this.togglePlayback()
    }

    public pause() {
        this.togglePlayback()
    }

    public getCurrentTime(): number {
        return this.audioManager.getCurrentTime()
    }

    public getDuration(): number {
        return this.audioManager.getDuration()
    }

    public getProgress(): number {
        return this.audioManager.getProgress()
    }

    public isPlaying(): boolean {
        return this.audioManager.isPlaying()
    }

    // Cleanup method
    public destroy() {
        try {
            if (this.visualiser) {
                this.visualiser.stop()
            }
            this.audioManager.stopAudio()
        } catch (error) {
            console.error('Cleanup error:', error)
        }
    }
}