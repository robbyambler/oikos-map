"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BRANCH_COLORS,
  Kind,
  MAX_DEPTH,
  MAX_PEOPLE,
  Person,
  ROOT_COLOR,
  branchColor,
  childrenOf,
  depthOf,
  describe,
  descendantsOf,
  findRoot,
  makeId,
  shapeOf,
} from "@/lib/people";
import { loadPeople, savePeople } from "@/lib/storage";
import { downloadBackup, readBackup } from "@/lib/backup";
import MapView from "./MapView";
import ListView from "./ListView";
import PersonForm from "./PersonForm";
import BlessCard from "./BlessCard";
import EquipCard from "./EquipCard";
import ShareApp from "./ShareApp";
import AppBar from "./AppBar";
import Shape, { Legend } from "./Shape";
import {
  DownloadIcon,
  ExpandIcon,
  ListIcon,
  LockIcon,
  MapIcon,
  PencilIcon,
  PlusIcon,
  PrintIcon,
  ShrinkIcon,
  TrashIcon,
  UploadIcon,
} from "./Icons";

type Mode = "view" | "add" | "edit";

function FrancHint({ name }: { name: string }) {
  return (
    <div className="callout px-4 py-3 text-[0.95rem] leading-relaxed">
      <p className="font-semibold">Stuck? Think through {name}&apos;s world:</p>
      <p>
        <strong>F</strong>riends, <strong>R</strong>elatives, <strong>A</strong>cquaintances,{" "}
        <strong>N</strong>eighbors, <strong>C</strong>oworkers or classmates.
      </p>
    </div>
  );
}

