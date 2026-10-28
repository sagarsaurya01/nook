import Link from "next/link";
import { getItems } from "@/lib/data";
import { Tile } from "@/components/Tile";
import { Svg } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);
  const items = (await getItems()).filter((i) => i.category === category);

  return (
    <main className="app">
      <div className="subhead">
        <Link className="iconbtn" href="/" aria-label="Back"><Svg size={22}><path d="m15 5-7 7 7 7" /></Svg></Link>
        <b>{category}</b>
        <span className="iconbtn" style={{ fontSize: 13, fontWeight: 800 }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="empty">
          <div className="circ"><Svg size={28}><path d="M12 5v14M5 12h14" /></Svg></div>
          <h3>Empty for now</h3>
          <p>Save something and if Nook reads it as {category.toLowerCase()}, it lands here.</p>
        </div>
      ) : (
        <div className="tiles">{items.map((it) => <Tile key={it.id} item={it} h={it.image_url ? 160 : 130} />)}</div>
      )}
    </main>
  );
}
