import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/data";
import { gradForType, badgeClass } from "@/lib/catalog";
import { iconFor, Svg } from "@/components/icons";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) notFound();

  const m = item.meta || {};
  let host = "";
  try { host = item.source_url ? new URL(item.source_url).hostname.replace(/^www\./, "") : ""; } catch {}

  return (
    <main className="app">
      <div className="subhead">
        <Link className="iconbtn" href={`/c/${encodeURIComponent(item.category)}`} aria-label="Back"><Svg size={22}><path d="m15 5-7 7 7 7" /></Svg></Link>
        <b style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{item.category}</b>
      </div>

      <div className="hero" style={{ background: gradForType(item.type) }}>
        <span className={`badge ${badgeClass(item.type)}`} style={{ textTransform: "capitalize" }}>{item.type}</span>
        {item.image_url ? <img src={item.image_url} alt="" /> : <Svg>{iconFor(item.type)}</Svg>}
      </div>

      <div className="dbody">
        <h1>{item.title}</h1>
        {item.summary ? <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{item.summary}</div> : null}

        {item.source_url ? (
          <a className="srcbtn" href={item.source_url} target="_blank" rel="noreferrer">
            <Svg size={16}>{iconFor("link")}</Svg> Open original {host ? <span className="host">· {host}</span> : null}
          </a>
        ) : null}

        {Array.isArray(item.tags) && item.tags.length > 0 ? (
          <div className="tagrow">{item.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        ) : null}

        {item.type === "product" && (m.price || m.brand || m.promo) ? (
          <div className="block">
            <h3>Details</h3>
            {m.price ? <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{m.price}</div> : null}
            <div className="tagrow" style={{ marginTop: 8 }}>
              {m.brand ? <span className="tag">{m.brand}</span> : null}
              {m.promo ? <span className="tag">Promo {m.promo}</span> : null}
            </div>
          </div>
        ) : null}

        {(item.type === "place" || item.type === "travel") && (m.address || m.city) ? (
          <div className="block"><h3>Where</h3><div style={{ fontSize: 14 }}>{m.address || m.city}</div></div>
        ) : null}

        {item.type === "recipe" && (Array.isArray(m.ingredients) || Array.isArray(m.steps)) ? (
          <>
            {Array.isArray(m.ingredients) && m.ingredients.length ? (
              <div className="block"><h3>Ingredients</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {m.ingredients.map((x: string, i: number) => <div key={i} style={{ fontSize: 14 }}>• {x}</div>)}
                </div></div>
            ) : null}
            {Array.isArray(m.steps) && m.steps.length ? (
              <div className="block"><h3>Method</h3>
                <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {m.steps.map((x: string, i: number) => <li key={i} style={{ fontSize: 14, lineHeight: 1.45 }}>{x}</li>)}
                </ol></div>
            ) : null}
          </>
        ) : null}

        <div style={{ display: "flex", gap: 10 }}>
          <DeleteButton id={item.id} />
        </div>
      </div>
    </main>
  );
}
