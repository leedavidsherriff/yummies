// Hand-drawn SVG ingredient layers for the exploded stack.
// Each entry: C (component), w (fraction of stack width), order (bottom → top),
// weight (how hard it slams — drives quake + spark count).

const Shadow = ({ w = 220 }) => (
  <ellipse cx="150" cy="66" rx={w / 2} ry="7" fill="#000" opacity="0.35" />
)

/* ── Breads ─────────────────────────────────────────────────────────────── */

const Flatbread = () => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <defs>
      <linearGradient id="g-flat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F2D9A7" />
        <stop offset="0.6" stopColor="#E3B978" />
        <stop offset="1" stopColor="#C08A4A" />
      </linearGradient>
    </defs>
    <Shadow w={272} />
    <path d="M12 42 Q20 24 60 22 Q95 12 150 14 Q205 12 240 22 Q280 24 288 42 Q280 58 240 60 Q205 66 150 65 Q95 66 60 60 Q20 58 12 42 Z" fill="url(#g-flat)" />
    <path d="M12 42 Q20 24 60 22 Q95 12 150 14 Q205 12 240 22 Q280 24 288 42" fill="none" stroke="#F8E8C4" strokeWidth="3" opacity="0.6" />
    <g fill="#8A5A28" opacity="0.55">
      <ellipse cx="70" cy="34" rx="9" ry="5" />
      <ellipse cx="130" cy="26" rx="7" ry="4" />
      <ellipse cx="196" cy="32" rx="10" ry="5" />
      <ellipse cx="243" cy="40" rx="6" ry="4" />
      <ellipse cx="100" cy="48" rx="6" ry="3.5" />
      <ellipse cx="165" cy="44" rx="5" ry="3" />
    </g>
    <g fill="#FBEFD2" opacity="0.7">
      <ellipse cx="88" cy="24" rx="5" ry="2.5" />
      <ellipse cx="210" cy="24" rx="6" ry="3" />
      <ellipse cx="150" cy="34" rx="4" ry="2" />
    </g>
  </svg>
)

const Pitta = () => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <defs>
      <linearGradient id="g-pitta" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EFDCB2" />
        <stop offset="1" stopColor="#CBA05F" />
      </linearGradient>
    </defs>
    <Shadow w={260} />
    <path d="M18 44 Q30 20 150 18 Q270 20 282 44 Q270 62 150 62 Q30 62 18 44 Z" fill="url(#g-pitta)" />
    <path d="M40 40 Q150 28 260 40" fill="none" stroke="#A87B3E" strokeWidth="2.5" opacity="0.6" strokeDasharray="10 7" />
    <g fill="#9A6D33" opacity="0.4">
      <ellipse cx="90" cy="32" rx="7" ry="3.5" />
      <ellipse cx="205" cy="34" rx="8" ry="4" />
      <ellipse cx="150" cy="50" rx="6" ry="3" />
    </g>
  </svg>
)

const Naan = () => (
  <svg viewBox="0 0 300 82" aria-hidden="true">
    <defs>
      <linearGradient id="g-naan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4DFAE" />
        <stop offset="1" stopColor="#B97F3C" />
      </linearGradient>
    </defs>
    <Shadow w={276} />
    <path d="M10 46 Q14 22 62 20 Q100 8 155 12 Q225 10 262 26 Q292 34 290 48 Q282 64 230 66 Q170 72 110 68 Q40 66 10 46 Z" fill="url(#g-naan)" />
    <g fill="#7E4F1E" opacity="0.5">
      <ellipse cx="60" cy="36" rx="11" ry="6" />
      <ellipse cx="140" cy="26" rx="9" ry="5" />
      <ellipse cx="215" cy="36" rx="12" ry="6" />
      <ellipse cx="110" cy="52" rx="7" ry="4" />
      <ellipse cx="180" cy="50" rx="6" ry="3.5" />
    </g>
    <path d="M40 30 Q90 18 150 20 Q220 18 265 34" fill="none" stroke="#FCEDC8" strokeWidth="4" opacity="0.55" strokeLinecap="round" />
  </svg>
)

