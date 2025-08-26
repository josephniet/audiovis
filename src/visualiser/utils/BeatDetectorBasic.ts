export class BeatDetectorBasic {
    private analyser: AnalyserNode;
    private frequencyData: Uint8Array;
    private beatThreshold: number = 200;
    private lastBeat: number = 0;
    private beatCooldown: number = 200; // ms
    private sampleRate: number;
    stopped = false

    constructor(analyser: AnalyserNode, audioContext: AudioContext) {
        this.analyser = analyser;
        this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
        this.sampleRate = audioContext.sampleRate;
        setTimeout(() => {
            this.stopped = true
        }, 5000)
    }
    detectAsRatio(minHz: number, maxHz: number): number {
        // if (this.stopped) return 0
        this.analyser.getByteFrequencyData(this.frequencyData)
        const now = Date.now();
        // if (now - this.lastBeat < this.beatCooldown) return 0;
        const binsPerHz = this.analyser.frequencyBinCount / (this.sampleRate / 2)
        const startBin = Math.floor(minHz * binsPerHz)
        const endBin = Math.min(Math.ceil(maxHz * binsPerHz), this.analyser.frequencyBinCount)
        const frequencyRange = this.frequencyData.slice(startBin, endBin)
        if (frequencyRange.length === 0) return 0
        const average = frequencyRange.reduce((sum, val) => sum + val, 0) / frequencyRange.length
        // console.log('average', frequencyRange)
        return average / 255
    }

    detect(): boolean {
        this.analyser.getByteFrequencyData(this.frequencyData);
        const now = Date.now();
        if (now - this.lastBeat < this.beatCooldown) return false;

        const lowFreqRange = this.frequencyData.slice(0, 2); // Low frequencies for bass
        const average = lowFreqRange.reduce((sum, val) => sum + val, 0) / lowFreqRange.length;

        if (average > this.beatThreshold) {
            this.lastBeat = now;
            return true;
        }
        return false;
    }

    getFrequencyData(): Uint8Array {
        return this.frequencyData;
    }
}