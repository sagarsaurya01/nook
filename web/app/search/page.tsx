"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { searchItems } from "@/app/actions";
import { Tile } from "@/components/Tile";
import { Svg } from "@/components/icons";
import type { Item } from "@/lib/catalog";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [pending, start] = useTransition();

  function run(value: string) {
    setQ(value);
    if (!value.trim()) { setItems([]); setSearched(false); return; }
    start(async () => {
      const res = await searchItems(value);
      setItems(res);
      setSearched(true);
    });
  }

  return (
    <main className="app">
      <div className="apphead">
        <div className="top">
          <div className="wordmark" style={{ fontSize: 16 }}>Search</div>
          <Link className="iconbtn" href="/" aria-label="Close"><Svg size={22}><path d="M6 6l12 12M18 6 6 18" /></Svg></Link>
        </div>
        <div className="search">
          <Svg size={17}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></Svg>
          <input autoFocus placeholder="Search by what you remember…" value={q} onChange={(e) => run(e.target.value)} />
        </div>
      </div>
      <div className="secttitle"><h2>{!q ? "Try searching" : pending ? "Searching…" : searched ? `${items.length} result${items.length === 1 ? "" : "s"}` : ""}</h2></div>
      {items.length > 0 ? (
        <div className="tiles">{items.map((it) => <Tile key={it.id} item={it} h={it.image_url ? 150 : 120} />)}</div>
      ) : searched && !pending ? (
        <div className="empty"><h3>No matches</h3><p>Try fewer words, or the brand, place or dish name.</p></div>
      ) : null}
    </main>
  );
}
