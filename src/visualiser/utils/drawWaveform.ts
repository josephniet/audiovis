export function drawWaveform(
    ctx: CanvasRenderingContext2D,
    analyser: AnalyserNode,
    canvas: HTMLCanvasElement,
    timeDomainDataArray: Uint8Array,
    waveformContainer: HTMLElement) {

    const bufferLength = this.analyser.frequencyBinCount
    this.analyser.getByteTimeDomainData(this.timeDomainDataArray)
    // console.log(this.timeDomainDataArray)
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    // Calculate center of canvas
    const width = this.waveformContainer?.clientWidth || 0
    const height = this.waveformContainer?.clientHeight || 0
    const left = this.waveformContainer?.offsetLeft || 0
    const top = this.waveformContainer?.offsetTop || 0
    const bottom = top + height
    const right = left + width
    const centerX = this.canvas.width / 2
    const centerY = top + (height / 2)
    //begin path
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'white'
    this.ctx.moveTo(left, centerY)
    this.ctx.beginPath()
    this.ctx.translate(0, top + (height / 2))
    const sliceWidth = width / bufferLength
    let x = left
    for (let i = 0; i < bufferLength; i++) {
        //normalize to 0-1
        const amplitude = (-0.5 + (this.timeDomainDataArray[i] / 255)) * 2
        const y = amplitude * (height / 2)
        if (i === 0) {
            this.ctx.moveTo(x, y)
        } else {
            this.ctx.lineTo(x, y)
        }
        x += sliceWidth
    }
    this.ctx.stroke()
    this.ctx.resetTransform()

}