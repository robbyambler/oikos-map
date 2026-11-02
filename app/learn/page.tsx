import type { Metadata } from "next";
import Link from "next/link";
import type { Person } from "@/lib/people";
import MapView from "@/components/MapView";
import Shape, { LetterDot, Legend } from "@/components/Shape";
import AppBar from "@/components/AppBar";
import { ArrowLeftIcon, ArrowRightIcon, LockIcon } from "@/components/Icons";

// A short, static walkthrough for people new to the idea of an oikos map.
// It never reads or writes the visitor's saved map; the example below uses made-up people.

export const metadata: Metadata = {
  title: "How it works · Oikos Map",
  description: "Five short steps to mapping the people God has put around you.",
};

const EXAMPLE: Person[] = [
  { id: "ex-you", name: "Jamie", kind: "nonbeliever", parentId: null },
  { id: "ex-sam", name: "Sam", kind: "nonbeliever", parentId: "ex-you" },
  { id: "ex-maria", name: "Maria", kind: "believer", parentId: "ex-you" },
  { id: "ex-dan", name: "Pastor Dan", kind: "believer", parentId: "ex-you" },
  { id: "ex-jo", name: "Aunt Jo", kind: "nonbeliever", parentId: "ex-you" },
  { id: "ex-lee", name: "Lee", kind: "nonbeliever", parentId: "ex-sam" },
  { id: "ex-priya", name: "Priya", kind: "nonbeliever", parentId: "ex-maria" },
  { id: "ex-tom", name: "Tom", kind: "believer", parentId: "ex-maria" },
  { id: "ex-ben", name: "Ben", kind: "nonbeliever", parentId: "ex-jo" },
];

const EXAMPLE_DESCRIPTION =
  "An example map for someone named Jamie. Jamie is the filled circle in the middle. Around Jamie: Sam and Aunt Jo, drawn as circles because they don't yet follow Jesus, and Maria and Pastor Dan, drawn as squares because they do. Beyond them are their people: Lee, connected to Sam; Priya and Tom, connected to Maria; and Ben, connected to Aunt Jo.";

const BLESS = [
  { letter: "B", word: "Begin with prayer", line: "Ask God to open their heart, and your eyes." },
  { letter: "L", word: "Listen", line: "Ask good questions and really hear their story." },
  { letter: "E", word: "Eat", line: "Share a meal or a coffee. Tables make friends." },
  { letter: "S", word: "Serve", line: "Look for a simple, practical way to help." },
  { letter: "S", word: "Share", line: "When the moment is right, tell them what Jesus has done for you.", link: true },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 pb-12 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-6">
      {/* The thin line that joins one step to the next */}
      <span aria-hidden="true" className="absolute bottom-0 left-5 top-12 w-px bg-line sm:left-6 sm:top-14 group-last:hidden" />
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-on-accent sm:size-12 sm:text-xl"
      >
        {n}
      </span>
      <div className="min-w-0 pt-1.5 sm:pt-2.5">
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">
          <span className="sr-only">Step {n}: </span>
          {title}
        </h2>
        <div className="mt-3 space-y-4 text-lg leading-relaxed">{children}</div>
      </div>
    </li>
  );
}

