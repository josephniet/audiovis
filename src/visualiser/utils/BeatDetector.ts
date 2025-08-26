export class BeatDetector {
    private analyser: AnalyserNode;
    private bufferLength: number;
    private dataArray: Uint8Array;
    private previousSpectrum: Float32Array;
    private spectralFluxBuffer: number[] = [];
    private threshold: number = 1.5;
    private minTimeBetweenBeats: number = 200; // ms
    private lastBeatTime: number = 0;
    private beatCooldownDuration: number = 150; // ms
    private beatStartTime: number = 0;
    private isBeatActive: boolean = false;

    constructor(analyser: AnalyserNode, sensitivity: number = 1.5, beatDuration: number = 150) {
        this.analyser = analyser;
        this.threshold = sensitivity;
        this.beatCooldownDuration = beatDuration;
        this.bufferLength = analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.previousSpectrum = new Float32Array(this.bufferLength);
    }

    detect(): boolean {
        const currentTime = performance.now();

        // Check if we're still in beat cooldown period
        if (this.isBeatActive && currentTime - this.beatStartTime < this.beatCooldownDuration) {
            return true; // Keep returning true during cooldown
        } else if (this.isBeatActive) {
            this.isBeatActive = false; // End beat cooldown
        }

        // Prevent rapid-fire beat detection
        if (currentTime - this.lastBeatTime < this.minTimeBetweenBeats) {
            return false;
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate spectral flux (energy difference between frames)
        let spectralFlux = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const current = this.dataArray[i] / 255;
            const previous = this.previousSpectrum[i];
            const diff = current - previous;

            // Only consider positive changes (energy increases)
            if (diff > 0) {
                spectralFlux += diff;
            }

            this.previousSpectrum[i] = current;
        }

        // Maintain a buffer of recent spectral flux values
        this.spectralFluxBuffer.push(spectralFlux);
        if (this.spectralFluxBuffer.length > 43) { // ~1 second at 60fps
            this.spectralFluxBuffer.shift();
        }

        // Calculate adaptive threshold
        if (this.spectralFluxBuffer.length < 10) return false;

        const mean = this.spectralFluxBuffer.reduce((a, b) => a + b) / this.spectralFluxBuffer.length;
        const variance = this.spectralFluxBuffer.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.spectralFluxBuffer.length;
        const adaptiveThreshold = mean + this.threshold * Math.sqrt(variance);

        // Detect beat
        const isBeat = spectralFlux > adaptiveThreshold && spectralFlux > mean * 1.5;

        if (isBeat) {
            this.lastBeatTime = currentTime;
            this.beatStartTime = currentTime;
            this.isBeatActive = true;
            return true;
        }

        return false;
    }

    setSensitivity(sensitivity: number): void {
        this.threshold = Math.max(0.5, Math.min(10.0, sensitivity));
    }

    setMinTimeBetweenBeats(ms: number): void {
        this.minTimeBetweenBeats = ms;
    }

    setBeatDuration(ms: number): void {
        this.beatCooldownDuration = ms;
    }

    isBeatCurrentlyActive(): boolean {
        return this.isBeatActive;
    }
}