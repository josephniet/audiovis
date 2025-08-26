export class BeatDetectorBasic {
    private analyser: AnalyserNode;
    private frequencyData: Uint8Array;
    private beatThreshold: number = 200;
    private lastBeat: number = 0;
    private beatCooldown: number = 200; // ms

    constructor(analyser: AnalyserNode) {
        this.analyser = analyser;
        this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
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