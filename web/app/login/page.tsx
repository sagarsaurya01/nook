"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Svg } from "@/components/icons";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fn = mode === "in"
      ? supabase.auth.signInWithPassword({ email, password: pw })
      : supabase.auth.signUp({ email, password: pw });
    const { error } = await fn;
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="login">
      <div className="brand"><span className="dot"><Svg size={20}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" /></Svg></span> Nook</div>
      <p>Your AI second brain for everything you save. Sign in to start.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
        <input className="field" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required />
        {msg ? <div className="errline">{msg}</div> : null}
        <button className="btn primary" disabled={busy}>{busy ? "…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="btn ghost" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
        {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
