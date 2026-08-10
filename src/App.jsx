import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { BIZ } from './config.js'
import { ART } from './ingredients.jsx'
import { primeAudio, slamSound, flickSound, isMuted, setMuted } from './sounds.js'
import { CLIPS, FINALES, SET_PLATE, clipKeyFor, resolveClip } from './clips.js'

/* ── Utilities ──────────────────────────────────────────────────────────── */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// Warm the browser cache for clips before they're needed — touching a menu
// card prefetches its clip; opening a build page prefetches the whole tab.
const prefetched = new Set()
function prefetchClip(src) {
  if (!src || prefetched.has(src)) return
  prefetched.add(src)
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'video'
  link.href = src
  document.head.appendChild(link)
}
function prefetchTabClips(tabId) {
  const t = BIZ.builder.tabs.find((x) => x.id === tabId)
  if (!t) return
  for (const g of t.groups) {
    for (const item of g.items) {
      const key = item.clip ?? (typeof item.layer === 'string' ? item.layer : null)
      if (key && CLIPS[key]) prefetchClip(CLIPS[key].src)
    }
  }
  if (FINALES[tabId]) prefetchClip(FINALES[tabId].src)
}

const hash = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const gbp = (n) => `£${n.toFixed(2)}`

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduced
}

/* ── Ambient rising embers ──────────────────────────────────────────────── */

