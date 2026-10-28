"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Svg } from "@/components/icons";

export default function You() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    supabase.from("items").select("id", { count: "exact", head: true }).then(({ count }) => setCount(count ?? 0));
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const initial = (email || "U").charAt(0).toUpperCase();
  return (
    <main className="app">
      <div className="apphead"><div className="top">
        <div className="wordmark" style={{ fontSize: 16 }}>You</div>
        <Link className="iconbtn" href="/" aria-label="Close"><Svg size={22}><path d="M6 6l12 12M18 6 6 18" /></Svg></Link>
      </div></div>
      <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="block" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 999, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 800 }}>{initial}</div>
          <div><b style={{ fontSize: 16 }}>{email || "Signed in"}</b><div style={{ color: "var(--muted)", fontSize: 13 }}>{count ?? "…"} saves</div></div>
        </div>
        <div className="block"><h3>Privacy</h3><div style={{ fontSize: 14 }}>Private by default — only you can see your saves.</div></div>
        <div className="block"><h3>Plan</h3><div style={{ fontSize: 14 }}>Free</div></div>
        <button className="btn ghost" onClick={signOut}><Svg size={16}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></Svg> Sign out</button>
      </div>
    </main>
  );
}
