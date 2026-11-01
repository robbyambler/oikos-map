"use client";

import { Person, branchColor, childrenOf, describe, findRoot, shapeOf } from "@/lib/people";
import Shape from "./Shape";

type Props = {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// The same map as a nested list. Easier on small screens and for screen readers.
export default function ListView({ people, selectedId, onSelect }: Props) {
  const root = findRoot(people);
  if (!root) return null;

  function renderPerson(person: Person, isRoot: boolean) {
    const kids = childrenOf(people, person.id);
    const color = branchColor(people, person);
    const selected = person.id === selectedId;
    return (
      <li key={person.id}>
        <button
          type="button"
          onClick={() => onSelect(person.id)}
          aria-pressed={selected}
          className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-ink transition-colors ${
            selected ? "bg-accent-soft font-semibold" : "hover:bg-sunken"
          }`}
        >
          <Shape kind={shapeOf(person)} color={color} size={20} filled={isRoot} />
          <span className="min-w-0 flex-1 break-words">
            {person.name}
            {isRoot && <span className="font-normal text-ink-muted"> (you)</span>}
            {!isRoot && <span className="sr-only">, {describe(person)}</span>}
          </span>
          {kids.length > 0 && <span className="shrink-0 text-sm font-normal text-ink-muted">{kids.length} connected</span>}
        </button>
        {kids.length > 0 && (
          <ul className="branch-line ml-[21px] pl-3" style={{ color: isRoot ? "var(--line-strong)" : color }}>
            {kids.map((kid) => renderPerson(kid, false))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <ul aria-label="Your oikos as a list" className="space-y-0.5">
      {renderPerson(root, true)}
    </ul>
  );
}
