// Fixed collections for the MVP. Items carry a `category` that is one of these,
// so "collections" are just groupings. Gradients/icons match the prototype.
export const CATEGORIES = [
  "Recipes",
  "Shopping",
  "Travel",
  "Outfits",
  "Home ideas",
  "Gift list",
  "Links",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const ITEM_TYPES = [
  "reel", "post", "story", "tiktok", "screenshot",
  "link", "recipe", "product", "place", "outfit", "pdf", "photo",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const GRAD: Record<string, string> = {
  recipe: "linear-gradient(135deg,#e7613f,#b43d2a)",
  product: "linear-gradient(135deg,#3b5bdb,#1e3a8a)",
  place: "linear-gradient(135deg,#db2777,#9d174d)",
  outfit: "linear-gradient(135deg,#7c3aed,#4c1d95)",
  travel: "linear-gradient(135deg,#17a2b8,#0c6b7a)",
  link: "linear-gradient(135deg,#6b7280,#374151)",
};

export const CAT_GRAD: Record<Category, string> = {
  Recipes: "linear-gradient(135deg,#f0944f,#d1572f)",
  Shopping: "linear-gradient(135deg,#4f74e3,#28409c)",
  Travel: "linear-gradient(135deg,#17a2b8,#0c6b7a)",
  Outfits: "linear-gradient(135deg,#8b5cf6,#5b2bb3)",
  "Home ideas": "linear-gradient(135deg,#6b7280,#374151)",
  "Gift list": "linear-gradient(135deg,#ec4899,#a21457)",
  Links: "linear-gradient(135deg,#0f7b6c,#0a4d44)",
};

export function gradForType(t: string) {
  if (t in GRAD) return GRAD[t];
  if (t === "screenshot" || t === "photo") return GRAD.link;
  return GRAD.link;
}

export function badgeClass(t: string) {
  if (["recipe"].includes(t)) return "recipe";
  if (["product"].includes(t)) return "product";
  if (["place"].includes(t)) return "place";
  if (["outfit"].includes(t)) return "outfit";
  if (["travel"].includes(t)) return "travel";
  return "link";
}

export type Item = {
  id: string;
  type: ItemType;
  category: Category;
  title: string | null;
  summary: string | null;
  source_url: string | null;
  image_url: string | null;
  tags: string[];
  meta: Record<string, any>;
  notes: string | null;
  status: "processing" | "ready" | "failed";
  created_at: string;
};