export default function LearnPage() {
  return (
    <>
    <AppBar />
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <nav aria-label="Page" className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeftIcon size={18} />
          Back to my map
        </Link>
        <Link href="/" className="btn btn-secondary btn-sm">
          Start my map
        </Link>
      </nav>

      <header className="mt-6">
        <h1 className="font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-6xl">
          How an oikos map works
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          Five short steps. No experience needed, and there are no wrong answers.
        </p>
      </header>

      <figure className="card mt-10 overflow-hidden">
        <div className="bg-[var(--map-bg)] p-4 sm:p-6">
          <div className="mx-auto max-w-md">
            <MapView people={EXAMPLE} fit title={EXAMPLE_DESCRIPTION} />
          </div>
        </div>
        <figcaption className="space-y-3 border-t border-line bg-sunken px-4 py-4 sm:px-6">
          <p className="text-sm text-ink-muted">
            An example map for Jamie, with made-up people. Yours will have your name in the middle.
          </p>
          <Legend />
        </figcaption>
      </figure>

      <ol className="mt-14">
        <Step n={1} title="What's an oikos?">
          <p>
            <em>Oikos</em> is the Greek word for household: the family, friends, and neighbors God has already put in
            your everyday life.
          </p>
          <blockquote className="rounded-xl bg-sunken px-5 py-4 font-display text-xl font-semibold leading-snug tracking-tight">
            &ldquo;Believe in the Lord Jesus, and you will be saved, you and your household.&rdquo;
            <span className="mt-2 block font-sans text-base font-normal tracking-normal text-ink-muted">Acts 16:31 (ESV)</span>
          </blockquote>
          <p>The good news has always traveled through ordinary relationships. Yours included.</p>
          <p>
            Here&apos;s the part that changes everything: <strong>everyone you know has an oikos of their own.</strong>{" "}
            Each person on your map is connected to people you may never meet, and each of them can be reached
            through that person in a way only they can.
          </p>
        </Step>

        <Step n={2} title="Start with you">
          <p className="flex items-start gap-3">
            <span className="mt-1">
              <Shape kind="nonbeliever" color="var(--map-root)" size={22} filled />
            </span>
            <span>
              You&apos;re the circle in the middle. Just type your name. Everything else on the map grows out from
              you.
            </span>
          </p>
        </Step>

        <Step n={3} title="Add the people in your life">
          <p>For each person, pick a shape:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="mt-1">
                <Shape kind="believer" color="var(--branch-2)" size={22} />
              </span>
              <span>
                <strong>Square:</strong> someone who already follows Jesus. Equip them, and they can start reaching their own oikos right away.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1">
                <Shape kind="nonbeliever" color="var(--branch-1)" size={22} />
              </span>
              <span>
                <strong>Circle:</strong> someone who doesn&apos;t yet follow Jesus.
              </span>
            </li>
          </ul>
          <div className="callout px-5 py-4">
            <p className="font-semibold">Not sure who to add? Think through:</p>
            <p>
              <strong>F</strong>riends, <strong>R</strong>elatives, <strong>A</strong>cquaintances,{" "}
              <strong>N</strong>eighbors, <strong>C</strong>oworkers or classmates.
            </p>
          </div>
        </Step>

        <Step n={4} title="Add the people connected to them">
          <p>
            Your friend has a sister. Your coworker has a roommate. Every person on your map has an oikos of their
            own, and they are the one best placed to reach it. Tap anyone to add the people in <em>their</em> life.
            Go as far out as you like, or stop at one ring. Both are fine.
          </p>
        </Step>

        <Step n={5} title="Now what?">
          <p>Pray for the people on your map every day. Then try a few simple steps with one or two of the circles:</p>
          <ul className="space-y-3">
            {BLESS.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <LetterDot letter={b.letter} />
                <span className="pt-0.5">
                  <strong>{b.word}.</strong> {b.line}
                  {b.link && (
                    <>
                      {" "}
                      <Link href="/share" className="link no-print">
                        See a simple way to share
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <strong>Don&apos;t forget the squares.</strong> Believers on your map don&apos;t have to wait. Equip them
            in three steps: share your map with them, teach them to build their own, and begin reaching it together.
          </p>
          <p>No pressure, no script. Just love the people God already gave you.</p>
        </Step>
      </ol>

      <section className="mt-16 rounded-2xl bg-sunken px-5 py-8 text-center sm:px-10">
        <p className="mx-auto flex max-w-xl items-start justify-center gap-2 text-left leading-relaxed text-ink-muted sm:text-center">
          <LockIcon size={18} className="mt-1 shrink-0 text-accent-ink" />
          <span>Your map stays on your device. Nothing is sent anywhere. You can print it, or save a copy as a file.</span>
        </p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">
          Start my map
          <ArrowRightIcon size={20} />
        </Link>
      </section>
      <p className="mt-8 text-center text-sm leading-relaxed text-ink-muted">
          Scripture quotations marked ESV are from the ESV&reg; Bible (The Holy Bible, English Standard Version&reg;),
          &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights
          reserved.
      </p>
    </main>
    </>
  );
}