function EmberField({ reduced }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h, dpr, raf, particles
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = clamp(Math.round((w * h) / 38000), 16, 46)
      particles = Array.from({ length: n }, () => spawn(true))
    }
    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 1 + Math.random() * 2.2,
      sp: 14 + Math.random() * 42,
      sw: 0.4 + Math.random() * 1.4,
      ph: Math.random() * Math.PI * 2,
      o: 0.25 + Math.random() * 0.5,
      amber: Math.random() > 0.55,
    })
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.y -= p.sp * dt
        p.x += Math.sin(t * p.sw + p.ph) * 9 * dt
        if (p.y < -12) particles[i] = spawn(false)
        const a = p.o * (0.45 + 0.55 * Math.sin(t * 1.8 + p.ph) ** 2)
        ctx.fillStyle = p.amber
          ? `rgba(255,176,33,${a})`
          : `rgba(255,90,31,${a})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    resize()
    window.addEventListener('resize', resize)
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])
  if (reduced) return null
  return <canvas className="embers-canvas" ref={ref} aria-hidden="true" />
}

/* ── Slam physics ───────────────────────────────────────────────────────────
   Hand-rolled, no tween library. Each layer is a body:
   gravity fall → impact (squash impulse, spark burst, stack quake) →
   one damped bounce → underdamped spring settle. Deselect = flick off. */

const G = 5600 // px/s² — heavy
const V0 = 620 // px/s — thrown in, not dropped
const REST = 0.24 // restitution of the single bounce
const K_SETTLE = 380
const D_SETTLE = 24
const K_SQUASH = 520
const D_SQUASH = 8.5

function Layer({ art, id, slotY, widthPx, leaving, delay, onImpact, onGone, reduced, z, register }) {
  const elRef = useRef(null)
  const slotRef = useRef(slotY)
  slotRef.current = slotY
  const heightPx = (widthPx * art.h) / 300

  const st = useRef(null)
  if (!st.current) {
    const seed = hash(id)
    st.current = {
      y: -heightPx - 80,
      v: 0,
      x: 0,
      vx: 0,
      rot: 0,
      vr: 0,
      sq: 0,
      sqv: 0,
      op: 1,
      t: 0,
      mode: 'wait',
      bounced: false,
      running: false,
      baseRot: (((seed % 9) - 4) * 0.9),
      baseX: ((seed >> 4) % 15) - 7,
    }
  }

  const loopRef = useRef()
  loopRef.current = () => {
    const s = st.current
    const el = elRef.current
    if (!el) { s.running = false; return }
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(1 / 30, (now - last) / 1000)
      last = now
      const slot = slotRef.current

      if (s.mode === 'wait') {
        s.t += dt
        if (s.t >= delay) {
          s.mode = 'fall'
          s.v = V0
        }
      } else if (s.mode === 'fall') {
        s.v += G * dt
        s.y += s.v * dt
        if (s.y >= slot) {
          s.y = slot
          const imp = s.v
          const kick = Math.max(4.5, imp * 0.006) * (0.55 + 0.45 * (art.weight / 1.7))
          s.sqv -= kick
          if (!s.bounced) {
            onImpact(imp, art, s.baseX)
            s.bounced = true
            s.v = imp > 800 ? -imp * REST : 0
            if (s.v === 0) s.mode = 'settle'
          } else {
            s.v = 0
            s.mode = 'settle'
          }
        }
      } else if (s.mode === 'settle') {
        const a = -K_SETTLE * (s.y - slot) - D_SETTLE * s.v
        s.v += a * dt
        s.y += s.v * dt
      } else if (s.mode === 'exit') {
        s.t += dt
        s.v += G * 0.55 * dt
        s.y += s.v * dt
        s.x += s.vx * dt
        s.rot += s.vr * dt
        if (s.t > 0.1) s.op -= 2.8 * dt
        if (s.op <= 0) {
          s.running = false
          onGone(id)
          return
        }
      }

      // squash/stretch spring, plus velocity stretch while falling
      const sa = -K_SQUASH * s.sq - D_SQUASH * s.sqv
      s.sqv += sa * dt
      s.sq += s.sqv * dt
      s.sq = clamp(s.sq, -0.52, 0.34)
      const stretch = s.mode === 'fall' ? clamp(s.v * 0.00007, 0, 0.16) : 0
      const eff = s.sq + stretch

      const sy = 1 + eff
      const sx = 1 - eff * 0.75
      el.style.opacity = clamp(s.op, 0, 1)
      el.style.transform = `translate3d(${s.baseX + s.x}px, ${s.y}px, 0) rotate(${s.baseRot + s.rot}deg) scale(${sx}, ${sy})`

      const settled =
        s.mode === 'settle' &&
        Math.abs(s.y - slot) < 0.4 &&
        Math.abs(s.v) < 6 &&
        Math.abs(s.sq) < 0.004 &&
        Math.abs(s.sqv) < 0.05
      if (settled) {
        s.y = slot
        s.sq = 0
        s.sqv = 0
        el.style.transform = `translate3d(${s.baseX}px, ${slot}px, 0) rotate(${s.baseRot}deg)`
        s.running = false
        return
      }
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  const ensureRunning = useCallback(() => {
    const s = st.current
    if (!s.running) {
      s.running = true
      loopRef.current()
    }
  }, [])

  // Take shockwave nudges from other layers' impacts
  useEffect(() => {
    if (!register || reduced) return
    register(id, {
      nudge: (dv, dsq) => {
        const s = st.current
        if (s.mode !== 'settle') return
        s.v += dv
        s.sqv += dsq
        ensureRunning()
      },
    })
    return () => register(id, null)
  }, [id, register, reduced, ensureRunning])

  useEffect(() => {
    if (reduced) return
    ensureRunning()
  }, [slotY, reduced, ensureRunning])

  useEffect(() => {
    if (!leaving) {
      const s = st.current
      if (s.mode === 'exit') {
        // re-selected mid-flight: reset and slam back in
        s.y = -heightPx - 80
        s.v = 0
        s.x = 0
        s.vx = 0
        s.rot = 0
        s.vr = 0
        s.op = 1
        s.t = 0
        s.bounced = false
        s.mode = 'fall'
        if (!reduced) ensureRunning()
      }
      return
    }
    if (reduced) {
      const t = setTimeout(() => onGone(id), 380)
      return () => clearTimeout(t)
    }
    flickSound()
    const s = st.current
    const dir = hash(id + 'x') % 2 ? 1 : -1
    s.mode = 'exit'
    s.t = 0
    s.vx = dir * (700 + (hash(id + 'v') % 100) * 4.5)
    s.v = -420 - (hash(id + 'u') % 100) * 1.8
    s.vr = dir * (260 + (hash(id + 'r') % 100) * 2.6)
    ensureRunning()
  }, [leaving, reduced, id, onGone, ensureRunning])

  if (reduced) {
    return (
      <div
        className="layer reduced"
        ref={elRef}
        style={{
          width: widthPx,
          marginLeft: -widthPx / 2,
          zIndex: z,
          opacity: leaving ? 0 : 1,
          transform: `translate3d(${st.current.baseX}px, ${slotY}px, 0)`,
        }}
      >
        <art.C />
      </div>
    )
  }

  return (
    <div
      className="layer"
      ref={elRef}
      style={{
        width: widthPx,
        marginLeft: -widthPx / 2,
        zIndex: z,
        transformOrigin: '50% 85%',
        opacity: 0,
        transform: `translate3d(0, ${-heightPx - 80}px, 0)`,
      }}
    >
      <art.C />
    </div>
  )
}

function SoundToggle() {
  const [muted, setM] = useState(isMuted)
  const toggle = () => {
    primeAudio()
    const next = !muted
    setMuted(next)
    setM(next)
  }
  return (
    <button
      className="sound-toggle"
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute slam sounds' : 'Mute slam sounds'}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
        {muted ? (
          <path d="M16 9l5 6M21 9l-5 6" />
        ) : (
          <>
            <path d="M15.5 9.5a4 4 0 0 1 0 5" />
            <path d="M18 7a8 8 0 0 1 0 10" />
          </>
        )}
      </svg>
    </button>
  )
}

/* Spark burst + dust puff at an impact point */
function Burst({ x, y, n, reduced }) {
  const parts = useMemo(() => {
    const colors = ['#FF5A1F', '#FFB021', '#FFD98A', '#FF7A45']
    return Array.from({ length: n }, (_, i) => {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
      const dist = 34 + Math.random() * 78
      return {
        id: i,
        dx: Math.cos(ang) * dist * (Math.random() > 0.5 ? 1.4 : 1),
        dy: Math.sin(ang) * dist - Math.random() * 24,
        c: colors[i % colors.length],
        s: 3 + Math.random() * 3.5,
        d: Math.random() * 60,
      }
    })
  }, [n])
  if (reduced) return null
  return (
    <>
      <div className="dust" style={{ left: x, top: y }} />
      {parts.map((p) => (
        <span
          key={p.id}
          className="spark"
          style={{
            left: x,
            top: y,
            width: p.s,
            height: p.s,
            background: p.c,
            boxShadow: `0 0 8px ${p.c}`,
            animationDelay: `${p.d}ms`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          }}
        />
      ))}
    </>
  )
}

/* ── Ingredient film overlay ─────────────────────────────────────────────
   Plays a Seedance clip of the tapped ingredient slamming onto the grill,
   native audio and all, then fades back to the stack. A finale cue
   (hold: true) stays up on its last frame until tapped. */

function FilmOverlay({ cue, onActive }) {
  const videoRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!cue) return
    const v = videoRef.current
    setHeld(false)
    v.src = cue.src
    v.muted = isMuted()
    const begin = () => {
      if (cue.startAt) v.currentTime = cue.startAt
      v.playbackRate = cue.rate || 1
      const p = v.play()
      if (p) {
        p.catch(() => {
          v.muted = true
          v.play().catch(() => setVisible(false))
        })
      }
    }
    // Always load() and wait for the NEW clip's metadata. Checking readyState
    // here reads the PREVIOUS clip's state — on a busy main thread play() then
    // races the load reset and the film silently never shows.
    v.onloadedmetadata = begin
    v.load()
    const onPlaying = () => {
      setVisible(true)
      onActive(true)
    }
    const onEnded = () => {
      if (cue.hold) setHeld(true)
      else setVisible(false)
      onActive(false)
      cue.onDone?.()
    }
    // One retry on load error — a momentary network blip (Wi-Fi scan, cell
    // handover) shouldn't cost the customer their film.
    let retried = false
    const onError = () => {
      if (!retried) {
        retried = true
        setTimeout(() => {
          v.onloadedmetadata = begin
          v.load()
        }, 350)
        return
      }
      onEnded()
    }
    v.addEventListener('playing', onPlaying)
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', onError)
    return () => {
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', onError)
      v.onloadedmetadata = null
    }
  }, [cue, onActive])

  const dismiss = () => {
    setVisible(false)
    setHeld(false)
    const v = videoRef.current
    if (v) v.pause()
  }

  return (
    <div
      className={`film${visible ? ' show' : ''}`}
      onClick={held ? dismiss : undefined}
      role={held ? 'button' : undefined}
      aria-label={held ? 'Back to your build' : undefined}
    >
      <video ref={videoRef} playsInline preload="auto" aria-hidden="true" />
      {held && <p className="film-hint">Tap to go back</p>}
    </div>
  )
}

/* ── The exploded stack ─────────────────────────────────────────────────── */

function Stack({ layers, reduced, armed, filmCue, soundMuteUntil, restingStill, price }) {
  const panelRef = useRef(null)
  const quakeElRef = useRef(null)
  const quake = useRef({ e: 0, t: 0, running: false })
  const [panel, setPanel] = useState({ w: 0, h: 0 })
  const [bursts, setBursts] = useState([])
  const burstId = useRef(0)
  const initialKeys = useRef(new Set(layers.map((l) => l.key)))

  // Layers that were deselected stay mounted (same key → same physics state)
  // until their flick-off animation reports done. Computed synchronously in
  // render so an instance never unmounts for a frame in between.
  const leavingRef = useRef(new Map())
  const prevRef = useRef(layers)
  const [, forceRender] = useState(0)
  if (prevRef.current !== layers) {
    const curKeys = new Set(layers.map((l) => l.key))
    for (const l of prevRef.current) {
      if (!curKeys.has(l.key)) leavingRef.current.set(l.key, l)
    }
    for (const k of [...leavingRef.current.keys()]) {
      if (curKeys.has(k)) leavingRef.current.delete(k) // re-added while leaving
    }
    prevRef.current = layers
  }

  useEffect(() => {
    const el = panelRef.current
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPanel({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onGone = useCallback((key) => {
    leavingRef.current.delete(key)
    forceRender((x) => x + 1)
  }, [])

  const onFilmActive = useCallback(() => {}, [])

  const bodiesRef = useRef(new Map())
  const slotMapRef = useRef(new Map())
  const register = useCallback((key, api) => {
    if (api) bodiesRef.current.set(key, api)
    else bodiesRef.current.delete(key)
  }, [])

  const kickQuake = useCallback(
    (energy) => {
      if (reduced) return
      const q = quake.current
      q.e = Math.min(30, q.e * 0.45 + energy)
      q.t = 0
      if (q.running) return
      q.running = true
      let last = performance.now()
      const frame = (now) => {
        const dt = Math.min(1 / 30, (now - last) / 1000)
        last = now
        q.t += dt
        const decay = Math.exp(-5.5 * q.t)
        const off = q.e * decay * Math.sin(30 * q.t)
        const el = quakeElRef.current
        if (el) el.style.transform = `translate3d(0, ${off}px, 0) rotate(${off * 0.045}deg)`
        if (q.e * decay < 0.25) {
          if (el) el.style.transform = ''
          q.running = false
          return
        }
        requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    },
    [reduced]
  )

  const stackW = clamp(panel.w * 0.6, 210, 350)
  const n = layers.length
  const usable = panel.h - 110
  const gap = n > 1 ? Math.min(62, usable / (n - 1)) : 0
  const contentH = (n - 1) * gap + 70
  const startY = Math.max(26, (panel.h - contentH) / 2)

  const slotFor = (i) => startY + (n - 1 - i) * gap // i counts from bottom

  const spawnBurst = useCallback(
    (imp, art, baseX, slot, key) => {
      // A playing ingredient film carries its own impact audio
      if (performance.now() > (soundMuteUntil?.current ?? 0)) slamSound(art.weight, imp)
      kickQuake(imp * 0.011 * art.weight)
      // Shockwave: layers above hop, layers below compress
      for (const [k, api] of bodiesRef.current) {
        if (k === key) continue
        const sy = slotMapRef.current.get(k)
        if (sy == null) continue
        if (sy < slot) {
          const falloff = clamp(1 - (slot - sy) / 420, 0.12, 1)
          api.nudge(-imp * 0.06 * art.weight * falloff, -imp * 0.0006 * falloff)
        } else if (sy > slot) {
          const falloff = clamp(1 - (sy - slot) / 260, 0.15, 1)
          api.nudge(imp * 0.018 * falloff, -imp * 0.0009 * falloff)
        }
      }
      const id = burstId.current++
      const wPx = stackW * art.w
      const x = panel.w / 2 + baseX + (Math.random() - 0.5) * wPx * 0.3
      const y = slot + (wPx * art.h) / 300 - 6
      const count = Math.round(6 + art.weight * 7)
      setBursts((bs) => [...bs.slice(-4), { id, x, y, n: count }])
      setTimeout(() => setBursts((bs) => bs.filter((b) => b.id !== id)), 750)
    },
    [kickQuake, panel.w, stackW]
  )

  return (
    <div className="viz" ref={panelRef} role="img" aria-label="Your order, stacked layer by layer">
      <div className="viz-bgword" aria-hidden="true">{BIZ.name}</div>
      <p className="viz-hint" aria-hidden="true">Your build</p>
      {BIZ.audio && <SoundToggle />}
      <FilmOverlay cue={filmCue} onActive={onFilmActive} />
      {price != null && (
        <div className="viz-price" aria-hidden="true">
          <AnimatedPrice value={price} reduced={reduced} />
        </div>
      )}
      {restingStill && (
        <img key={restingStill} className="rest-frame" src={restingStill} alt="" />
      )}
      <div className="stack-quake" ref={quakeElRef}>
        {panel.w > 0 &&
          armed &&
          !restingStill &&
          [
            ...layers.map((l, i) => ({ ...l, leaving: false, i })),
            ...[...leavingRef.current.values()].map((l) => ({ ...l, leaving: true, i: 0 })),
          ].map((l) => {
            const art = ART[l.art]
            const slot = slotFor(l.i)
            if (!l.leaving) slotMapRef.current.set(l.key, slot)
            else slotMapRef.current.delete(l.key)
            return (
              <Layer
                key={l.key}
                id={l.key}
                art={art}
                slotY={slot}
                widthPx={stackW * art.w}
                leaving={l.leaving}
                delay={initialKeys.current.has(l.key) ? l.i * 0.085 + 0.05 : 0}
                onImpact={(imp, a, bx) => spawnBurst(imp, a, bx, slot, l.key)}
                onGone={onGone}
                reduced={reduced}
                z={l.leaving ? 70 : 60 - l.i}
                register={register}
              />
            )
          })}
      </div>
      {bursts.map((b) => (
        <Burst key={b.id} x={b.x} y={b.y} n={b.n} reduced={reduced} />
      ))}
    </div>
  )
}

/* ── Animated price ─────────────────────────────────────────────────────── */

function AnimatedPrice({ value, className, reduced }) {
  const ref = useRef(null)
  const anim = useRef({ val: value, v: 0, raf: 0 })
  useEffect(() => {
    const a = anim.current
    const el = ref.current
    if (reduced) {
      a.val = value
      el.textContent = gbp(value)
      return
    }
    if (!reduced && el && Math.abs(value - a.val) > 0.001) {
      el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: 'ease-out' }
      )
    }
    cancelAnimationFrame(a.raf)
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(1 / 30, (now - last) / 1000)
      last = now
      const acc = -140 * (a.val - value) - 18 * a.v
      a.v += acc * dt
      a.val += a.v * dt
      if (Math.abs(a.val - value) < 0.005 && Math.abs(a.v) < 0.05) {
        a.val = value
        a.v = 0
        el.textContent = gbp(value)
        return
      }
      el.textContent = gbp(Math.max(0, a.val))
      a.raf = requestAnimationFrame(frame)
    }
    a.raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(a.raf)
  }, [value, reduced])
  return (
    <span className={className} ref={ref}>
      {gbp(value)}
    </span>
  )
}

/* ── Builder ────────────────────────────────────────────────────────────── */

// Everything starts deselected — the customer chooses every step.
// Hidden groups (the flatbread) are auto-included.
const defaultSelections = () => {
  const sel = {}
  for (const tab of BIZ.builder.tabs) {
    sel[tab.id] = {}
    for (const group of tab.groups) {
      sel[tab.id][group.id] = group.hidden ? [group.items[0].id] : []
    }
  }
  return sel
}

// What's already on the bread — the bed any new clip has to land on.
function buildContext(tab, sel) {
  let meat = null
  let salad = null
  for (const group of tab.groups) {
    const picked = group.items.find((i) => sel[group.id]?.includes(i.id))
    if (!picked) continue
    if (group.id === 'meat' || group.id === 'patty') {
      if (typeof picked.layer === 'string') meat = picked.layer
    }
    if (group.id === 'salad' || group.id === 'toppings') {
      if (picked.clip) salad = picked.clip
    }
  }
  return { meat, salad }
}

function deriveLayers(tab, sel) {
  const out = []
  const tabSel = sel[tab.id]
  let baseMeatArt = null
  for (const group of tab.groups) {
    for (const item of group.items) {
      if (!tabSel[group.id]?.includes(item.id) || !item.layer) continue
      const layerIds = Array.isArray(item.layer) ? item.layer : [item.layer]
      for (const lid of layerIds) {
        if (lid === 'BUN' || lid === 'BUN_SEEDED') {
          out.push({ key: 'bun-bottom', art: 'bun-bottom', order: ART['bun-bottom'].order })
          const top = lid === 'BUN' ? 'bun-top' : 'bun-top-seeded'
          out.push({ key: top, art: top, order: ART[top].order })
        } else if (lid === 'DOUBLE_MEAT') {
          // resolved after the loop, needs the base meat
          out.push({ key: 'DOUBLE_MEAT', art: 'DOUBLE_MEAT', order: 12 })
        } else {
          out.push({ key: lid, art: lid, order: ART[lid].order })
          if (ART[lid].order === 10) baseMeatArt = lid
        }
      }
    }
  }
  const resolved = out
    .map((l) =>
      l.art === 'DOUBLE_MEAT'
        ? baseMeatArt
          ? { key: `double-${baseMeatArt}`, art: baseMeatArt, order: 12 }
          : null
        : l
    )
    .filter(Boolean)
  resolved.sort((a, b) => a.order - b.order)
  return resolved // bottom → top
}

function buildSummary(tab, sel) {
  const tabSel = sel[tab.id]
  const picked = (gid) => {
    const g = tab.groups.find((x) => x.id === gid)
    if (!g) return []
    return g.items.filter((i) => tabSel[gid]?.includes(i.id))
  }
  const PROPER = ['American', 'Welsh']
  const soften = (name) =>
    name
      .split(' ')
      .map((w) =>
        (w.length > 1 && w === w.toUpperCase()) || PROPER.includes(w)
          ? w
          : w.charAt(0).toLowerCase() + w.slice(1)
      )
      .join(' ')
  const joinNames = (items) => {
    const names = items.map((i) => soften(i.name))
    if (names.length === 0) return ''
    if (names.length === 1) return names[0]
    return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
  }
  const base = picked(tab.groups[0].id)[0]
  const bread = picked(tab.groups[1].id)[0]
  const topGroup = tab.groups[2]
  const tops = picked(topGroup.id).filter((i) => i.layer)
  const sauces = picked('sauce').filter((i) => i.layer)
  const extras = picked('extras')

  let text = ''
  if (base) {
    text = base.name
    if (bread) text += ` on ${soften(bread.name)}`
    if (tops.length) text += ` with ${joinNames(tops)}`
    text += '.'
    if (sauces.length) {
      const s = joinNames(sauces)
      text += ` ${s.charAt(0).toUpperCase()}${s.slice(1)}${s.includes('sauce') ? '' : ' sauce'}.`
    }
    if (extras.length) text += ` Plus ${joinNames(extras)}.`
  }
  return { base, bread, tops, sauces, extras, joinNames, text }
}

function computeTotal(tab, sel) {
  let total = 0
  for (const group of tab.groups) {
    for (const item of group.items) {
      if (sel[tab.id][group.id]?.includes(item.id)) total += item.price
    }
  }
  return total
}

// The shop name with one letter lit — which letter is BIZ.copy.wordmarkAccent.
function Wordmark({ accentClass }) {
  const i = BIZ.copy.wordmarkAccent ?? 1
  return (
    <>
      {[...BIZ.name].map((ch, n) =>
        n === i ? (
          <span className={accentClass} key={n}>
            {ch}
          </span>
        ) : (
          ch
        )
      )}
    </>
  )
}

// The commission-free order channel: one tap and the whole build arrives on the
// shop's phone, already written out.
function WhatsAppButton({ href }) {
  if (!href) return null
  return (
    <a className="wa-btn" href={href} target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
      </svg>
      Send it on WhatsApp
    </a>
  )
}

function Builder({ reduced }) {
  const [activeTabId, setActiveTabId] = useState(BIZ.builder.tabs[0].id)
  const [sel, setSel] = useState(defaultSelections)
  const sectionRef = useRef(null)
  const [barVisible, setBarVisible] = useState(false)
  const [armed, setArmed] = useState(false)
  const [screen, setScreen] = useState('menu') // 'menu' | 'build'
  const [filmCue, setFilmCue] = useState(null)
  const [order, setOrder] = useState([])
  const [copied, setCopied] = useState(false)
  const soundMuteUntil = useRef(0)
  const tabRefs = useRef({})

  const tab = BIZ.builder.tabs.find((t) => t.id === activeTabId)
  const layers = useMemo(() => deriveLayers(tab, sel), [tab, sel])
  const total = useMemo(() => computeTotal(tab, sel), [tab, sel])
  const summary = buildSummary(tab, sel)

  const toggle = (group, item) => {
    const cur = sel[activeTabId][group.id] || []
    // Selecting anything new plays its film; re-tapping a selected pick-one
    // item replays it (tapping a selected topping still deselects, no film).
    const selecting =
      !cur.includes(item.id) || (group.pick === 'one' && cur.includes(item.id))

    if (selecting && (item.layer || item.clip) && !reduced) {
      const meatGroup = tab.groups[0]
      const meatItem = meatGroup.items.find((i) =>
        sel[activeTabId][meatGroup.id]?.includes(i.id)
      )
      const base =
        item.clip ??
        (typeof item.layer === 'string' ? clipKeyFor(item.layer, meatItem?.layer) : null)
      // Land it on what's already built, not on a bare doner.
      const key = resolveClip(base, buildContext(tab, sel[activeTabId]))
      const clip = key && CLIPS[key]
      if (clip) {
        soundMuteUntil.current = performance.now() + 4000
        setFilmCue({ src: clip.src, nonce: Date.now() })
      }
    }

    setSel((prev) => {
      const c = prev[activeTabId][group.id] || []
      let next
      if (group.pick === 'one') {
        if (c.includes(item.id)) return prev
        next = [item.id]
      } else {
        next = c.includes(item.id) ? c.filter((x) => x !== item.id) : [...c, item.id]
      }
      return {
        ...prev,
        [activeTabId]: { ...prev[activeTabId], [group.id]: next },
      }
    })
  }

  // The panel rests on the final frame of the highest chained stage selected —
  // the photoreal build "grows" as higher stages are added, no cartoons.
  // Stage order: bread < meat < toppings/salad < sauce. Extras play their film
  // on tap but never own the resting frame.
  const STAGE = { bread: 0, bun: 1, meat: 2, patty: 2, salad: 3, toppings: 3, sauce: 4 }
  const selectedClips = useMemo(() => {
    const found = [] // { key, still, stage }
    const ctx = buildContext(tab, sel[activeTabId])
    for (const group of tab.groups) {
      for (const item of group.items) {
        if (!sel[activeTabId][group.id]?.includes(item.id)) continue
        const base =
          item.clip ?? (typeof item.layer === 'string' ? clipKeyFor(item.layer, null) : null)
        const key = resolveClip(base, ctx)
        if (key && CLIPS[key]) {
          found.push({ key, still: CLIPS[key].still, stage: STAGE[group.id] ?? -1 })
        }
      }
    }
    return found
  }, [tab, sel, activeTabId])

  const restingStill = useMemo(() => {
    let best = null
    let bestStage = -1
    for (const c of selectedClips) {
      if (c.stage >= bestStage && c.stage >= 0) {
        bestStage = c.stage
        best = c.still
      }
    }
    // Empty build rests on the bare coals, never on cartoons
    return best ?? SET_PLATE
  }, [selectedClips, activeTabId])

  // ── Multi-person order ────────────────────────────────────────────────
  const orderTotal = order.reduce((s, o) => s + o.total, 0)
  const runningTotal = orderTotal + total

  const addToOrder = () => {
    if (!summary.base) return
    primeAudio()
    slamSound(1.1, 1900)
    setOrder((o) => [
      ...o,
      { id: Date.now(), text: summary.text, total, tabLabel: tab.label.replace(/s$/, '') },
    ])
    // clear the builder for the next person (hidden groups stay auto-included)
    setSel((prev) => ({
      ...prev,
      [activeTabId]: Object.fromEntries(
        tab.groups.map((g) => [g.id, g.hidden ? [g.items[0].id] : []])
      ),
    }))
    setFilmCue(null)
    setScreen('menu')
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const removeFromOrder = (id) => setOrder((o) => o.filter((x) => x.id !== id))

  const orderText = () => {
    const rows = order.map((o, i) => `${i + 1}. ${o.text} — ${gbp(o.total)}`)
    if (summary.base) rows.push(`${order.length + 1}. ${summary.text} — ${gbp(total)}`)
    return `${BIZ.name} order:\n${rows.join('\n')}\nTotal: ${gbp(runningTotal)}`
  }

  // The order lands on the shop's phone as a message they can read back at the
  // counter — no commission, no middleman. Shops without WhatsApp get null and
  // the button never renders.
  const waHref = () =>
    BIZ.whatsapp
      ? `https://wa.me/${BIZ.whatsapp}?text=${encodeURIComponent(orderText())}`
      : null

  const copyOrder = () => {
    navigator.clipboard?.writeText(orderText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const finale = FINALES[activeTabId]

  // One gesture: the finale plays (your build assembling), then the item
  // banks into the order and you're back on the menu for the next person.
  const addToOrderRef = useRef(null)
  addToOrderRef.current = addToOrder
  const wrapAndAdd = () => {
    if (!summary.base) return
    primeAudio()
    if (finale && !reduced) {
      soundMuteUntil.current = performance.now() + 9000
      setFilmCue({
        src: finale.src,
        startAt: finale.startAt,
        nonce: Date.now(),
        onDone: () => addToOrderRef.current?.(),
      })
    } else {
      addToOrder()
    }
  }

  // ── Kiosk flow: menu of products → dedicated build page ─────────────────
  const menuCards = useMemo(() => {
    const cards = []
    for (const t of BIZ.builder.tabs) {
      if (t.comingSoon) continue
      for (const item of t.groups[0].items) {
        if (item.hidden) continue
        const key = item.clip ?? (typeof item.layer === 'string' ? item.layer : null)
        cards.push({
          tabId: t.id,
          tabLabel: t.label.replace(/s$/, ''),
          item,
          still: item.cardStill || (key && CLIPS[key]?.still) || SET_PLATE,
          clipSrc: (key && CLIPS[key]?.src) || null,
        })
      }
    }
    return cards
  }, [])

  const selectProduct = (card) => {
    primeAudio()
    const t = BIZ.builder.tabs.find((x) => x.id === card.tabId)
    setActiveTabId(card.tabId)
    prefetchTabClips(card.tabId)
    setSel((prev) => ({
      ...prev,
      [card.tabId]: Object.fromEntries(
        t.groups.map((g, gi) => [
          g.id,
          gi === 0 ? [card.item.id] : g.hidden ? [g.items[0].id] : [],
        ])
      ),
    }))
    setScreen('build')
    if (!reduced) {
      const key =
        card.item.clip ?? (typeof card.item.layer === 'string' ? card.item.layer : null)
      const clip = key && CLIPS[key]
      if (clip) {
        soundMuteUntil.current = performance.now() + 4000
        setFilmCue({ src: clip.src, nonce: Date.now() })
      }
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Shop favourites ───────────────────────────────────────────────────────
  // A favourite is a starting point, never a finished order. The card pictures
  // what people actually order — that's the appetite — but tapping it drops you
  // on the meat and nothing else, so the salad and the sauce are still the
  // customer's to choose and to watch land. `fav.sel` describes the picture;
  // only its meat is applied here.
  const pickFavourite = (fav) => {
    primeAudio()
    const t = BIZ.builder.tabs.find((x) => x.id === fav.tab)
    if (!t) return
    setActiveTabId(fav.tab)
    prefetchTabClips(fav.tab)
    const meatGroup = t.groups[0]
    const next = Object.fromEntries(
      t.groups.map((g) => [
        g.id,
        g.id === meatGroup.id
          ? fav.sel[g.id] ?? []
          : g.hidden
            ? [g.items[0].id]
            : [],
      ])
    )
    setSel((prev) => ({ ...prev, [fav.tab]: next }))
    setScreen('build')
    if (!reduced) {
      const item = meatGroup.items.find((i) => next[meatGroup.id]?.includes(i.id))
      const base = item?.clip ?? (typeof item?.layer === 'string' ? item.layer : null)
      const key = resolveClip(base, buildContext(t, next))
      const clip = key && CLIPS[key]
      if (clip) {
        soundMuteUntil.current = performance.now() + 4000
        setFilmCue({ src: clip.src, nonce: Date.now() })
      }
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const favourites = useMemo(() => {
    const list = BIZ.builder.bestSellers || []
    return list.map((f) => {
      const t = BIZ.builder.tabs.find((x) => x.id === f.tab)
      const ctx = t ? buildContext(t, f.sel) : {}
      // The card shows the real end frame of the build, resolved the same way
      // the panel resolves it — so a card is never prettier than the thing it
      // loads, and it upgrades itself the moment a better variant is filmed.
      let still = null
      for (const gid of ['sauce', 'extras', 'toppings', 'salad', 'meat', 'patty']) {
        const group = t?.groups.find((g) => g.id === gid)
        const item = group?.items.find((i) => f.sel[gid]?.includes(i.id))
        const base = item?.clip ?? (typeof item?.layer === 'string' ? item.layer : null)
        const key = resolveClip(base, ctx)
        if (key && CLIPS[key]) { still = CLIPS[key].still; break }
      }
      return { ...f, still: still || SET_PLATE }
    })
  }, [])

  const backToMenu = () => {
    setScreen('menu')
    setFilmCue(null)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setBarVisible(e.isIntersecting), {
      rootMargin: '-80px 0px -40px 0px',
    })
    io.observe(sectionRef.current)
    // Arm the stack the first time the builder comes into view, so the
    // intro cascade plays in front of the user, not on page load.
    const arm = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true)
          arm.disconnect()
        }
      },
      { rootMargin: '0px 0px -15% 0px' }
    )
    arm.observe(sectionRef.current)
    return () => {
      io.disconnect()
      arm.disconnect()
    }
  }, [])

  const onTabKey = (e) => {
    const ids = BIZ.builder.tabs.filter((t) => !t.comingSoon).map((t) => t.id)
    const idx = ids.indexOf(activeTabId)
    let next = null
    if (e.key === 'ArrowRight') next = ids[(idx + 1) % ids.length]
    if (e.key === 'ArrowLeft') next = ids[(idx - 1 + ids.length) % ids.length]
    if (next) {
      e.preventDefault()
      setActiveTabId(next)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <section
      className="builder"
      id="builder"
      aria-labelledby="builder-title"
      ref={sectionRef}
      onPointerDown={primeAudio}
    >
      <div className="builder-head">
        <h2 className="display builder-title" id="builder-title">
          {BIZ.copy.builderHeading[0]} <em>{BIZ.copy.builderHeading[1]}</em>
        </h2>
        <p className="builder-sub">{BIZ.copy.builderBlurb}</p>
      </div>

      {screen === 'menu' ? (
        <div className="menu-screen">
          {favourites.length > 0 && (
            <div className="favourites">
              <p className="fav-label">
                {BIZ.copy.favouritesHeading[0]} <span>{BIZ.copy.favouritesHeading[1]}</span>
              </p>
              <div className="fav-row">
                {favourites.map((f) => (
                  <button key={f.id} className="fav-card" onClick={() => pickFavourite(f)}>
                    <img src={f.still} alt="" loading="lazy" />
                    <span className="fav-meta">
                      <span className="fav-name display">{f.name}</span>
                      <span className="fav-desc">{f.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="menu-cards">
            {menuCards.map((c) => (
              <button
                key={`${c.tabId}-${c.item.id}`}
                className="product-card"
                onClick={() => selectProduct(c)}
                onPointerEnter={() => prefetchClip(c.clipSrc)}
                onFocus={() => prefetchClip(c.clipSrc)}
              >
                <img src={c.still} alt="" loading="lazy" />
                <span className="pc-meta">
                  <span className="pc-top">
                    <span className="pc-name display">{c.item.name}</span>
                    <span className="pc-price">{gbp(c.item.price)}</span>
                  </span>
                  <span className="pc-desc">{c.item.desc || c.tabLabel}</span>
                </span>
              </button>
            ))}
          </div>
          {order.length > 0 && (
            <div className="summary order-panel">
              <div className="order-list">
                <p className="summary-label">Your order</p>
                <ul>
                  {order.map((o, i) => (
                    <li className="order-row" key={o.id}>
                      <span className="order-num">{i + 1}</span>
                      <span className="order-text">
                        <strong>{o.tabLabel}</strong> — {o.text}
                      </span>
                      <span className="order-price">{gbp(o.total)}</span>
                      <button
                        className="order-remove"
                        aria-label={`Remove item ${i + 1}`}
                        onClick={() => removeFromOrder(o.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="order-grand">
                  <span>Order total</span>
                  <AnimatedPrice value={orderTotal} className="order-grand-num" reduced={reduced} />
                </div>
                <WhatsAppButton href={waHref()} />
                <button className="copy-btn" onClick={copyOrder}>
                  {copied ? 'Copied ✓' : 'Copy order — text it ahead'}
                </button>
              </div>
              {BIZ.phone && (
                <a className={`call-btn${BIZ.whatsapp ? ' secondary' : ''}`} href={BIZ.phoneHref}>
                  Call it through <small>{BIZ.phone}</small>
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
      <div className="builder-grid">
        <div>
          <div className="build-topbar">
            <button className="back-btn" onClick={backToMenu}>
              ← Menu
            </button>
            {summary.base && (
              <span className="build-chosen display">{summary.base.name}</span>
            )}
          </div>

          <div role="tabpanel" id={`panel-${tab.id}`}>
            {tab.groups
              .filter((g) => !g.hidden && g.id !== tab.groups[0].id)
              .map((group) => (
              <fieldset className="group" key={group.id} style={{ border: 0 }}>
                <legend className="group-label">{group.label}</legend>
                <div className="opts">
                  {group.items.filter((i) => !i.hidden).map((item) => {
                    const on = sel[activeTabId][group.id]?.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        className="opt"
                        aria-pressed={on}
                        onClick={() => toggle(group, item)}
                      >
                        {item.name}
                        <span className="p">
                          {item.price === 0 ? 'free' : `+${gbp(item.price).replace('.00', '')}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <div className="viz-wrap">
          <Stack
            key={activeTabId}
            layers={layers}
            reduced={reduced}
            armed={armed}
            filmCue={filmCue}
            soundMuteUntil={soundMuteUntil}
            restingStill={restingStill}
            price={total}
          />
          <div className="summary">
            <div className="summary-row">
              <div>
                <p className="summary-label">Your total</p>
                <AnimatedPrice value={total} className="summary-total" reduced={reduced} />
              </div>
            </div>
            <p className="summary-text" aria-live="polite">
              {summary.base ? (
                <>
                  <strong>{summary.base.name}</strong>
                  {summary.bread && <> on {summary.bread.name.toLowerCase()}</>}
                  {summary.tops.length > 0 && <> with {summary.joinNames(summary.tops)}</>}
                  {'. '}
                  {summary.sauces.length > 0 ? (
                    <>
                      {summary.joinNames(summary.sauces).replace(/^./, (c) => c.toUpperCase())}
                      {summary.joinNames(summary.sauces).includes('sauce') ? '' : ' sauce'}.{' '}
                    </>
                  ) : tab.groups.find((g) => g.id === 'sauce')?.hidden ? null : sel[
                      activeTabId
                    ].sauce?.length ? (
                    // Only once they've actually chosen it. An untouched build
                    // hasn't turned the sauce down, it just hasn't got there yet.
                    <span className="muted">No sauce — bold move. </span>
                  ) : null}
                  {summary.extras.length > 0 && <>Plus {summary.joinNames(summary.extras)}.</>}
                </>
              ) : (
                <span className="muted">Pick a base to get going.</span>
              )}
            </p>
            {selectedClips.length > 0 && (
              <div className="build-tiles" aria-hidden="true">
                {selectedClips.map((c) => (
                  <img key={c.key} src={c.still} alt="" loading="lazy" />
                ))}
              </div>
            )}
            <button className="add-btn" onClick={wrapAndAdd} disabled={!summary.base}>
              Wrap it{summary.base ? ` — add to order · ${gbp(total)}` : ''}
            </button>

            {order.length > 0 && (
              <div className="order-list">
                <p className="summary-label">Your order</p>
                <ul>
                  {order.map((o, i) => (
                    <li className="order-row" key={o.id}>
                      <span className="order-num">{i + 1}</span>
                      <span className="order-text">
                        <strong>{o.tabLabel}</strong> — {o.text}
                      </span>
                      <span className="order-price">{gbp(o.total)}</span>
                      <button
                        className="order-remove"
                        aria-label={`Remove item ${i + 1}`}
                        onClick={() => removeFromOrder(o.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  {summary.base && (
                    <li className="order-row building" aria-hidden="true">
                      <span className="order-num">{order.length + 1}</span>
                      <span className="order-text muted">Building now…</span>
                      <span className="order-price">{gbp(total)}</span>
                      <span />
                    </li>
                  )}
                </ul>
                <div className="order-grand">
                  <span>Order total</span>
                  <AnimatedPrice value={runningTotal} className="order-grand-num" reduced={reduced} />
                </div>
                <WhatsAppButton href={waHref()} />
                <button className="copy-btn" onClick={copyOrder}>
                  {copied ? 'Copied ✓' : 'Copy order — text it ahead'}
                </button>
              </div>
            )}

            {BIZ.phone && (
              <a className={`call-btn${BIZ.whatsapp ? ' secondary' : ''}`} href={BIZ.phoneHref}>
                Call it through <small>{BIZ.phone}</small>
              </a>
            )}
          </div>
        </div>
      </div>
      )}

      <div className={`sticky-bar${barVisible ? ' show' : ''}`} aria-hidden={!barVisible}>
        <div>
          <p className="lbl">
            {order.length > 0
              ? `Order · ${order.length + (summary.base ? 1 : 0)} item${
                  order.length + (summary.base ? 1 : 0) === 1 ? '' : 's'
                }`
              : 'Your total'}
          </p>
          <AnimatedPrice value={runningTotal} className="tot" reduced={reduced} />
        </div>
        <button
          className="bar-add"
          onClick={wrapAndAdd}
          disabled={!summary.base}
          tabIndex={barVisible ? 0 : -1}
        >
          Wrap it
        </button>
        {BIZ.phone && (
          <a href={BIZ.phoneHref} tabIndex={barVisible ? 0 : -1}>
            Call
          </a>
        )}
      </div>
    </section>
  )
}

/* ── Hero, ticker, info, footer ─────────────────────────────────────────── */

function Hero() {
  return (
    <header className="hero">
      {BIZ.heroVideoUrl ? (
        <video
          className="hero-media"
          src={BIZ.heroVideoUrl}
          poster={BIZ.heroPosterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : BIZ.heroPosterUrl ? (
        <img className="hero-media" src={BIZ.heroPosterUrl} alt="" aria-hidden="true" />
      ) : (
        <div className="hero-fallback" aria-hidden="true">
          <div className="coal" />
          <div className="coal b" />
        </div>
      )}

      <div className="hero-top">
        <p className="mini display" aria-hidden="true">
          {BIZ.name.slice(0, 1)}
          <span>·</span>
        </p>
        {BIZ.phone && (
          <a className="phone" href={BIZ.phoneHref}>
            {BIZ.phone}
          </a>
        )}
      </div>

      <div className="hero-core">
        <p className="hero-kicker">
          {BIZ.copy.heroKicker} · {BIZ.locationLine}
        </p>
        <h1 className="display hero-word">
          <Wordmark accentClass="o" />
        </h1>
        <p className="hero-strap">{BIZ.tagline}</p>
        <a className="hero-cta" href="#builder" onPointerDown={primeAudio}>
          {BIZ.copy.heroCta}
        </a>
      </div>

      <p className="hero-scrollcue" aria-hidden="true">
        Scroll
      </p>
    </header>
  )
}

function Ticker() {
  const chunk = (
    <div className="ticker-chunk" aria-hidden="true">
      {BIZ.ticker.map((t) => (
        <span key={t}>
          {t} <span className="dot"> ✦ </span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="ticker" role="presentation">
      <div className="ticker-track">
        {chunk}
        {chunk}
      </div>
    </div>
  )
}

function InfoStrip() {
  return (
    <section className="info" aria-label="Opening hours and location">
      <div className="info-grid">
        <div>
          <h3>
            {BIZ.copy.hoursHeading[0]} <span>{BIZ.copy.hoursHeading[1]}</span>
          </h3>
          <ul className="hours">
            {BIZ.hours.map((h) => (
              <li key={h.days}>
                <span>{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>
            {BIZ.copy.locationHeading[0]} <span>{BIZ.copy.locationHeading[1]}</span>
          </h3>
          <p>
            <strong>{BIZ.address}</strong>
            <br />
            {BIZ.copy.locationBlurb}
          </p>
        </div>
        <div>
          <h3>
            {BIZ.copy.orderHeading[0]} <span>{BIZ.copy.orderHeading[1]}</span>
          </h3>
          <p>{BIZ.copy.orderBlurb}</p>
          {BIZ.phone && (
            <a className="big-phone display" href={BIZ.phoneHref}>
              {BIZ.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="wordmini">
        <Wordmark />
      </p>
      <p>
        {BIZ.copy.footerLine} · © {new Date().getFullYear()} {BIZ.name}
      </p>
    </footer>
  )
}

/* ── App ────────────────────────────────────────────────────────────────── */

export default function App() {
  const reduced = usePrefersReducedMotion()
  return (
    <>
      <EmberField reduced={reduced} />
      <div className="grain" aria-hidden="true" />
      <Hero />
      <Ticker />
      <main>
        <Builder reduced={reduced} />
      </main>
      <InfoStrip />
      <Footer />
    </>
  )
}
