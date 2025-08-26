export function createMonoFromStereo(audioContext: AudioContext, source: MediaElementAudioSourceNode) {
    const splitter = audioContext?.createChannelSplitter(2)
    const merger = audioContext.createChannelMerger(1)
    const leftGain = audioContext?.createGain()
    const rightGain = audioContext.createGain()
    leftGain.gain.value = 0.5
    rightGain.gain.value = 0.5
    source.connect(splitter)
    splitter.connect(leftGain, 0)
    splitter.connect(rightGain, 1)
    leftGain.connect(merger, 0, 0)
    rightGain.connect(merger, 0, 0)
    return merger
}