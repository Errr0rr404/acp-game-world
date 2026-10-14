"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

export function ShareLinkButton({ title, text, url, label }: { title: string; text: string; url: string; label: string }) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [manual, setManual] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (manual) { input.current?.focus(); input.current?.select(); }
  }, [manual]);

  async function share() {
    if (pending) return;
    setPending(true);
    setFeedback("");
    setManual(false);
    const data = { title, text, url };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        try {
          await navigator.share(data);
          setFeedback("Share menu opened.");
          return;
        } catch (error) {
          if (error && typeof error === "object" && "name" in error && error.name === "AbortError") return;
        }
      }
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setFeedback("Link copied. Send it to a friend.");
    } catch {
      setManual(true);
    } finally { setPending(false); }
  }

  function close() {
    setManual(false);
    button.current?.focus();
  }

  return <div className="share-control">
    <button ref={button} type="button" className="button button-secondary" aria-label={label} disabled={pending}
      aria-expanded={manual} aria-controls={manual ? panelId : undefined} onClick={share}>
      <Icon name={feedback.startsWith("Link copied") ? "check" : "share"} />{feedback.startsWith("Link copied") ? "Link copied" : label}
    </button>
    {feedback ? <span className="share-feedback" role="status">{feedback}</span> : null}
    {manual ? <div id={panelId} className="share-copy-panel" role="group" aria-label="Copy share link" onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } }}>
      <button type="button" className="icon-button" aria-label="Close share link" onClick={close}><Icon name="close" /></button>
      <label className="form-field">Link to share<input ref={input} className="form-input" value={url} readOnly onFocus={(event) => event.currentTarget.select()} /></label>
      <p>Copy this link and send it to a friend.</p>
    </div> : null}
  </div>;
}
