"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Svg } from "@/components/icons";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");       // red error
  const [notice, setNotice] = useState(""); // green success
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(""); setNotice("");

    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      setBusy(false);
      if (error) { setMsg(error.message); return; }
      router.replace("/"); router.refresh();
      return;
    }

    // create account
    const { data, error } = await supabase.auth.signUp({ email, password: pw });
    setBusy(false);
    if (error) {
      setMsg(/after \d+ seconds/i.test(error.message)
        ? "You just tried that — give it a few seconds and sign in below."
        : error.message);
      return;
    }
    if (data.session) {
      // email confirmation is off → straight in
      router.replace("/"); router.refresh();
      return;
    }
    // account made, needs a sign-in
    setMode("in");
    setPw("");
    setNotice("Account created! Please sign in below.");
  }

  return (
    <main className="login">
      <div className="brand"><span className="dot"><Svg size={20}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" /></Svg></span> Nook</div>
      <p>Your AI second brain for everything you save. {mode === "in" ? "Sign in to start." : "Create your account."}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
        <input className="field" type="email" placeholder="you@email.com" value={email}
          onChange={(e) => { setEmail(e.target.value); setNotice(""); setMsg(""); }} required />
        <input className="field" type="password" placeholder="Password" value={pw}
          onChange={(e) => { setPw(e.target.value); setMsg(""); }} minLength={6} required />
        {notice ? <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>{notice}</div> : null}
        {msg ? <div className="errline">{msg}</div> : null}
        <button className="btn primary" disabled={busy}>{busy ? "…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="btn ghost" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); setNotice(""); }}>
        {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
