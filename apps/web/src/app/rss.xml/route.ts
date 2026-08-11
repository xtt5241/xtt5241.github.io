import { siteConfig } from "@/config/site";
import { getPosts } from "@/lib/content";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character] ?? character);
}

export async function GET() {
  const posts = await getPosts();
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${siteConfig.url}/posts/${post.slug}</link><guid>${siteConfig.url}/posts/${post.slug}</guid><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><description>${escapeXml(post.excerpt)}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><description>${escapeXml(siteConfig.description)}</description><language>zh-CN</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
