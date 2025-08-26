declare module 'liricle' {
    export class Liricle {
        load(options: {
            text: string
            skipBlankLine: boolean
            url?: string
        }): void
        sync(time: number, force: boolean): void
        on(event: string, callback: (data: any) => void): void
        off(event: string, callback: (data: any) => void): void
    }
}