/* ── Meats ──────────────────────────────────────────────────────────────── */

const ribbon = (y, amp) =>
  `M18 ${y} Q45 ${y - amp} 72 ${y} T126 ${y} T180 ${y} T234 ${y} T282 ${y}`

const Doner = ({ tone = ['#8C4A22', '#A85B2B', '#C4763B'], edge = '#5E2D10' }) => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <Shadow w={250} />
    <g fill="none" strokeLinecap="round">
      <path d={ribbon(52, 10)} stroke={edge} strokeWidth="17" opacity="0.9" />
      <path d={ribbon(50, 10)} stroke={tone[0]} strokeWidth="13" />
      <path d={ribbon(36, 12)} stroke={edge} strokeWidth="17" opacity="0.9" />
      <path d={ribbon(34, 12)} stroke={tone[1]} strokeWidth="13" />
      <path d={ribbon(21, 10)} stroke={edge} strokeWidth="16" opacity="0.9" />
      <path d={ribbon(19, 10)} stroke={tone[2]} strokeWidth="12" />
      <path d={ribbon(17, 10)} stroke="#E29A55" strokeWidth="4" opacity="0.8" />
    </g>
  </svg>
)

const ChickenDoner = () => (
  <Doner tone={['#B97C35', '#D19647', '#E4B063']} edge="#8A5416" />
)

const MixedDoner = () => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <Shadow w={250} />
    <g fill="none" strokeLinecap="round">
      <path d={ribbon(52, 10)} stroke="#5E2D10" strokeWidth="17" opacity="0.9" />
      <path d={ribbon(50, 10)} stroke="#A85B2B" strokeWidth="13" />
      <path d={ribbon(34, 12)} stroke="#8A5416" strokeWidth="17" opacity="0.9" />
      <path d={ribbon(32, 12)} stroke="#D99F4C" strokeWidth="13" />
      <path d={ribbon(19, 10)} stroke="#5E2D10" strokeWidth="16" opacity="0.9" />
      <path d={ribbon(17, 10)} stroke="#C4763B" strokeWidth="12" />
    </g>
  </svg>
)

const Shish = () => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <defs>
      <linearGradient id="g-shish" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9B4A26" />
        <stop offset="1" stopColor="#5F2410" />
      </linearGradient>
    </defs>
    <Shadow w={250} />
    <rect x="14" y="36" width="272" height="5" rx="2.5" fill="#6B6B6B" />
    {[30, 82, 134, 186, 238].map((x, i) => (
      <g key={x}>
        <rect x={x} y={i % 2 ? 16 : 20} width="44" height="40" rx="10" fill="url(#g-shish)" />
        <rect x={x} y={i % 2 ? 16 : 20} width="44" height="40" rx="10" fill="none" stroke="#3D1608" strokeWidth="3" opacity="0.7" />
        <path d={`M${x + 8} ${i % 2 ? 24 : 28} q12 -5 28 0`} stroke="#D97E45" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
    ))}
  </svg>
)

const Patty = () => (
  <svg viewBox="0 0 300 70" aria-hidden="true">
    <defs>
      <linearGradient id="g-patty" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7A3A1D" />
        <stop offset="1" stopColor="#43180A" />
      </linearGradient>
    </defs>
    <Shadow w={240} />
    <path d="M22 26 Q26 14 60 14 L240 14 Q274 14 278 26 L278 40 Q274 54 240 54 L60 54 Q26 54 22 40 Z" fill="url(#g-patty)" />
    <g stroke="#2A0D04" strokeWidth="5" strokeLinecap="round" opacity="0.85">
      <path d="M56 24 l30 0" /><path d="M126 24 l34 0" /><path d="M200 24 l32 0" />
      <path d="M88 40 l32 0" /><path d="M162 40 l30 0" />
    </g>
    <path d="M40 18 Q150 8 262 18" stroke="#B65C2E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    <ellipse cx="250" cy="56" rx="6" ry="4" fill="#43180A" opacity="0.8" />
  </svg>
)

