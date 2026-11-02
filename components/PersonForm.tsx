"use client";

import { useId, useState } from "react";
import { Kind, MAX_NAME } from "@/lib/people";
import Shape from "./Shape";

type Props = {
  heading: string;
  submitLabel: string;
  initialName?: string;
  initialKind?: Kind;
  nameLabel?: string;
  believerLabel?: string;
  nonbelieverLabel?: string;
  hint?: React.ReactNode;
  autoFocus?: boolean;
  askKind?: boolean; // false for you (the center): you're always a circle, so we don't ask
  onSubmit: (name: string, kind: Kind) => void;
  onCancel?: () => void;
};

export default function PersonForm({
  heading,
  submitLabel,
  initialName = "",
  initialKind,
  nameLabel = "Name",
  believerLabel = "Follows Jesus",
  nonbelieverLabel = "Doesn't yet follow Jesus",
  hint,
  autoFocus,
  askKind = true,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<Kind | null>(initialKind ?? null);
  const [error, setError] = useState("");
  const id = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Type a name (a first name or nickname is fine).");
    if (askKind && !kind) return setError("Pick a square or a circle.");
    onSubmit(name.trim(), kind ?? "nonbeliever");
    setName("");
    setKind(null);
    setError("");
  }

  const option = (value: Kind, label: string) => {
    const on = kind === value;
    return (
      <label
        className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
          on
            ? "border-accent bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent)]"
            : "border-line-strong bg-surface hover:border-ink-muted"
        }`}
      >
        <input
          type="radio"
          name={id + "-kind"}
          value={value}
          checked={on}
          onChange={() => setKind(value)}
          className="sr-only"
        />
        <Shape kind={value} color="var(--ink)" size={26} />
        <span className="flex-1 leading-tight">
          <span className="block font-semibold">{value === "believer" ? "Square" : "Circle"}</span>
          <span className="text-sm text-ink-muted">{label}</span>
        </span>
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
            on ? "border-accent" : "border-line-strong"
          }`}
        >
          {on && <span className="size-2.5 rounded-full bg-accent" />}
        </span>
      </label>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="font-display text-xl font-bold tracking-tight">{heading}</h3>
      {hint}
      <div>
        <label htmlFor={id + "-name"} className="mb-1.5 block font-semibold">
          {nameLabel}
        </label>
        <input
          id={id + "-name"}
          type="text"
          value={name}
          autoFocus={autoFocus}
          autoComplete="off"
          maxLength={MAX_NAME}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error && !name.trim() ? true : undefined}
          aria-describedby={error ? id + "-error" : undefined}
          className="field"
        />
      </div>
      {askKind && (
        <fieldset>
          <legend className="mb-1.5 font-semibold">Square or circle?</legend>
          <div className="flex flex-col gap-2">
            {option("believer", believerLabel)}
            {option("nonbeliever", nonbelieverLabel)}
          </div>
        </fieldset>
      )}
      {error && (
        <p id={id + "-error"} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
