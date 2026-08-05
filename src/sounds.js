// Slam sound engine — WebAudio, no dependencies.
// Buffers decode lazily on the first user gesture (autoplay-policy safe).
// The kit is configured in BIZ.audio so a reskin can swap the sounds.
import { BIZ } from './config.js'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

let ctx = null
let buffers = {}
let loadStarted = false
let muted
try {
  muted = localStorage.getItem('shop-muted') === '1'
} catch {
  muted = false
}
let recentPlays = []

async function load() {
  if (loadStarted || !BIZ.audio) return
  loadStarted = true
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  await Promise.all(
    Object.entries(BIZ.audio).map(async ([key, url]) => {
      try {
        const data = await fetch(url).then((r) => r.arrayBuffer())
        buffers[key] = await ctx.decodeAudioData(data)
      } catch {
        // sound is garnish — never let it break the page
      }
    })
  )
}

/** Call from any user gesture; idempotent. */
export function primeAudio() {
  load()
  if (ctx && ctx.state === 'suspended') ctx.resume()
}

export function setMuted(m) {
  muted = m
  try {
    localStorage.setItem('shop-muted', m ? '1' : '0')
  } catch {
    /* private mode */
  }
}

export function isMuted() {
  return muted
}

function play(key, { rate = 1, gain = 1, offset = 0, duration } = {}) {
  if (muted || !ctx || ctx.state !== 'running' || !buffers[key]) return
  // Don't machine-gun during the intro cascade — cap concurrent voices
  const now = performance.now()
  recentPlays = recentPlays.filter((t) => now - t < 130)
  if (recentPlays.length >= 4) return
  recentPlays.push(now)

  const src = ctx.createBufferSource()
  src.buffer = buffers[key]
  src.playbackRate.value = rate
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(g)
  g.connect(ctx.destination)
  if (duration) src.start(0, offset, duration)
  else src.start(0, offset)
}

/** Heavy things land deeper and louder. impact is px/s at contact. */
export function slamSound(weight, impact) {
  const rate = clamp(1.38 - weight * 0.3, 0.78, 1.32) * (0.96 + Math.random() * 0.08)
  const gain = clamp(0.3 + impact / 4200, 0.3, 0.85) * (weight >= 1.4 ? 1 : 0.75)
  play('slam', { rate, gain })
}

/** Deselect flick — quick air whoosh. */
export function flickSound() {
  play('whoosh', { rate: 1 + Math.random() * 0.18, gain: 0.45 })
}
