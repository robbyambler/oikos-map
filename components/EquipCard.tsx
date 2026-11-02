import Link from "next/link";
import { Person } from "@/lib/people";
import { LetterDot } from "./Shape";

const STEPS = [
  {
    n: "1",
    word: "Share your map",
    text: (n: string) =>
      `Sit down with ${n} and walk through your oikos map together: the people you're praying for, and why.`,
  },
  {
    n: "2",
    word: "Teach them to build their own",
    text: (n: string) => `Help ${n} start a map of their own people. It only takes a few minutes.`,
  },
  {
    n: "3",
    word: "Begin reaching it",
    text: () => `Pray for their people together. Then encourage them to take the first small steps with one or two.`,
  },
];

// A short "now what" for a believer on the map: equip them to reach their own oikos.
export default function EquipCard({ person, color }: { person: Person; color: string }) {
  // Use the whole name so labels like "Mom's friend" read correctly.
  const first = person.name.trim();
  return (
    <section aria-labelledby="equip-heading" className="card p-5">
      <h3 id="equip-heading" className="font-display text-xl font-bold tracking-tight">
        Equip {first} to reach their oikos
      </h3>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-muted">
        {first} already follows Jesus, so they don&apos;t have to wait. Help them reach the people only they can reach.
      </p>
      <ol className="mt-4 space-y-3">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <LetterDot letter={step.n} color={color} />
            <span className="pt-1 text-[0.95rem] leading-snug">
              <strong>{step.word}.</strong> {step.text(first)}
              {i === 1 && (
                <>
                  {" "}
                  <Link href="/learn" className="link no-print">
                    How it works
                  </Link>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
