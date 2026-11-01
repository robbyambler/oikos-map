// Light, dark, or follow the device ("system").
// The choice is saved on this device only (localStorage). Nothing leaves it.

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "oikos-theme";

// This runs as an inline script in <head>, before the page paints, so there is
// no flash of the wrong theme. It sets data-theme="light" or "dark" on <html>
// and keeps following the device setting while the choice is "system".
export const THEME_SCRIPT = `(function(){
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function apply() {
    var choice = "system";
    try { choice = localStorage.getItem("${THEME_KEY}") || "system"; } catch (e) {}
    var dark = choice === "dark" || (choice !== "light" && media.matches);
    root.setAttribute("data-theme", dark ? "dark" : "light");
  }
  apply();
  if (media.addEventListener) media.addEventListener("change", apply);
})();`;

// ---- A tiny store so the toggle button always shows the current choice ----

const listeners = new Set<() => void>();

export function readThemeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage blocked (e.g. private browsing): just follow the device.
  }
  return "system";
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Can't save: the theme still changes for this visit below.
  }
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  listeners.forEach((fn) => fn());
}

export function subscribeTheme(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
