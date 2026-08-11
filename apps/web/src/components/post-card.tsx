import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import type { PostSummary } from "@/types/content";

export function PostCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  if (featured) {
    return (
      <article className="featured-post">
        <div className="featured-copy">
          <p className="post-meta">{formatDate(post.publishedAt)} · {post.category.name} · {post.readingMinutes} 分钟</p>
          <h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
          <p>{post.excerpt}</p>
          <Link className="text-link" href={`/posts/${post.slug}`}>阅读文章 <ArrowRight size={16} /></Link>
        </div>
        <Link className="featured-visual" href={`/posts/${post.slug}`} aria-label={`阅读：${post.title}`}>
          <Image src={post.cover?.url ?? siteConfig.heroImage} alt={post.cover?.alt ?? "海湾落日插画"} fill loading="eager" sizes="(max-width: 760px) 100vw, 42vw" />
        </Link>
      </article>
    );
  }

  return (
    <article className="post-row">
      <p className="post-date">{formatDate(post.publishedAt)}</p>
      <div>
        <p className="post-category">{post.category.name}</p>
        <h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.excerpt}</p>
      </div>
      <Link className="row-arrow" href={`/posts/${post.slug}`} aria-label={`阅读：${post.title}`}><ArrowRight size={19} /></Link>
    </article>
  );
}
