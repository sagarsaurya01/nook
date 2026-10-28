"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { saveLink, saveScreenshot, type SaveResult } from "@/app/actions";
import { gradForType } from "@/lib/catalog";
import { iconFor, Svg } from "./icons";

export function Shell() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (path === "/login") return null;

  const tab = (href: string) => (path === href ? "tab on" : "tab");
  return (
    <>
      <nav className="tabbar">
        <Link className={tab("/")} href="/"><Svg size={22}><path d="M4 11 12 4l8 7M6 10v9h12v-9" /></Svg>Home</Link>
        <Link className={tab("/search")} href="/search"><Svg size={22}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></Svg>Search</Link>
        <button className="tab add" onClick={() => setOpen(true)} aria-label="Save">
          <span className="ring"><Svg size={26}><path d="M12 5v14M5 12h14" /></Svg></span>
        </button>
        <Link className={tab("/shared")} href="/shared"><Svg size={22}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15 15c3 0 6 1.7 6 5" /></Svg>Shared</Link>
        <Link className={tab("/you")} href="/you"><Svg size={22}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Svg>You</Link>
      </nav>
      <SaveSheet open={open} onClose={() => setOpen(false)} onSaved={() => router.refresh()} />
    </>
  );
}

function SaveSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "reading" | "sorting" | "done" | "error">("idle");
  const [result, setResult] = useState<SaveResult | null>(null);
  const router = useRouter();

  function reset() { setPhase("idle"); setResult(null); setUrl(""); }
  function close() { onClose(); setTimeout(reset, 300); }

  async function runLink() {
    if (!url.trim()) return;
    setPhase("reading");
    setTimeout(() => setPhase((p) => (p === "reading" ? "sorting" : p)), 700);
    const r = await saveLink(url);
    setResult(r);
    setPhase(r.ok ? "done" : "error");
    if (r.ok) onSaved();
  }

  async function runFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhase("sorting");
    const fd = new FormData();
    fd.append("file", f);
    const r = await saveScreenshot(fd);
    setResult(r);
    setPhase(r.ok ? "done" : "error");
    if (r.ok) onSaved();
  }

  return (
    <div className={`sheetwrap ${open ? "open" : ""}`}>
      <div className="scrim" onClick={close} />
      <div className="sheet">
        <div className="grab" />
        {phase === "idle" && (
          <>
            <h3>Save anything</h3>
            <p className="sub">Paste a link or add a screenshot. Nook&apos;s AI files it for you.</p>
            <div className="paste">
              <Svg size={18}>{iconFor("link")}</Svg>
              <input autoFocus placeholder="Paste a link…" value={url}
                onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runLink()} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn primary" onClick={runLink}>
                <Svg size={18}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></Svg> Save link
              </button>
              <label className="btn ghost" style={{ cursor: "pointer" }}>
                <Svg size={18}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m3 17 5-4 4 3 3-2 6 5" /></Svg> Screenshot
                <input type="file" accept="image/*" hidden onChange={runFile} />
              </label>
            </div>
          </>
        )}
        {(phase === "reading" || phase === "sorting") && (
          <div className="save-state">
            <div className="spinner" />
            <div style={{ fontWeight: 700 }}>{phase === "reading" ? "Reading the link…" : "Sorting with AI…"}</div>
            <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
              {phase === "reading" ? "Fetching the page" : "Working out what this is and where it belongs"}
            </div>
          </div>
        )}
        {phase === "done" && result?.ok && (
          <div className="save-state">
            <div className="tickpop"><Svg size={26}><path d="M20 6 9 17l-5-5" /></Svg></div>
            <div style={{ fontWeight: 700 }}>Saved — no folders needed</div>
            <div className="auto-into">Filed into <b>{result.item.category}</b> automatically</div>
            <div className="result-card">
              <div className="mini" style={{ background: gradForType(result.item.type) }}>
                {result.item.image_url ? <img src={result.item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Svg>{iconFor(result.item.type)}</Svg>}
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14, display: "block" }}>{result.item.title}</b>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{result.item.summary || "Original link kept"}</span>
              </div>
            </div>
            <button className="btn primary" onClick={() => { close(); router.push(`/c/${encodeURIComponent(result.item.category)}`); }}>
              See it in {result.item.category}
            </button>
            <button className="btn ghost" onClick={reset}>Save another</button>
          </div>
        )}
        {phase === "error" && (
          <div className="save-state">
            <div className="errline">{result && !result.ok ? result.error : "Something went wrong."}</div>
            <button className="btn primary" onClick={reset}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
