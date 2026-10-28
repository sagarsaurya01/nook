import Link from "next/link";
import { gradForType, badgeClass, type Item } from "@/lib/catalog";
import { iconFor, Svg } from "./icons";

const CAP: Record<string, string> = {
  recipe: "Recipe", product: "Product", place: "Place", outfit: "Outfit",
  travel: "Travel", screenshot: "Screenshot", link: "Link",
};

export function Tile({ item, h = 150 }: { item: Item; h?: number }) {
  const price = item.meta?.price;
  return (
    <Link className="tile" href={`/i/${item.id}`}>
      <div className="ph" style={{ height: h, background: gradForType(item.type) }}>
        <span className={`badge ${badgeClass(item.type)}`}>{CAP[item.type] ?? "Link"}</span>
        {item.image_url ? <img src={item.image_url} alt="" loading="lazy" /> : <Svg>{iconFor(item.type)}</Svg>}
      </div>
      <div className="cap">
        <b>{item.title}</b>
        {price ? <div className="price">{price}</div> : null}
      </div>
    </Link>
  );
}
