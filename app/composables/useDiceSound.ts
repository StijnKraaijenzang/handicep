let audioCtx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 0.2)
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

function playClick(ctx: AudioContext, time: number, intensity: number) {
  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 700 + Math.random() * 1300
  filter.Q.value = 1.1

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, time)
  gain.gain.exponentialRampToValueAtTime(0.5 * intensity, time + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start(time)
  source.stop(time + 0.07)
}

/**
 * Synthesises a short "dice clattering" sound - a handful of filtered
 * noise clicks, front-loaded and fading out - instead of loading an
 * external audio file.
 */
export function useDiceSound() {
  function playRollSound(durationSeconds: number) {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return

    const ctx = getContext()
    const now = ctx.currentTime
    const clickCount = 10 + Math.floor(Math.random() * 5)

    for (let i = 0; i < clickCount; i++) {
      const progress = i / clickCount
      const time = now + progress * durationSeconds * 0.85
      const intensity = 1 - progress * 0.6
      playClick(ctx, time, intensity)
    }
  }

  return { playRollSound }
}
