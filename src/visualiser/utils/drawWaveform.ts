interface DrawWaveformProps {
    ctx: CanvasRenderingContext2D
    analyser: AnalyserNode
    container: HTMLElement
    timeDomainDataArray?: Uint8Array
}

export function drawWaveform({ ctx, analyser, container }: DrawWaveformProps) {
    const canvas = ctx.canvas
    const bufferLength = analyser.frequencyBinCount
    const timeDomainDataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(timeDomainDataArray)
    // console.log(timeDomainDataArray)
    // ctx.setTransform(1, 0, 0, 1, 0, 0)
    // Calculate center of canvas
    const width = container?.clientWidth || 0
    const height = container?.clientHeight || 0
    const left = container?.offsetLeft || 0
    const top = container?.offsetTop || 0
    const bottom = top + height
    const right = left + width
    const centerX = canvas.width / 2
    const centerY = top + (height / 2)
    // ctx.resetTransform()
    ctx.save()
    //begin path
    ctx.lineWidth = 2
    ctx.strokeStyle = 'white'
    ctx.moveTo(left, centerY)
    ctx.beginPath()
    ctx.translate(0, top + (height / 2))
    const sliceWidth = width / bufferLength
    let x = left
    for (let i = 0; i < bufferLength; i++) {
        //normalize to 0-1
        const amplitude = (-0.5 + (timeDomainDataArray[i] / 255)) * 2
        const y = amplitude * (height / 2)
        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
        x += sliceWidth
    }
    ctx.stroke()
    ctx.resetTransform()

}