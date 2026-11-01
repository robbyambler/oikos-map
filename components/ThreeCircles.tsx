import { DIAGRAM_LABELS as L } from "@/lib/shareContent";

// The "three circles" picture on the /share page, drawn as a clean diagram.
// `step` (1 to 7) says how much of it has been drawn so far, so the same
// picture can grow one piece at a time down the page.
// Colors come from the theme (CSS variables), so it reads well in light and dark.

type Pt = [number, number];

const INK = "var(--ink)";
const SOFT = "var(--ink-muted)";
const MADE = "var(--branch-1)"; // teal
const BROKEN = "var(--branch-5)"; // brick
const JESUS = "var(--branch-4)"; // blue
const SENT = "var(--branch-2)"; // plum

const R = 50;
const D: Pt = [150, 100]; // made good
const B: Pt = [345, 100]; // broken
const J: Pt = [247, 228]; // Jesus

const r1 = (v: number) => Math.round(v * 10) / 10;

// A point on the edge of a circle, nudged out by `gap`, facing toward `to`.
function edge(center: Pt, to: Pt, gap = 6): Pt {
  const dx = to[0] - center[0];
  const dy = to[1] - center[1];
  const len = Math.hypot(dx, dy) || 1;
  return [center[0] + (dx / len) * (R + gap), center[1] + (dy / len) * (R + gap)];
}

// A smooth curved line from a to b with an arrowhead at b. `bow` bends it to one side.
function arrow(a: Pt, b: Pt, bow: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const c: Pt = [(a[0] + b[0]) / 2 + (-dy / len) * bow, (a[1] + b[1]) / 2 + (dx / len) * bow];
  const line = `M${r1(a[0])} ${r1(a[1])} Q${r1(c[0])} ${r1(c[1])} ${r1(b[0])} ${r1(b[1])}`;
  return { line, head: arrowHead(c, b) };
}

// A small solid triangle at the tip, pointing the way the line was heading.
function arrowHead(from: Pt, tip: Pt) {
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const size = 9;
  const spread = 0.45;
  const p1: Pt = [tip[0] - size * Math.cos(ang - spread), tip[1] - size * Math.sin(ang - spread)];
  const p2: Pt = [tip[0] - size * Math.cos(ang + spread), tip[1] - size * Math.sin(ang + spread)];
  return `M${r1(p1[0])} ${r1(p1[1])} L${r1(tip[0])} ${r1(tip[1])} L${r1(p2[0])} ${r1(p2[1])} Z`;
}

// A little loop that leaves the broken circle and curves right back into it.
function loop(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  const at = (ang: number, rad: number): Pt => [B[0] + rad * Math.cos(ang), B[1] + rad * Math.sin(ang)];
  const out = at(a - 0.2, R + 4);
  const far1 = at(a - 0.28, R + 36);
  const far2 = at(a + 0.32, R + 36);
  const back = at(a + 0.24, R + 5);
  const line = `M${r1(out[0])} ${r1(out[1])} C${r1(far1[0])} ${r1(far1[1])} ${r1(far2[0])} ${r1(far2[1])} ${r1(back[0])} ${r1(back[1])}`;
  return { line, head: arrowHead(far2, back) };
}

// A clean crack across the lower half of the broken circle.
const CRACK = `M${B[0] - 34} ${B[1] + 14} L${B[0] - 18} ${B[1] + 26} L${B[0] - 6} ${B[1] + 12} L${B[0] + 8} ${B[1] + 30} L${B[0] + 20} ${B[1] + 16} L${B[0] + 36} ${B[1] + 26}`;

function Circle({ at, color }: { at: Pt; color: string }) {
  return (
    <>
      <circle cx={at[0]} cy={at[1]} r={R} style={{ fill: `color-mix(in srgb, ${color} 8%, var(--surface))` }} />
      <circle cx={at[0]} cy={at[1]} r={R} fill="none" strokeWidth="2.5" style={{ stroke: color }} />
    </>
  );
}

