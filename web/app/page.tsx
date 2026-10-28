import Link from "next/link";
import { getItems, countsByCategory } from "@/lib/data";
import { CATEGORIES, CAT_GRAD } from "@/lib/catalog";
import { Tile } from "@/components/Tile";
import { CAT_ICON, Svg } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getItems();
  const counts = countsByCategory(items);
  const recent = items.slice(0, 6);
  const activeCats = CATEGORIES.filter((c) => counts[c] > 0);

  return (
    <main className="app">
      <div className="apphead">
        <div className="top">
          <div className="wordmark"><span className="dot"><Svg size={14}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" /></Svg></span> Nook</div>
          <Link className="iconbtn" href="/you" aria-label="You"><Svg size={20}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Svg></Link>
        </div>
        <Link className="search" href="/search">
          <Svg size={17}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></Svg>
          <span style={{ flex: 1, fontSize: 14 }}>Search everything you saved…</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <div className="circ"><Svg size={30}><path d="M12 5v14M5 12h14" /></Svg></div>
          <h3>Nothing saved yet</h3>
          <p>Tap the <b>+</b> button below, paste a link or a screenshot, and watch Nook file it for you.</p>
        </div>
      ) : (
        <>
          <div className="secttitle"><h2>Jump back in</h2></div>
          <div className="tiles" style={{ paddingTop: 0 }}>
            {recent.map((it) => <Tile key={it.id} item={it} h={it.image_url ? 150 : 130} />)}
          </div>

          <div className="secttitle"><h2>Your collections</h2><span>{activeCats.length}</span></div>
          <div className="grid">
            {activeCats.map((c) => (
              <Link key={c} className="coll" href={`/c/${encodeURIComponent(c)}`}>
                <div className="cover" style={{ background: CAT_GRAD[c] }}><Svg>{CAT_ICON[c]}</Svg></div>
                <div className="meta"><b>{c}</b><small>{counts[c]} save{counts[c] === 1 ? "" : "s"}</small></div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
