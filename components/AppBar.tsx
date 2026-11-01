import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

// The little mark next to the name: you in the middle, your people around you.
function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
      <g stroke="var(--line-strong)" strokeWidth="1.5">
        <path d="M14 14L5 7M14 14L23 8M14 14l1 10" />
      </g>
      <circle cx="5" cy="7" r="3.2" fill="var(--surface)" stroke="var(--branch-1)" strokeWidth="2" />
      <rect x="20" y="5" width="6" height="6" rx="1.2" fill="var(--surface)" stroke="var(--branch-2)" strokeWidth="2" />
      <circle cx="15" cy="24" r="3" fill="var(--surface)" stroke="var(--branch-3)" strokeWidth="2" />
      <circle cx="14" cy="14" r="5" fill="var(--accent)" />
    </svg>
  );
}

// The bar across the top of every page: name, a couple of links, and the theme switch.
export default function AppBar({ links = true }: { links?: boolean }) {
  return (
    <header className="no-print border-b border-line bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-0 px-4 py-1.5 sm:py-2">
        <Link
          href="/"
          className="-ml-1 inline-flex min-h-11 items-center gap-2.5 rounded-lg px-1 font-display text-lg font-bold tracking-tight"
        >
          <BrandMark />
          Oikos Map
        </Link>
        {/* On phones the links drop to their own row under the name; the theme switch stays top right. */}
        {links && (
          <nav aria-label="Help" className="order-last -ml-2.5 flex w-full items-center sm:order-none sm:ml-auto sm:w-auto">
              <Link href="/learn" className="btn btn-ghost btn-sm whitespace-nowrap px-2.5 text-ink-muted hover:text-ink sm:px-3.5">
                How it works
              </Link>
              <Link href="/share" className="btn btn-ghost btn-sm whitespace-nowrap px-2.5 text-ink-muted hover:text-ink sm:px-3.5">
                What to share
              </Link>
            </nav>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
