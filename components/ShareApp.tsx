"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { APP_URL } from "@/lib/appUrl";
import { SHARE_APP as T } from "@/lib/appShareContent";
import QrCode from "./QrCode";
import { CopyIcon, PrintIcon, QrIcon, ShareIcon } from "./Icons";

// "Share this app" button plus a "Show QR code" button. Only ever shares the
// plain app link (APP_URL), never anything from the visitor's map.
export default function ShareApp({ small = false }: { small?: boolean }) {
  const [message, setMessage] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrButton = useRef<HTMLButtonElement>(null);
  const style = small ? "btn btn-ghost btn-sm" : "btn btn-secondary";

  async function copyLink(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopyFailed(false);
      setMessage(T.copied);
      return true;
    } catch {
      setCopyFailed(true);
      setMessage(T.copyFailed);
      return false;
    }
  }

  async function share() {
    setMessage("");
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: T.shareTitle, text: T.shareText, url: APP_URL });
      } catch (e) {
        // Closing the share sheet is not an error. Anything else, fall back to copying.
        if (!(e instanceof DOMException && e.name === "AbortError")) await copyLink();
      }
      return;
    }
    await copyLink();
  }

  return (
    <>
      <span className="no-print inline-flex flex-wrap items-center gap-2">
        <button type="button" onClick={share} className={style}>
          <ShareIcon size={18} />
          {T.button}
        </button>
        <button ref={qrButton} type="button" onClick={() => setQrOpen(true)} className={style}>
          <QrIcon size={18} />
          {T.qrButton}
        </button>
      </span>
      <span role="status" aria-live="polite" className={copyFailed ? "block w-full text-sm" : "sr-only"}>
        {message}
      </span>
      {copyFailed && (
        <input
          readOnly
          aria-label={T.linkLabel}
          value={APP_URL}
          onFocus={(e) => e.currentTarget.select()}
          className="field no-print max-w-md text-sm"
        />
      )}
      {qrOpen &&
        createPortal(
          <QrDialog
            onClose={() => {
              setQrOpen(false);
              qrButton.current?.focus();
            }}
            copyLink={copyLink}
            copiedMessage={message}
          />,
          document.body,
        )}
    </>
  );
}

function QrDialog({
  onClose,
  copyLink,
  copiedMessage,
}: {
  onClose: () => void;
  copyLink: () => Promise<boolean>;
  copiedMessage: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal(); // modal: traps focus, Esc closes it
  }, []);

  function print() {
    // Tells the print styles to show only this page, then puts things back.
    const root = document.documentElement;
    root.classList.add("printing-qr");
    window.addEventListener("afterprint", () => root.classList.remove("printing-qr"), { once: true });
    window.print();
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="qr-title"
      className="qr-dialog dialog m-auto w-[min(92vw,27rem)] rounded-2xl border border-line bg-surface p-6 text-ink shadow-dialog"
    >
      <h2 id="qr-title" className="font-display text-2xl font-bold tracking-tight">
        {T.dialogTitle}
      </h2>
      <p className="mt-1.5 leading-relaxed text-ink-muted">{T.dialogIntro}</p>
      {/* The code always sits on white, in both themes, so every phone can scan it. */}
      <div className="mx-auto mt-5 w-full max-w-[17rem] rounded-xl bg-white p-2 ring-1 ring-line">
        <QrCode value={APP_URL} label={T.qrLabel(APP_URL)} />
      </div>
      <p className="mt-3 break-all text-center font-semibold" data-testid="qr-url">
        {APP_URL}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{T.privacyNote}</p>
      <div className="no-print mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={copyLink} className="btn btn-secondary btn-sm">
          <CopyIcon size={18} />
          {T.copyButton}
        </button>
        <button type="button" onClick={print} className="btn btn-secondary btn-sm">
          <PrintIcon size={18} />
          {T.printButton}
        </button>
        <button type="button" onClick={() => dialog.current?.close()} className="btn btn-primary btn-sm sm:ml-auto">
          {T.closeButton}
        </button>
      </div>
      <p role="status" aria-live="polite" className="no-print mt-2 min-h-5 text-sm text-ink-muted">
        {copiedMessage}
      </p>
    </dialog>
  );
}
