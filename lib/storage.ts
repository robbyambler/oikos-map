// Saves the map in this browser only (localStorage). Nothing is sent anywhere.
// Some browsers block storage (private windows, strict settings), so every
// read and write is wrapped in try/catch and the app keeps working without it.
//
// What's stored is checked with the same care as opening a saved file. If it
// can't be read, we never write over it: a copy is kept under CORRUPT_KEY and
// the visitor starts with an empty map.

import { Person } from "./people";
import { checkPeople } from "./backup";

export const KEY = "oikos-map-v1";
const CORRUPT_KEY = "oikos-map-v1-corrupt";
const VERSION = 1;

// "ok": loaded fine (or nothing saved yet).
// "blocked": this browser won't let us use storage at all.
// "unreadable": something was saved but we couldn't read it; a copy was kept.
export type LoadStatus = "ok" | "blocked" | "unreadable";

export function loadPeople(): { people: Person[]; status: LoadStatus } {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return { people: [], status: "blocked" };
  }
  if (!raw) return { people: [], status: "ok" };

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return keepCorruptCopy(raw);
  }
  if (typeof data !== "object" || data === null) return keepCorruptCopy(raw);
  const saved = data as { version?: unknown; people?: unknown };
  // An unknown or newer version might hold things we don't understand. Leave it alone.
  if (saved.version !== VERSION) return keepCorruptCopy(raw);
  // An empty map is fine here (after "start over"), unlike in a saved file.
  if (Array.isArray(saved.people) && saved.people.length === 0) return { people: [], status: "ok" };

  const result = checkPeople(saved.people);
  if (!result.ok) return keepCorruptCopy(raw);
  return { people: result.people, status: "ok" };
}

function keepCorruptCopy(raw: string): { people: Person[]; status: LoadStatus } {
  try {
    window.localStorage.setItem(CORRUPT_KEY, raw);
  } catch {
    // Nothing more we can do; the original is still in place until the visitor makes a change.
  }
  return { people: [], status: "unreadable" };
}

// Forget the kept copy of an unreadable map (used when the visitor clears everything).
export function clearCorruptCopy(): void {
  try {
    window.localStorage.removeItem(CORRUPT_KEY);
  } catch {
    // Storage is blocked, so there's nothing to clear.
  }
}

export function savePeople(people: Person[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ version: VERSION, people }));
    return true;
  } catch {
    return false;
  }
}