function Line({ d, color, width = 2, opacity = 1 }: { d: string; color: string; width?: number; opacity?: number }) {
  return (
    <path
      d={d}
      fill="none"
      style={{ stroke: color }}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Arrow({ a, color }: { a: { line: string; head: string }; color: string }) {
  return (
    <>
      <Line d={a.line} color={color} />
      <path d={a.head} style={{ fill: color, stroke: color }} strokeWidth="1" strokeLinejoin="round" />
    </>
  );
}

// Words with a soft edge in the background color, so they stay readable over lines.
function Label({
  x,
  y,
  children,
  size = 14,
  anchor = "middle",
  color = SOFT,
  bold = false,
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  color?: string;
  bold?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={bold ? 700 : 600}
      style={{ fill: color, stroke: "var(--surface)" }}
      strokeWidth="4"
      strokeLinejoin="round"
      paintOrder="stroke"
      className="font-display"
    >
      {children}
    </text>
  );
}

// The arrows are worked out once; they never change.
const OWN_WAY = arrow(edge(D, B, 4), edge(B, D, 6), -22);
const LOOPS = [-48, -5, 38].map((deg) => loop(deg));
const TURN = arrow(edge(B, J), edge(J, B, 6), -14);
const MADE_NEW = arrow(edge(J, D), edge(D, J, 6), -14);
const PEOPLE: { at: Pt; kind: "believer" | "nonbeliever"; color: string }[] = [
  { at: [42, 34], kind: "nonbeliever", color: "var(--branch-3)" },
  { at: [26, 104], kind: "believer", color: SENT },
  { at: [48, 172], kind: "nonbeliever", color: MADE },
];
const SENT_ARROWS = PEOPLE.map((p, i) => {
  const from = edge(D, p.at, 4);
  const dx = p.at[0] - from[0];
  const dy = p.at[1] - from[1];
  const len = Math.hypot(dx, dy);
  const to: Pt = [p.at[0] - (dx / len) * 16, p.at[1] - (dy / len) * 16];
  return arrow(from, to, i === 1 ? 4 : -6);
});

export default function ThreeCircles({ step, description }: { step: number; description: string }) {
  return (
    <svg viewBox="0 0 440 320" role="img" className="h-auto w-full overflow-visible">
      <title>{description}</title>

      {/* 1. Made good */}
      <Circle at={D} color={MADE} />
      <Label x={D[0]} y={D[1] + 6} size={16} bold color={MADE}>
        {L.made}
      </Label>

      {/* 2. Our own way, broken, and the quick fixes that loop back */}
      {step >= 2 && (
        <g>
          <Arrow a={OWN_WAY} color={INK} />
          <Label x={(D[0] + B[0]) / 2} y={44}>
            {L.ownWay}
          </Label>
          <Circle at={B} color={BROKEN} />
          <Line d={CRACK} color={BROKEN} width={2} opacity={0.8} />
          <Label x={B[0]} y={B[1] - 8} size={16} bold color={BROKEN}>
            {L.broken}
          </Label>
          {LOOPS.map((l, i) => (
            <Arrow key={i} a={l} color={BROKEN} />
          ))}
          <Label x={396} y={20}>
            {L.quickFixes}
          </Label>
        </g>
      )}

      {/* 3. Jesus */}
      {step >= 3 && (
        <g>
          <Circle at={J} color={JESUS} />
          <Line d={`M${J[0]} ${J[1] - 32} V${J[1] + 14}`} color={JESUS} width={3} />
          <Line d={`M${J[0] - 15} ${J[1] - 18} H${J[0] + 15}`} color={JESUS} width={3} />
          <Label x={J[0]} y={J[1] + 36} size={16} bold color={JESUS}>
            {L.jesus}
          </Label>
        </g>
      )}

      {/* 4. Turn and trust */}
      {step >= 4 && (
        <g>
          <Arrow a={TURN} color={INK} />
          <Label x={316} y={198} anchor="start">
            {L.turn}
          </Label>
        </g>
      )}

      {/* 5. Made new */}
      {step >= 5 && (
        <g>
          <Arrow a={MADE_NEW} color={MADE} />
          <Label x={180} y={198} anchor="end">
            {L.madeNew}
          </Label>
        </g>
      )}

      {/* 6. Sent back out to your people */}
      {step >= 6 && (
        <g>
          {SENT_ARROWS.map((a, i) => (
            <Arrow key={i} a={a} color={SENT} />
          ))}
          {PEOPLE.map((p, i) =>
            p.kind === "believer" ? (
              <rect
                key={i}
                x={p.at[0] - 9}
                y={p.at[1] - 9}
                width="18"
                height="18"
                rx="3"
                strokeWidth="2.25"
                style={{ stroke: p.color, fill: "var(--surface)" }}
              />
            ) : (
              <circle key={i} cx={p.at[0]} cy={p.at[1]} r="9.5" strokeWidth="2.25" style={{ stroke: p.color, fill: "var(--surface)" }} />
            ),
          )}
          <Label x={6} y={212} anchor="start">
            {L.people}
          </Label>
        </g>
      )}

      {/* 7. Where are you? */}
      {step >= 7 && (
        <g>
          <Label x={96} y={50} size={24} bold color={INK}>
            ?
          </Label>
          <Label x={368} y={176} size={24} bold color={INK}>
            ?
          </Label>
          <Label x={312} y={276} size={24} bold color={INK}>
            ?
          </Label>
          <Label x={J[0]} y={314} size={18} bold color={INK}>
            {L.question}
          </Label>
        </g>
      )}
    </svg>
  );
}
