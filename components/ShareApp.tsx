"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { APP_URL } from "@/lib/appUrl";
import { SHARE_APP as T } from "@/lib/appShareContent";
import QrCode from "./QrCode";

// "Share this app" button plus a "Show QR code" button. Only ever shares the
// plain app link (APP_URL), never anything from the visitor's map.
export default function ShareApp({ small = false }: { small?: boolean }) {
  const [message, setMessage] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrButton = useRef<HTMLButtonElement>(null);
  const size = small ? "text-sm" : "text-base";

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
        <button type="button" onClick={share} className={`btn-quiet ${size}`}>
          {T.button}
        </button>
        <button ref={qrButton} type="button" onClick={() => setQrOpen(true)} className={`btn-quiet ${size}`}>
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
          className="no-print w-full max-w-md border-2 border-ink-soft bg-white px-3 py-1.5 text-sm"
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
      className="qr-dialog sketch-card m-auto w-[min(92vw,26rem)] bg-white p-5 text-ink backdrop:bg-black/40"
    >
      <h2 id="qr-title" className="font-display text-2xl font-bold">
        {T.dialogTitle}
      </h2>
      <p className="mt-1 text-ink-soft">{T.dialogIntro}</p>
      <div className="mx-auto mt-4 w-full max-w-xs">
        <QrCode value={APP_URL} label={T.qrLabel(APP_URL)} />
      </div>
      <p className="mt-2 break-all text-center font-semibold" data-testid="qr-url">
        {APP_URL}
      </p>
      <p className="mt-3 text-sm text-ink-soft">{T.privacyNote}</p>
      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={copyLink} className="btn-quiet text-sm">
          {T.copyButton}
        </button>
        <button type="button" onClick={print} className="btn-quiet text-sm">
          {T.printButton}
        </button>
        <button type="button" onClick={() => dialog.current?.close()} className="btn-primary text-sm">
          {T.closeButton}
        </button>
      </div>
      <p role="status" aria-live="polite" className="no-print mt-2 text-sm">
        {copiedMessage}
      </p>
    </dialog>
  );
}
