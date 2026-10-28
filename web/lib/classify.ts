// The product's brain: Claude reads what we know about a saved thing and files
// it into one of the fixed collections, picking a type and pulling out any
// useful detail (price, address, ingredients…). Works from a URL's metadata
// or from an uploaded screenshot image.
import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, ITEM_TYPES, type Category, type ItemType } from "./catalog";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MODEL = "claude-sonnet-4-5"; // fast + cheap; swap to opus if you want

export type Classification = {
  type: ItemType;
  category: Category;
  title: string;
  summary: string;
  tags: string[];
  meta: Record<string, any>;
};

const SYSTEM = `You are the sorting brain of "Nook", an app that files everything a person saves.
Classify one saved item into EXACTLY ONE collection and a type, and extract useful detail.

Collections (pick one): ${CATEGORIES.join(", ")}.
Types (pick one): ${ITEM_TYPES.join(", ")}.

Rules:
- Recipes -> type recipe. Products to buy -> product (meta: price, currency, brand, promo if visible). Restaurants/cafes/bars/travel spots -> place or travel (meta: address, city). Clothing/fashion looks -> outfit. Home/interior -> "Home ideas". A gift idea -> "Gift list". Anything else -> Links.
- title: short, human, specific (max 8 words). Never "Untitled".
- summary: one plain sentence a user would recognise.
- tags: 2-4 lowercase keywords.
- meta: only fields you are confident about; {} if none.
Return ONLY a JSON object: {"type","category","title","summary","tags":[],"meta":{}}. No prose.`;

function coerce(obj: any): Classification {
  const category: Category = (CATEGORIES as readonly string[]).includes(obj?.category)
    ? obj.category
    : "Links";
  const type: ItemType = (ITEM_TYPES as readonly string[]).includes(obj?.type)
    ? obj.type
    : "link";
  return {
    type,
    category,
    title: (obj?.title || "Saved item").toString().slice(0, 120),
    summary: (obj?.summary || "").toString().slice(0, 300),
    tags: Array.isArray(obj?.tags) ? obj.tags.slice(0, 4).map(String) : [],
    meta: obj?.meta && typeof obj.meta === "object" ? obj.meta : {},
  };
}

function parseJson(text: string): any {
  const m = text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : {};
}

export async function classifyUrl(input: {
  url: string;
  host?: string;
  title?: string;
  description?: string;
  siteName?: string;
}): Promise<Classification> {
  const user = `Saved link.
URL: ${input.url}
Host: ${input.host || ""}
Page title: ${input.title || "(none read)"}
Description: ${input.description || "(none)"}
Site: ${input.siteName || ""}`;
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return coerce(parseJson(text));
}

export async function classifyImage(input: {
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}): Promise<Classification> {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: input.mediaType, data: input.base64 },
          },
          {
            type: "text",
            text: "This is a screenshot the user saved. Read what it shows and classify it.",
          },
        ],
      },
    ],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return coerce(parseJson(text));
}