const PattyDouble = () => (
  <svg viewBox="0 0 300 96" aria-hidden="true">
    <defs>
      <linearGradient id="g-patty2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7A3A1D" />
        <stop offset="1" stopColor="#43180A" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="88" rx="122" ry="7" fill="#000" opacity="0.35" />
    {[46, 8].map((y) => (
      <g key={y} transform={`translate(0 ${y})`}>
        <path d="M22 12 Q26 2 60 2 L240 2 Q274 2 278 12 L278 24 Q274 36 240 36 L60 36 Q26 36 22 24 Z" fill="url(#g-patty2)" />
        <g stroke="#2A0D04" strokeWidth="5" strokeLinecap="round" opacity="0.85">
          <path d="M60 14 l30 0" /><path d="M136 14 l34 0" /><path d="M206 14 l28 0" />
        </g>
        <path d="M40 6 Q150 -2 262 6" stroke="#B65C2E" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    ))}
    <path d="M70 44 q6 8 -2 14 M228 44 q-6 8 2 14" stroke="#F3C24C" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9" />
  </svg>
)

const Fillet = () => (
  <svg viewBox="0 0 300 72" aria-hidden="true">
    <defs>
      <linearGradient id="g-fillet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E8A64E" />
        <stop offset="1" stopColor="#A96A22" />
      </linearGradient>
    </defs>
    <Shadow w={240} />
    <path d="M24 38 Q20 24 40 22 Q52 10 74 18 Q92 8 112 16 Q132 6 152 14 Q174 6 192 16 Q214 8 230 20 Q252 14 262 26 Q282 28 276 42 Q270 56 246 54 Q228 62 206 56 Q184 64 162 56 Q140 64 118 56 Q96 62 76 54 Q48 58 36 50 Q22 48 24 38 Z" fill="url(#g-fillet)" />
    <g fill="#7E4A12" opacity="0.6">
      <circle cx="80" cy="34" r="3" /><circle cx="130" cy="28" r="2.5" /><circle cx="180" cy="36" r="3" />
      <circle cx="222" cy="32" r="2.5" /><circle cx="105" cy="46" r="2.5" /><circle cx="158" cy="44" r="2" />
    </g>
    <path d="M50 28 Q150 16 250 30" stroke="#F6CF8A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
)

const grillSlab = (y, h) => (
  <g key={y}>
    <rect x="34" y={y} width="232" height={h} rx="8" fill="#F3EEDD" />
    <rect x="34" y={y} width="232" height={h} rx="8" fill="none" stroke="#D9CFB4" strokeWidth="2" />
    <g stroke="#B08A45" strokeWidth="5" strokeLinecap="round" opacity="0.85">
      <path d={`M58 ${y + 4} l26 ${h - 8}`} /><path d={`M118 ${y + 4} l26 ${h - 8}`} />
      <path d={`M178 ${y + 4} l26 ${h - 8}`} /><path d={`M232 ${y + 4} l14 ${h - 8}`} />
    </g>
  </g>
)

const HalloumiPatty = () => (
  <svg viewBox="0 0 300 78" aria-hidden="true">
    <Shadow w={230} />
    {grillSlab(36, 24)}
    {grillSlab(8, 24)}
  </svg>
)

const Halloumi = () => (
  <svg viewBox="0 0 300 60" aria-hidden="true">
    <ellipse cx="150" cy="50" rx="112" ry="6" fill="#000" opacity="0.35" />
    {grillSlab(14, 26)}
  </svg>
)

const Bacon = () => (
  <svg viewBox="0 0 300 64" aria-hidden="true">
    <ellipse cx="150" cy="54" rx="116" ry="6" fill="#000" opacity="0.35" />
    {[8, 26].map((y, i) => (
      <g key={y} transform={`translate(${i ? 14 : 0} ${y})`}>
        <path d="M20 14 Q50 2 80 14 T140 14 T200 14 T258 14 L258 26 Q228 38 198 26 T138 26 T78 26 T20 26 Z" fill="#A63A24" />
        <path d="M20 20 Q50 8 80 20 T140 20 T200 20 T258 20" stroke="#F0D9BE" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M20 14 Q50 2 80 14 T140 14 T200 14 T258 14" stroke="#7E2413" strokeWidth="3" fill="none" opacity="0.8" />
      </g>
    ))}
  </svg>
)

