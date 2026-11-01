import type { Metadata } from "next";
import Link from "next/link";
import { LetterDot } from "@/components/Shape";
import AppBar from "@/components/AppBar";
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon } from "@/components/Icons";
import ThreeCircles from "@/components/ThreeCircles";
import {
  CIRCLES,
  CREDIT,
  INTRO,
  LET_GO,
  LINKS,
  PAGE,
  PRACTICE,
  STORY,
  TRANSLATION_NOTE,
  type Verse,
} from "@/lib/shareContent";

// A static page with one simple way to talk about Jesus. It never reads or
// writes the visitor's saved map. All the words come from lib/shareContent.ts;
// this file only lays them out.

export const metadata: Metadata = {
  title: `${PAGE.title} · Oikos Map`,
  description: PAGE.metaDescription,
};

function VerseQuote({ verse }: { verse: Verse }) {
  return (
    <blockquote className="rounded-xl bg-sunken px-5 py-4 text-base leading-relaxed">
      {verse.text}
      <span className="mt-1.5 block text-sm font-semibold text-ink-muted">{verse.ref}</span>
    </blockquote>
  );
}

function Section({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-14 break-inside-avoid border-t border-line pt-10">
      <h2 id={id} className="font-display text-3xl font-bold leading-tight tracking-tight">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed">{children}</div>
    </section>
  );
}

export default function SharePage() {
  return (
    <>
    <AppBar />
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <nav aria-label="Page" className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="btn btn-ghost btn-sm -ml-3">
          <ArrowLeftIcon size={18} />
          {LINKS.backToMap}
        </Link>
        <Link href="/learn" className="btn btn-secondary btn-sm">
          {LINKS.learn}
        </Link>
      </nav>

      <header className="mt-6">
        <h1 className="font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-6xl">{PAGE.title}</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">{PAGE.lead}</p>
      </header>

      <div className="mt-8 space-y-4 text-lg leading-relaxed">
        {INTRO.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <aside
        aria-labelledby="listen-first"
        className="callout mt-8 px-5 py-5 text-lg leading-relaxed sm:px-6"
      >
        <h2 id="listen-first" className="font-display text-xl font-bold tracking-tight">
          {INTRO.listenFirst.heading}
        </h2>
        <p className="mt-1">{INTRO.listenFirst.text}</p>
      </aside>

      <section aria-labelledby="circles" className="mt-16">
        <h2 id="circles" className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {CIRCLES.heading}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-ink-muted">{CIRCLES.intro}</p>

        <ol className="mt-8 divide-y divide-line border-y border-line">
          {CIRCLES.steps.map((s, i) => (
            <li key={i} className="break-inside-avoid py-8 sm:py-10">
              <h3 className="flex items-center gap-3 font-display text-2xl font-bold leading-tight tracking-tight">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-on-accent"
                >
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.heading}
                </span>
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-start">
                <figure className="mx-auto w-full max-w-sm rounded-xl border border-line bg-surface p-3 sm:order-last sm:max-w-none">
                  <ThreeCircles step={i + 1} description={s.diagramDescription} />
                </figure>
                <div className="space-y-4 text-lg leading-relaxed">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {s.verse && <VerseQuote verse={s.verse} />}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Section id="story" heading={STORY.heading}>
        <p>{STORY.intro}</p>
        <ol className="space-y-3">
          {STORY.parts.map((part, i) => (
            <li key={i} className="flex items-start gap-3">
              <LetterDot letter={String(i + 1)} />
              <span className="pt-0.5">
                <strong>{part.label}.</strong> {part.prompt}
              </span>
            </li>
          ))}
        </ol>
        <p className="callout px-5 py-4">{STORY.note}</p>
      </Section>

      <Section id="practice" heading={PRACTICE.heading}>
        {PRACTICE.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section id="let-go" heading={LET_GO.heading}>
        {LET_GO.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <section aria-labelledby="credit" className="mt-14 space-y-3 rounded-2xl bg-sunken px-5 py-6 leading-relaxed text-ink-muted sm:px-7">
        <h2 id="credit" className="font-display text-xl font-bold tracking-tight text-ink">
          {CREDIT.heading}
        </h2>
        {CREDIT.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          <a
            href={CREDIT.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex items-center gap-1"
          >
            {CREDIT.learnMoreText}
            <ExternalIcon size={16} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="text-sm">{TRANSLATION_NOTE}</p>
      </section>

      <div className="no-print mt-12 flex flex-col items-center gap-5 text-center">
        <Link href="/" className="btn btn-primary btn-lg">
          My map
          <ArrowRightIcon size={20} />
        </Link>
        <Link href="/learn" className="link">
          {LINKS.learn}
        </Link>
      </div>
    </main>
    </>
  );
}
