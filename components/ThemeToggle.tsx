"use client";

import { useSyncExternalStore } from "react";
import { ThemeChoice, readThemeChoice, setThemeChoice, subscribeTheme } from "@/lib/theme";
import { DeviceIcon, MoonIcon, SunIcon } from "./Icons";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "Match my device", Icon: DeviceIcon },
];

// Three small buttons: light, dark, or follow the device.
export default function ThemeToggle() {
  // On the server (and the first render in the browser) we don't know the
  // saved choice yet, so we show "system" and update right after.
  const choice = useSyncExternalStore(subscribeTheme, readThemeChoice, () => "system" as ThemeChoice);

  return (
    <div role="group" aria-label="Color theme" className="segmented no-print">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={choice === value}
          aria-label={label}
          title={label}
          onClick={() => setThemeChoice(value)}
          className="!px-2.5"
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}