/* ── Toppings ───────────────────────────────────────────────────────────── */

const Lettuce = () => (
  <svg viewBox="0 0 300 58" aria-hidden="true">
    <defs>
      <linearGradient id="g-lett" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8FCB4E" />
        <stop offset="1" stopColor="#4E8A22" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="50" rx="120" ry="6" fill="#000" opacity="0.35" />
    <path d="M18 30 Q28 12 46 24 Q56 8 76 20 Q88 6 106 18 Q120 4 138 16 Q152 4 168 16 Q182 4 198 18 Q214 6 228 20 Q246 8 258 24 Q274 14 282 30 Q272 46 254 40 Q244 52 226 44 Q212 54 196 44 Q180 54 164 44 Q150 54 134 44 Q118 54 102 44 Q88 52 72 42 Q54 50 42 38 Q26 44 18 30 Z" fill="url(#g-lett)" />
    <g stroke="#3C6B18" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round">
      <path d="M60 26 q10 6 22 2" /><path d="M126 22 q10 8 24 3" /><path d="M198 26 q12 6 24 0" />
    </g>
  </svg>
)

const Tomato = () => (
  <svg viewBox="0 0 300 60" aria-hidden="true">
    <ellipse cx="150" cy="52" rx="110" ry="6" fill="#000" opacity="0.35" />
    {[78, 150, 222].map((x, i) => (
      <g key={x} transform={`translate(${x} ${i === 1 ? 26 : 30})`}>
        <circle r="26" fill="#D93A24" />
        <circle r="20" fill="#E8593F" />
        <g fill="#F7B199">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 -4 Q6 -10 4 -17 Q0 -13 -4 -17 Q-6 -10 0 -4" />
          ))}
        </g>
        <circle r="3.5" fill="#F3CDB9" />
      </g>
    ))}
  </svg>
)

const Onion = () => (
  <svg viewBox="0 0 300 54" aria-hidden="true">
    <ellipse cx="150" cy="46" rx="110" ry="5" fill="#000" opacity="0.3" />
    {[62, 118, 174, 230].map((x, i) => (
      <g key={x}>
        <ellipse cx={x} cy={i % 2 ? 24 : 28} rx="34" ry="14" fill="none" stroke="#B072B8" strokeWidth="7" opacity="0.95" />
        <ellipse cx={x} cy={i % 2 ? 24 : 28} rx="34" ry="14" fill="none" stroke="#EBD6EF" strokeWidth="3" />
      </g>
    ))}
  </svg>
)

const Cabbage = () => (
  <svg viewBox="0 0 300 54" aria-hidden="true">
    <ellipse cx="150" cy="46" rx="112" ry="5" fill="#000" opacity="0.3" />
    <g fill="none" strokeLinecap="round">
      {[
        'M24 30 q20 -14 44 -2 q18 10 40 -4',
        'M96 22 q24 -10 46 2 q20 12 44 -2',
        'M176 30 q22 -14 44 -2 q18 8 40 -6',
        'M40 40 q26 -8 50 0 q22 8 46 -2',
        'M150 40 q24 -10 48 0 q20 8 40 -4',
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#6B2D7B" strokeWidth="8" />
          <path d={d} stroke="#C79ED4" strokeWidth="3" />
        </g>
      ))}
    </g>
  </svg>
)

const Jalapenos = () => (
  <svg viewBox="0 0 300 52" aria-hidden="true">
    <ellipse cx="150" cy="44" rx="100" ry="5" fill="#000" opacity="0.3" />
    {[70, 130, 190, 246].map((x, i) => (
      <g key={x} transform={`translate(${x} ${i % 2 ? 22 : 27})`}>
        <circle r="17" fill="#4E7A1E" />
        <circle r="12" fill="#7FA83F" />
        <circle r="12" fill="none" stroke="#D9E8B4" strokeWidth="2.5" />
        {[45, 165, 285].map((a) => (
          <circle key={a} cx={8 * Math.cos((a * Math.PI) / 180)} cy={8 * Math.sin((a * Math.PI) / 180)} r="2" fill="#EFF5DA" />
        ))}
      </g>
    ))}
  </svg>
)

