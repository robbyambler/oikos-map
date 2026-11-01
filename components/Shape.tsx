import { Kind, BRANCH_COLORS } from "@/lib/people";
import { sketchCircle, sketchSquare } from "@/lib/sketch";

// The hand-drawn square or circle, drawn inside an SVG. Used only on the map.
// Colors are set with style (not attributes) so CSS variables from the theme work.
export function SketchShape({
  kind,
  size,
  color,
  fill = "var(--map-node)",
  strokeWidth = 3,
  seed,
}: {
  kind: Kind;
  size: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
  seed: string;
}) {
  const shape = kind === "believer" ? sketchSquare(size * 0.92, seed) : sketchCircle(size / 2, seed);
  return (
    <>
      <path d={shape.fill} style={{ fill }} />
      <path
        d={shape.stroke}
        fill="none"
        style={{ stroke: color }}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

// A small, clean square or circle used in the legend, list, forms, and pages.
export default function Shape({
  kind,
  color = "currentColor",
  size = 16,
  filled = false,
}: {
  kind: Kind;
  color?: string;
  size?: number;
  filled?: boolean;
}) {
  const style = { stroke: color, fill: filled ? color : "var(--surface)" };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="inline-block shrink-0">
      {kind === "believer" ? (
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" strokeWidth="2.5" style={style} />
      ) : (
        <circle cx="12" cy="12" r="8.75" strokeWidth="2.5" style={style} />
      )}
    </svg>
  );
}

// A round badge with a letter or number in it (BLESS steps, numbered steps).
export function LetterDot({ letter, color = "var(--accent)" }: { letter: string; color?: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[0.95rem] font-bold leading-none"
      style={{ background: `color-mix(in srgb, ${color} 14%, var(--surface))`, color }}
    >
      {letter}
    </span>
  );
}

export function Legend() {
  return (
    <ul className="legend flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
      <li className="flex items-center gap-2">
        <Shape kind="believer" color="var(--ink)" size={18} />
        Square: follows Jesus (someone to equip)
      </li>
      <li className="flex items-center gap-2">
        <Shape kind="nonbeliever" color="var(--ink)" size={18} />
        Circle: doesn&apos;t yet follow Jesus
      </li>
      <li className="flex items-center gap-2">
        <span className="flex gap-1" aria-hidden="true">
          {BRANCH_COLORS.slice(0, 4).map((c) => (
            <span key={c} className="h-3.5 w-1.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
        Each color is one branch of your map
      </li>
    </ul>
  );
}
