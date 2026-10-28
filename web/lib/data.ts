import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Item, type Category } from "@/lib/catalog";

export async function getItems(): Promise<Item[]> {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Item[];
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = createClient();
  const { data } = await supabase.from("items").select("*").eq("id", id).single();
  return (data as Item) ?? null;
}

export function countsByCategory(items: Item[]): Record<Category, number> {
  const out = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const it of items) if (it.category in out) out[it.category as Category]++;
  return out;
}