export default function OikosApp() {
  // This component only runs in the browser (see app/page.tsx), so it can read
  // saved data right away.
  const [initial] = useState(loadPeople);
  const [people, setPeople] = useState<Person[]>(initial.people);
  const [storageOk, setStorageOk] = useState(initial.ok);
  const [selectedId, setSelectedId] = useState<string | null>(findRoot(initial.people)?.id ?? null);
  const [mode, setMode] = useState<Mode>("view");
  const [view, setView] = useState<"map" | "list">("map");
  const [fit, setFit] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Saving can fail (e.g. private browsing). We only flag it once.
    if (!savePeople(people)) setStorageOk(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [people]);

  const root = findRoot(people);
  const selected = people.find((p) => p.id === selectedId) ?? root;

  function select(id: string) {
    setSelectedId(id);
    setMode("view");
  }

  // You always go in the middle as a circle, so there's nothing to ask but your name.
  function addRoot(name: string) {
    const me: Person = { id: makeId(), name, kind: "nonbeliever", parentId: null };
    setPeople([me]);
    setSelectedId(me.id);
    setMode("add");
  }

  // The map stays quick to draw only up to a point, so adding has limits.
  // Returns a friendly reason when no one more can be added here, or "" if they can.
  function addLimit(): string {
    if (people.length >= MAX_PEOPLE) {
      return `Your map has ${MAX_PEOPLE} people, which is as many as Oikos Map can hold. That's a lot of people to pray for!`;
    }
    if (selected && depthOf(people, selected) >= MAX_DEPTH) {
      return `${selected.name} is ${MAX_DEPTH} steps out from you, which is as far as the map can go. Try adding people closer in.`;
    }
    return "";
  }

  function addPerson(name: string, kind: Kind) {
    if (!selected || addLimit()) return;
    setPeople([...people, { id: makeId(), name, kind, parentId: selected.id }]);
    setAnnouncement(`${name} added, connected to ${selected.name}.`);
    // Stay in "add" mode so it's quick to add several people in a row.
  }

  function editPerson(name: string, kind: Kind) {
    if (!selected) return;
    // You (the center) keep whatever kind you had; only your name changes.
    const isMe = selected.parentId === null;
    setPeople(people.map((p) => (p.id === selected.id ? { ...p, name, kind: isMe ? p.kind : kind } : p)));
    setAnnouncement(`Saved changes to ${name}.`);
    setMode("view");
  }

  function removePerson() {
    if (!selected || selected.parentId === null) return;
    const branch = descendantsOf(people, selected.id);
    const message =
      branch.length > 0
        ? `Remove ${selected.name} and the ${branch.length} ${branch.length === 1 ? "person" : "people"} connected to them?`
        : `Remove ${selected.name} from your map?`;
    if (!window.confirm(message)) return;
    const gone = new Set([selected.id, ...branch.map((p) => p.id)]);
    setPeople(people.filter((p) => !gone.has(p.id)));
    setAnnouncement(`Removed ${selected.name}.`);
    setSelectedId(selected.parentId);
    setMode("view");
  }

  function startOver() {
    if (!window.confirm("Clear your whole map and start over? This can't be undone.")) return;
    setPeople([]);
    setSelectedId(null);
    setMode("view");
  }

  // ---------- Save a copy / open a saved copy ----------
  function saveCopy() {
    setFileError("");
    downloadBackup(people);
    setAnnouncement("Saved a copy of your map to this device.");
  }

  function chooseFile() {
    setFileError("");
    fileInput.current?.click();
  }

  async function openFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    // Clear the picker so choosing the same file again still works.
    input.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      setFileError("That file is too big to be an Oikos Map. Try another file.");
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setFileError("We couldn't read that file. Try again, or choose another file.");
      return;
    }
    const result = readBackup(text);
    if (!result.ok) {
      setFileError(result.message);
      return;
    }
    if (
      people.length > 0 &&
      !window.confirm("Replace the map on this device with the saved copy? Your current map will be gone.")
    ) {
      return;
    }
    const newRoot = findRoot(result.people);
    setPeople(result.people);
    setSelectedId(newRoot?.id ?? null);
    setMode("view");
    setFileError("");
    setAnnouncement(`Opened your saved map with ${result.people.length} ${result.people.length === 1 ? "person" : "people"}.`);
  }

  const filePicker = (
    <input
      ref={fileInput}
      type="file"
      accept=".json,application/json"
      onChange={openFile}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  const fileErrorNote = fileError && (
    <p role="alert" className="notice px-3.5 py-2.5 text-sm">
      {fileError}
    </p>
  );

  const privacyNote = (
    <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
      <LockIcon size={16} className="mt-0.5 shrink-0 text-accent-ink" />
      <span>
        Your map is saved only in this browser, on this device. Nothing is sent anywhere, and no one else can see it.
      </span>
    </p>
  );

  const storageWarning = !storageOk && (
    <p role="status" className="notice px-3.5 py-2.5 text-sm">
      This browser isn&apos;t letting us save, so your map will disappear when you close this tab. Print it before you
      go if you&apos;d like to keep it.
    </p>
  );

  // ---------- Welcome: no one on the map yet ----------
  if (!root) {
    return (
      <>
        <AppBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:pt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
            <div className="max-w-[38rem]">
              <h1 className="font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                Map the people God has put around you.
              </h1>
              <p className="mt-6 text-lg leading-relaxed">
                <em>Oikos</em> is the Greek word for household: the family, friends, and neighbors in your everyday
                life. When Paul told a jailer, &ldquo;Believe in the Lord Jesus, and you will be saved, you and your
                household&rdquo; (Acts 16:31, ESV), the good news was meant to travel through his whole oikos.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                And everyone you know has an oikos of their own, one that only they can reach.
              </p>

              <div className="no-print mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link href="/learn" className="btn btn-secondary">
                  How does this work?
                </Link>
                <Link href="/share" className="link">
                  What do I say? See a simple way to share
                </Link>
              </div>
            </div>

            <div className="card overflow-hidden">
              <WelcomeIllustration />
              <div className="p-5 sm:p-7">
                <p className="mb-5 leading-relaxed text-ink-muted">
                  You go in the middle. Then you&apos;ll add the people in your life, and the people in theirs. It
                  takes a few minutes.
                </p>
                <PersonForm
                  heading="Start with you"
                  submitLabel="Put me on the map"
                  nameLabel="Your name"
                  askKind={false}
                  onSubmit={addRoot}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            <div className="space-y-3">
              {privacyNote}
              {storageWarning}
              <p className="text-sm text-ink-muted">
                Already saved a copy of your map?{" "}
                <button type="button" onClick={chooseFile} className="link">
                  Open a saved copy
                </button>
              </p>
              {fileErrorNote}
              {filePicker}
            </div>
            <div className="sm:justify-self-end">
              <p className="mb-2 text-sm text-ink-muted">Know someone who&apos;d use this?</p>
              <ShareApp small />
            </div>
          </div>
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </main>
      </>
    );
  }

  // ---------- The map builder ----------
  const selectedColor = selected ? branchColor(people, selected) : ROOT_COLOR;
  const isRoot = selected?.parentId === null;
  const others = people.length - 1;
  const connected = selected ? childrenOf(people, selected.id).length : 0;
  const limitNote = addLimit();

  return (
    <>
      <div className="no-print flex min-h-full flex-col">
        <AppBar />
        <div className="mx-auto w-full max-w-6xl px-4 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Your oikos map</h1>
              <p className="mt-1 text-ink-muted">
                {others === 0
                  ? "Just you so far. Let's add some people."
                  : `You and ${others} ${others === 1 ? "person" : "people"} God has placed around you.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Choose a view" className="segmented">
                {(["map", "list"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
                    {v === "map" ? <MapIcon size={18} /> : <ListIcon size={18} />}
                    {v === "map" ? "Map" : "List"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => window.print()} className="btn btn-secondary">
                <PrintIcon size={18} />
                Print map
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 border-y border-line py-1.5">
            <button type="button" onClick={saveCopy} className="btn btn-ghost btn-sm">
              <DownloadIcon size={18} />
              Save a copy
            </button>
            <button type="button" onClick={chooseFile} className="btn btn-ghost btn-sm">
              <UploadIcon size={18} />
              Open a saved copy
            </button>
            {filePicker}
            <p className="px-2 text-sm text-ink-muted">The file stays on your device.</p>
            <div className="sm:ml-auto">
              <ShareApp small />
            </div>
          </div>
          {fileError && <div className="mt-3">{fileErrorNote}</div>}
        </div>

        <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label={view === "map" ? "Map" : "List"} className="min-w-0">
            {view === "map" ? (
              <>
                <div className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-1.5 pl-4 pr-1.5">
                    <p className="text-sm text-ink-muted">Tap or tab to anyone on the map to see their details.</p>
                    <button type="button" onClick={() => setFit(!fit)} className="btn btn-ghost btn-sm">
                      {fit ? <ExpandIcon size={18} /> : <ShrinkIcon size={18} />}
                      {fit ? "Show actual size" : "Fit to screen"}
                    </button>
                  </div>
                  <div className="overflow-auto bg-[var(--map-bg)] p-2" style={{ maxHeight: fit ? undefined : "75vh" }}>
                    <MapView people={people} selectedId={selected?.id} onSelect={select} fit={fit} />
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <Legend />
                </div>
              </>
            ) : (
              <div className="card p-2 sm:p-3">
                <ListView people={people} selectedId={selected?.id ?? null} onSelect={select} />
              </div>
            )}
          </section>

          {selected && (
            <aside aria-label="Selected person" className="min-w-0 space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-3.5">
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `color-mix(in srgb, ${selectedColor} 13%, var(--surface))` }}
                  >
                    <Shape kind={shapeOf(selected)} color={selectedColor} size={26} filled={isRoot} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-2xl font-bold leading-tight tracking-tight">
                      {selected.name}
                      {isRoot && <span className="font-normal text-ink-muted"> (you)</span>}
                    </h2>
                    <p className="text-sm text-ink-muted">
                      {describe(selected)}
                      {connected > 0 && ` · ${connected} connected`}
                    </p>
                  </div>
                </div>

                {mode === "view" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setMode("add")} className="btn btn-primary w-full">
                      <PlusIcon size={18} />
                      Add someone connected to {isRoot ? "you" : selected.name.split(" ")[0]}
                    </button>
                    <button type="button" onClick={() => setMode("edit")} className="btn btn-secondary flex-1">
                      <PencilIcon size={18} />
                      Edit
                    </button>
                    {!isRoot && (
                      <button type="button" onClick={removePerson} className="btn btn-danger flex-1">
                        <TrashIcon size={18} />
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {mode === "add" && limitNote && (
                  <div className="mt-5 space-y-3 border-t border-line pt-5">
                    <p role="status" className="notice px-3.5 py-2.5 text-sm">
                      {limitNote}
                    </p>
                    <button type="button" onClick={() => setMode("view")} className="btn btn-secondary">
                      Done
                    </button>
                  </div>
                )}

                {mode === "add" && !limitNote && (
                  <div className="mt-5 border-t border-line pt-5">
                    <PersonForm
                      key={"add-" + selected.id}
                      heading={isRoot ? "Who's in your life?" : `Who's in ${selected.name.split(" ")[0]}'s life?`}
                      submitLabel="Add to map"
                      hint={<FrancHint name={isRoot ? "your" : selected.name.split(" ")[0]} />}
                      autoFocus
                      onSubmit={addPerson}
                      onCancel={() => setMode("view")}
                    />
                    <p className="mt-3 text-sm text-ink-muted">
                      Add as many as you like. Press Cancel when you&apos;re done.
                    </p>
                  </div>
                )}

                {mode === "edit" && (
                  <div className="mt-5 border-t border-line pt-5">
                    <PersonForm
                      key={"edit-" + selected.id}
                      heading={`Edit ${selected.name}`}
                      submitLabel="Save changes"
                      initialName={selected.name}
                      initialKind={selected.kind}
                      askKind={!isRoot}
                      autoFocus
                      onSubmit={editPerson}
                      onCancel={() => setMode("view")}
                    />
                  </div>
                )}
              </div>

              {!isRoot && mode === "view" &&
                (selected.kind === "believer" ? (
                  <EquipCard person={selected} color={selectedColor} />
                ) : (
                  <BlessCard person={selected} color={selectedColor} />
                ))}
              {isRoot && mode === "view" && others === 0 && (
                <p className="px-1 leading-relaxed text-ink-muted">
                  Start with the people closest to you. Later you can add the people in <em>their</em> lives too.
                </p>
              )}
            </aside>
          )}
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-10">
          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-line pt-5">
            <div className="max-w-xl space-y-2">
              {privacyNote}
              {storageWarning}
            </div>
            <button type="button" onClick={startOver} className="btn btn-ghost btn-sm -mr-2 text-danger">
              Clear map and start over
            </button>
          </div>
        </footer>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>

      {/* Only shown when printing */}
      <div className="print-only">
        <h1 className="font-display text-3xl font-bold">{root.name}&apos;s oikos map</h1>
        <div className="print-map">
          <MapView people={people} fit title={`${root.name}'s oikos map`} />
        </div>
        <Legend />
      </div>
    </>
  );
}

// A clean drawing for the welcome screen: you in the middle, your people around
// you, and their people beyond. (The real map is hand-drawn; this is just a sign.)
function WelcomeIllustration() {
  const [teal, plum, ochre, blue] = BRANCH_COLORS;
  const ring = [
    { x: 92, y: 62, c: teal, k: "nonbeliever" },
    { x: 238, y: 52, c: plum, k: "believer" },
    { x: 262, y: 138, c: ochre, k: "nonbeliever" },
    { x: 84, y: 146, c: blue, k: "believer" },
  ] as const;
  const outer = [
    { x: 38, y: 34, from: 0, k: "believer" },
    { x: 124, y: 22, from: 0, k: "nonbeliever" },
    { x: 290, y: 24, from: 1, k: "nonbeliever" },
    { x: 306, y: 92, from: 1, k: "nonbeliever" },
    { x: 214, y: 172, from: 2, k: "believer" },
    { x: 30, y: 118, from: 3, k: "nonbeliever" },
    { x: 44, y: 178, from: 3, k: "nonbeliever" },
  ] as const;
  const cx = 165;
  const cy = 98;

  const node = (x: number, y: number, k: Kind, color: string, r: number) =>
    k === "believer" ? (
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.3} strokeWidth="2.25" style={{ stroke: color, fill: "var(--surface)" }} />
    ) : (
      <circle cx={x} cy={y} r={r} strokeWidth="2.25" style={{ stroke: color, fill: "var(--surface)" }} />
    );

  return (
    <div className="border-b border-line bg-sunken">
      <svg viewBox="0 0 340 200" aria-hidden="true" className="mx-auto block h-auto w-full max-w-md">
        <g strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          {ring.map((p, i) => (
            <line key={"r" + i} x1={cx} y1={cy} x2={p.x} y2={p.y} style={{ stroke: p.c }} />
          ))}
          {outer.map((p, i) => (
            <line key={"o" + i} x1={ring[p.from].x} y1={ring[p.from].y} x2={p.x} y2={p.y} style={{ stroke: ring[p.from].c }} />
          ))}
        </g>
        {outer.map((p, i) => (
          <g key={"on" + i}>{node(p.x, p.y, p.k, ring[p.from].c, 7)}</g>
        ))}
        {ring.map((p, i) => (
          <g key={"rn" + i}>{node(p.x, p.y, p.k, p.c, 11)}</g>
        ))}
        <circle cx={cx} cy={cy} r="24" style={{ fill: "var(--accent-soft)" }} />
        <circle cx={cx} cy={cy} r="15" style={{ fill: "var(--accent)" }} />
        <text
          x={cx}
          y={cy + 4.5}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          className="font-sans"
          style={{ fill: "var(--on-accent)" }}
        >
          You
        </text>
      </svg>
    </div>
  );
}