const Chillies = () => (
  <svg viewBox="0 0 300 58" aria-hidden="true">
    <ellipse cx="150" cy="50" rx="104" ry="5" fill="#000" opacity="0.3" />
    {[70, 150, 230].map((x, i) => (
      <g key={x} transform={`translate(${x} 28) rotate(${i % 2 ? 8 : -8})`}>
        <path d="M-38 -4 Q-10 -16 30 -6 Q44 -2 42 6 Q38 14 22 12 Q-14 16 -38 4 Q-44 0 -38 -4 Z" fill="#C92F1E" />
        <path d="M-34 -2 Q-8 -12 28 -4" stroke="#F07A5A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M40 0 q10 -4 14 -10" stroke="#4E7A1E" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ))}
  </svg>
)

const Cheese = () => (
  <svg viewBox="0 0 300 64" aria-hidden="true">
    <defs>
      <linearGradient id="g-cheese" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFC93D" />
        <stop offset="1" stopColor="#F0A616" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="56" rx="112" ry="6" fill="#000" opacity="0.35" />
    <path d="M36 12 L264 12 L264 34 Q258 34 256 46 Q252 56 246 44 Q243 34 236 34 L214 34 Q210 34 208 50 Q204 62 199 46 Q197 34 190 34 L150 34 Q146 34 144 44 Q140 54 135 44 Q133 34 126 34 L92 34 Q88 34 86 52 Q82 64 77 48 Q75 34 68 34 L36 34 Z" fill="url(#g-cheese)" />
    <path d="M36 12 L264 12" stroke="#FFE08A" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
  </svg>
)

/* ── Sauces ─────────────────────────────────────────────────────────────── */

const Drizzle = ({ c1, c2 }) => (
  <svg viewBox="0 0 300 42" aria-hidden="true">
    <g fill="none" strokeLinecap="round">
      <path d="M28 24 Q52 8 76 22 T124 22 T172 22 T220 22 T268 22" stroke={c2} strokeWidth="13" opacity="0.9" />
      <path d="M28 22 Q52 6 76 20 T124 20 T172 20 T220 20 T268 20" stroke={c1} strokeWidth="8" />
    </g>
    <g fill={c1}>
      <circle cx="58" cy="34" r="4" /><circle cx="146" cy="35" r="3.4" /><circle cx="236" cy="34" r="4" />
    </g>
  </svg>
)

const SauceGarlic = () => <Drizzle c1="#F7F1E1" c2="#D9CBA8" />
const SauceChilli = () => <Drizzle c1="#E8401F" c2="#A31F0B" />
const SauceMint = () => <Drizzle c1="#9CD08B" c2="#5E9A50" />
const SauceBBQ = () => <Drizzle c1="#7A3A16" c2="#4A1F08" />
const SauceBurger = () => <Drizzle c1="#F2B279" c2="#D08344" />

/* ── Buns ───────────────────────────────────────────────────────────────── */

const BunTop = ({ seeds = 7 }) => (
  <svg viewBox="0 0 300 84" aria-hidden="true">
    <defs>
      <linearGradient id="g-bunt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E8A852" />
        <stop offset="0.7" stopColor="#C77F2E" />
        <stop offset="1" stopColor="#A96420" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="74" rx="126" ry="7" fill="#000" opacity="0.35" />
    <path d="M24 66 Q22 22 84 12 Q150 2 216 12 Q278 22 276 66 Q276 72 266 72 L34 72 Q24 72 24 66 Z" fill="url(#g-bunt)" />
    <path d="M44 36 Q90 16 150 15 Q210 16 256 36" stroke="#F4C883" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
    <g fill="#F8E7C0">
      {Array.from({ length: seeds }, (_, i) => {
        const t = (i + 0.5) / seeds
        const x = 40 + t * 220
        const y = 40 - Math.sin(t * Math.PI) * 18 + (i % 2 ? 6 : 0)
        return <ellipse key={i} cx={x} cy={y} rx="5" ry="3" transform={`rotate(${i % 2 ? 24 : -20} ${x} ${y})`} />
      })}
    </g>
  </svg>
)

