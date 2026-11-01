// The whole map is one flat list of people. Each person points to the person
// they are connected to (parentId). The one person with parentId = null is "you".

export type Kind = "believer" | "nonbeliever";

export type Person = {
  id: string;
  name: string;
  kind: Kind;
  parentId: string | null;
};

// Branch colors: each person in your first ring gets one, and everyone
// connected through them shares it. The real colors live in app/globals.css
// (--branch-1 to --branch-8) so each one has a light-theme and a dark-theme
// shade. Printing always uses the light, ink-friendly shades.
export const BRANCH_COLORS = [
  "var(--branch-1)", // teal
  "var(--branch-2)", // plum
  "var(--branch-3)", // ochre
  "var(--branch-4)", // blue
  "var(--branch-5)", // brick
  "var(--branch-6)", // green
  "var(--branch-7)", // violet
  "var(--branch-8)", // brown
];

export const ROOT_COLOR = "var(--map-root)";

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function findRoot(people: Person[]): Person | undefined {
  return people.find((p) => p.parentId === null);
}

export function childrenOf(people: Person[], id: string): Person[] {
  return people.filter((p) => p.parentId === id);
}

// Everyone connected below this person (not including them).
export function descendantsOf(people: Person[], id: string): Person[] {
  const result: Person[] = [];
  for (const child of childrenOf(people, id)) {
    result.push(child, ...descendantsOf(people, child.id));
  }
  return result;
}

export function depthOf(people: Person[], person: Person): number {
  let depth = 0;
  let current: Person | undefined = person;
  while (current && current.parentId) {
    depth++;
    current = people.find((p) => p.id === current!.parentId);
  }
  return depth;
}

// The color of the branch a person belongs to.
export function branchColor(people: Person[], person: Person): string {
  if (person.parentId === null) return ROOT_COLOR;
  // Walk up until we reach someone in the first ring.
  let current = person;
  while (current.parentId) {
    const parent = people.find((p) => p.id === current.parentId);
    if (!parent || parent.parentId === null) break;
    current = parent;
  }
  const root = findRoot(people);
  const firstRing = root ? childrenOf(people, root.id) : [];
  const index = Math.max(0, firstRing.findIndex((p) => p.id === current.id));
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

export function kindLabel(kind: Kind): string {
  return kind === "believer" ? "Follows Jesus" : "Doesn't yet follow Jesus";
}

// You (the center of the map) are always drawn as a circle. We never ask you
// to label yourself, so older saved maps with any kind still draw the same way.
export function shapeOf(person: Person): Kind {
  return person.parentId === null ? "nonbeliever" : person.kind;
}

// A short description for labels and screen readers.
export function describe(person: Person): string {
  return person.parentId === null ? "You, at the center of your map" : kindLabel(person.kind);
}
