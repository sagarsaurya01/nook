"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enrichUrl } from "@/lib/enrich";
import { classifyUrl, classifyImage } from "@/lib/classify";
import type { Item } from "@/lib/catalog";

export type SaveResult =
  | { ok: true; item: Item }
  | { ok: false; error: string };

export async function saveLink(url: string): Promise<SaveResult> {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    new URL(url);
  } catch {
    return { ok: false, error: "That doesn't look like a link." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const meta = await enrichUrl(url);
  let c;
  try {
    c = await classifyUrl({
      url,
      host: meta.host,
      title: meta.title,
      description: meta.description,
      siteName: meta.siteName,
    });
  } catch (e: any) {
    return { ok: false, error: "AI sorting failed: " + (e?.message || "unknown") };
  }

  const row = {
    user_id: user.id,
    type: c.type,
    category: c.category,
    title: c.title,
    summary: c.summary,
    source_url: url,
    image_url: meta.image ?? null,
    tags: c.tags,
    meta: c.meta,
    status: "ready" as const,
  };

  const { data, error } = await supabase
    .from("items")
    .upsert(row, { onConflict: "user_id,source_url" })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true, item: data as Item };
}

export async function saveScreenshot(formData: FormData): Promise<SaveResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No image." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const buf = Buffer.from(await file.arrayBuffer());
  const mt = (file.type || "image/png") as any;
  let c;
  try {
    c = await classifyImage({ base64: buf.toString("base64"), mediaType: mt });
  } catch (e: any) {
    return { ok: false, error: "AI sorting failed: " + (e?.message || "unknown") };
  }

  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`.replace(/\s+/g, "_");
  const up = await supabase.storage.from("saves").upload(path, buf, { contentType: mt });
  let image_url: string | null = null;
  if (!up.error) {
    const signed = await supabase.storage.from("saves").createSignedUrl(path, 60 * 60 * 24 * 365);
    image_url = signed.data?.signedUrl ?? null;
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      type: "screenshot",
      category: c.category,
      title: c.title,
      summary: c.summary,
      source_url: null,
      image_url,
      tags: c.tags,
      meta: c.meta,
      status: "ready",
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true, item: data as Item };
}

export async function deleteItem(id: string) {
  const supabase = createClient();
  await supabase.from("items").delete().eq("id", id);
  revalidatePath("/");
}

export async function searchItems(q: string): Promise<Item[]> {
  q = q.trim();
  if (!q) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .or(`title.ilike.%${q}%,summary.ilike.%${q}%,category.ilike.%${q}%,tags.cs.["${q.toLowerCase()}"]`)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Item[];
}