const BunBottom = () => (
  <svg viewBox="0 0 300 56" aria-hidden="true">
    <defs>
      <linearGradient id="g-bunb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E9C283" />
        <stop offset="1" stopColor="#B27134" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="48" rx="124" ry="6" fill="#000" opacity="0.35" />
    <path d="M28 12 L272 12 Q280 12 279 22 Q276 44 240 46 L60 46 Q24 44 21 22 Q20 12 28 12 Z" fill="url(#g-bunb)" />
    <path d="M30 14 L270 14" stroke="#F6E3B8" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
  </svg>
)

/* ── Registry ───────────────────────────────────────────────────────────── */

export const ART = {
  flatbread: { C: Flatbread, w: 1.0, order: 0, weight: 1.2, h: 78 },
  pitta: { C: Pitta, w: 0.94, order: 0, weight: 1.1, h: 78 },
  naan: { C: Naan, w: 1.0, order: 0, weight: 1.25, h: 82 },
  'bun-bottom': { C: BunBottom, w: 0.9, order: 0, weight: 1.0, h: 56 },

  doner: { C: Doner, w: 0.92, order: 10, weight: 1.7, h: 78 },
  chicken: { C: ChickenDoner, w: 0.92, order: 10, weight: 1.6, h: 78 },
  mixed: { C: MixedDoner, w: 0.92, order: 10, weight: 1.7, h: 78 },
  shish: { C: Shish, w: 0.94, order: 10, weight: 1.8, h: 78 },
  patty: { C: Patty, w: 0.88, order: 10, weight: 1.7, h: 70 },
  'patty-double': { C: PattyDouble, w: 0.88, order: 10, weight: 2.0, h: 96 },
  fillet: { C: Fillet, w: 0.9, order: 10, weight: 1.5, h: 72 },
  'halloumi-patty': { C: HalloumiPatty, w: 0.84, order: 10, weight: 1.4, h: 78 },

  halloumi: { C: Halloumi, w: 0.8, order: 15, weight: 1.0, h: 60 },
  cheese: { C: Cheese, w: 0.8, order: 16, weight: 0.7, h: 64 },
  bacon: { C: Bacon, w: 0.86, order: 18, weight: 0.8, h: 64 },

  lettuce: { C: Lettuce, w: 0.9, order: 20, weight: 0.55, h: 58 },
  tomato: { C: Tomato, w: 0.78, order: 22, weight: 0.8, h: 60 },
  onion: { C: Onion, w: 0.82, order: 24, weight: 0.55, h: 54 },
  cabbage: { C: Cabbage, w: 0.82, order: 26, weight: 0.55, h: 54 },
  jalapenos: { C: Jalapenos, w: 0.72, order: 28, weight: 0.6, h: 52 },
  chillies: { C: Chillies, w: 0.76, order: 30, weight: 0.6, h: 58 },

  'sauce-garlic': { C: SauceGarlic, w: 0.74, order: 40, weight: 0.35, h: 42 },
  'sauce-chilli': { C: SauceChilli, w: 0.74, order: 41, weight: 0.35, h: 42 },
  'sauce-mint': { C: SauceMint, w: 0.74, order: 42, weight: 0.35, h: 42 },
  'sauce-bbq': { C: SauceBBQ, w: 0.74, order: 43, weight: 0.35, h: 42 },
  'sauce-burger': { C: SauceBurger, w: 0.74, order: 44, weight: 0.35, h: 42 },

  'bun-top': { C: BunTop, w: 0.9, order: 50, weight: 1.3, h: 84 },
  'bun-top-seeded': { C: () => <BunTop seeds={13} />, w: 0.9, order: 50, weight: 1.3, h: 84 },
}
