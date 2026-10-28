// Best-effort fetch of a URL's title + preview image from OpenGraph/meta tags.
// Never throws; returns what it could read. Many sites (IG/TikTok) block this,
// so Claude also gets the raw URL to reason from.
export type Enriched = {
  title?: string;
  image?: string;
  description?: string;
  siteName?: string;
  host?: string;
};

function pick(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m ? m[1].trim() : undefined;
}

export async function enrichUrl(url: string): Promise<Enriched> {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return {};
  }
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NookBot/1.0; +https://nook.app)",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(7000),
    });
    const html = (await res.text()).slice(0, 200000);
    const og = (p: string) =>
      pick(html, new RegExp(`<meta[^>]+property=["']og:${p}["'][^>]+content=["']([^"']+)["']`, "i")) ||
      pick(html, new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${p}["']`, "i"));
    const title =
      og("title") ||
      pick(html, /<title[^>]*>([^<]+)<\/title>/i);
    return {
      host,
      title,
      image: og("image"),
      description:
        og("description") ||
        pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
      siteName: og("site_name"),
    };
  } catch {
    return { host };
  }
}
