import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/lib/content";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/posts", "/archive", "/about", "/search"].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() }));
  const posts = (await getPosts()).map((post) => ({ url: `${siteConfig.url}/posts/${post.slug}`, lastModified: new Date(post.publishedAt) }));
  return [...pages, ...posts];
}
