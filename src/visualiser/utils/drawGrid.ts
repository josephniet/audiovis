export function drawGrid(ctx: CanvasRenderingContext2D, container: HTMLElement) {
    const cellWidth = 40
    const cellHeight = 40
    const width = container.clientWidth
    const height = container.clientHeight
    console.log('drawing grid', width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'
    ctx.translate(container.offsetLeft, container.offsetTop)
    for (let x = 0; x <= width; x += cellWidth) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
    }
    for (let y = 0; y <= height; y += cellHeight) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
    }
    ctx.resetTransform()
    console.log('grid drawn')
}