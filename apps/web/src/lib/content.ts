import { fallbackPosts } from "@/content/fallback";
import snapshot from "@/content/snapshot.json";
import { siteConfig } from "@/config/site";
import { resolveMediaUrl } from "@/lib/media";
import type { Post, PostSummary, Profile, RichTextNode, Taxonomy } from "@/types/content";

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL;
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const staticSnapshot = snapshot as {
  posts: unknown[];
  profile: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function taxonomy(value: unknown, fallback: Taxonomy): Taxonomy {
  const item = asRecord(value);
  return {
    name: typeof item.name === "string" ? item.name : fallback.name,
    slug: typeof item.slug === "string" ? item.slug : fallback.slug,
  };
}

function mapPost(value: unknown): Post {
  const doc = asRecord(value);
  const cover = asRecord(doc.cover);
  const rawTags = Array.isArray(doc.tags) ? doc.tags : [];
  const content = unwrapRichText(doc.content);

  return {
    id: String(doc.id ?? doc.slug ?? "post"),
    slug: String(doc.slug ?? "untitled"),
    title: String(doc.title ?? "未命名文章"),
    excerpt: String(doc.excerpt ?? ""),
    publishedAt: String(doc.publishedAt ?? doc.createdAt ?? new Date().toISOString()),
    readingMinutes: Number(doc.readingMinutes ?? 5),
    category: taxonomy(doc.category, { name: "未分类", slug: "uncategorized" }),
    tags: rawTags.map((tag) => taxonomy(tag, { name: "标签", slug: "tag" })),
    cover: typeof cover.url === "string" ? { url: resolveMediaUrl(cover.url), alt: String(cover.alt ?? doc.title ?? "文章封面") } : undefined,
    featured: Boolean(doc.featured),
    content: Object.keys(content).length ? content : { type: "root", children: [] },
  };
}

function unwrapRichText(value: unknown): RichTextNode {
  const document = asRecord(value);
  const root = asRecord(document.root);
  return (Object.keys(root).length ? root : document) as RichTextNode;
}

const fallbackProfile: Profile = {
  name: siteConfig.author,
  headline: "这里存放我的技术笔记、项目复盘和生活片段。",
  location: siteConfig.location,
  avatar: { url: siteConfig.avatar, alt: `${siteConfig.author} 的头像` },
  bio: {
    type: "root",
    children: [
      { type: "paragraph", children: [{ type: "text", text: "我关心计算机视觉、音视频与软件工程，也希望把学到的东西整理成以后仍然愿意读的文字。" }] },
      { type: "paragraph", children: [{ type: "text", text: "这个站点正在从旧博客逐步迁移。旧文章会保留原始发布日期，同时重新整理标题、摘要和内容结构。" }] },
    ],
  },
  links: [{ label: "GitHub", url: siteConfig.social.github }],
};

export async function getPosts(): Promise<Post[]> {
  if (isStaticExport) {
    return staticSnapshot.posts.length ? staticSnapshot.posts.map(mapPost) : fallbackPosts;
  }
  if (!cmsUrl) return fallbackPosts;

  try {
    const query = "where[_status][equals]=published&sort=-publishedAt&depth=2&limit=100";
    const response = await fetch(`${cmsUrl}/api/posts?${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`CMS returned ${response.status}`);
    const data = asRecord(await response.json());
    const docs = Array.isArray(data.docs) ? data.docs : [];
    return docs.length ? docs.map(mapPost) : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

export function toPostSummary(post: Post): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    category: post.category,
    tags: post.tags,
    cover: post.cover,
    featured: post.featured,
  };
}

export async function getProfile(): Promise<Profile> {
  if (isStaticExport) {
    const data = asRecord(staticSnapshot.profile);
    if (typeof data.name === "string" && data.name.trim()) return mapProfile(data);
    return fallbackProfile;
  }
  if (!cmsUrl) return fallbackProfile;

  try {
    const response = await fetch(`${cmsUrl}/api/globals/profile?depth=1`, { cache: "no-store" });
    if (!response.ok) throw new Error(`CMS returned ${response.status}`);
    const data = asRecord(await response.json());
    return typeof data.name === "string" && data.name.trim() ? mapProfile(data) : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
}

function mapProfile(data: Record<string, unknown>): Profile {
  const name = String(data.name);
  const avatar = asRecord(data.avatar);
  const links = Array.isArray(data.links) ? data.links : [];
  const bio = unwrapRichText(data.bio);

  return {
    name,
    headline: typeof data.headline === "string" ? data.headline : fallbackProfile.headline,
    location: typeof data.location === "string" ? data.location : "",
    avatar: typeof avatar.url === "string"
      ? { url: resolveMediaUrl(avatar.url), alt: String(avatar.alt ?? `${name} 的头像`) }
      : fallbackProfile.avatar,
    bio: Object.keys(bio).length ? bio : fallbackProfile.bio,
    links: links.flatMap((value) => {
      const link = asRecord(value);
      return typeof link.label === "string" && typeof link.url === "string"
        ? [{ label: link.label, url: link.url }]
        : [];
    }),
  };
}
