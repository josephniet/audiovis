import DownUnderLrc from '@/audio/Down Under (feat. Colin Hay).lrc?raw'
import DownUnderCover from '@/audio/Down Under.jpg'
import DownUnderAudio from '@/audio/Down Under (feat. Colin Hay) - Luude.mp3'
import TaintedLoveAudio from '@/audio/Tainted Love - Soft Cell.mp3'
import TaintedLoveCover from '@/audio/Tainted Love.jpg'
import TaintedLoveLrc from '@/audio/Tainted Love.lrc?raw'
import RunOnAudio from '@/audio/Run On - Jamie Bower.mp3'
import RunOnCover from '@/audio/Run On.jpg'
import RunOnLrc from '@/audio/Run On.lrc?raw'
import StereoAudio from '@/audio/stereo-test.mp3'

export interface Track {
    src: string
    title: string
    cover: string
    lrc?: string
}
class TrackData implements Track {
    src: string = ''
    title: string = ''
    cover: string = ''
    lrc?: string = ''

    addSource(src: string) {
        // this.src = `${import.meta.env.BASE_URL}${src}`
        this.src = src
        return this
    }
    addTitle(title: string) {
        this.title = title
        return this
    }
    addCover(cover: string) {
        this.cover = cover
        return this
    }
    addLrc(lrc: string) {
        this.lrc = lrc
        return this
    }
    build() {
        return this
    }
}



const downUnder = new TrackData()
    .addSource(DownUnderAudio)
    .addTitle('Down Under ft Colin Hay')
    .addCover(DownUnderCover)
    .addLrc(DownUnderLrc)
    .build()

const taintedLove = new TrackData()
    .addSource(TaintedLoveAudio)
    .addTitle('Tainted Love')
    .addCover(TaintedLoveCover)
    .addLrc(TaintedLoveLrc)
    .build()

const runOn = new TrackData()
    .addSource(RunOnAudio)
    .addTitle('Run On')
    .addCover(RunOnCover)
    .addLrc(RunOnLrc)
    .build()

const stereoTest = new TrackData()
    .addSource(StereoAudio)
    .addTitle('Stereo Test')
    .addCover(RunOnCover)
    .addLrc(RunOnLrc)
    .build()

const playlistData = [downUnder, taintedLove, runOn]

export { playlistData }
console.log(playlistData)