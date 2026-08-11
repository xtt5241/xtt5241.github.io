import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Rss } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/lib/content";
import { withBasePath } from "@/lib/media";

export default async function Home() {
  const posts = await getPosts();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const recent = posts.filter((post) => post.slug !== featured?.slug).slice(0, 4);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <Image
          src={siteConfig.heroImage}
          alt="海湾落日下的船与远山"
          fill
          preload
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="shell hero-inner">
          <p className="eyebrow hero-eyebrow">个人技术与生活记录</p>
          <h1 id="hero-title">{siteConfig.name}</h1>
          <p className="hero-copy">{siteConfig.description}</p>
          <div className="hero-actions">
            <Link href="/posts" className="button button-primary">
              <BookOpen size={17} aria-hidden="true" /> 阅读文章
            </Link>
            <Link href="/about" className="button button-ghost">关于我</Link>
          </div>
          <div className="hero-meta" aria-label="站点统计">
            <span>{posts.length} 篇文章</span>
            <span>{new Set(posts.map((post) => post.category.slug)).size} 个分类</span>
            <a href={withBasePath("/rss.xml")}><Rss size={15} aria-hidden="true" /> RSS</a>
          </div>
        </div>
      </section>

      <section className="section latest-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Latest writing</p>
              <h2>最近写下的</h2>
            </div>
            <Link href="/posts" className="text-link">全部文章 <ArrowUpRight size={16} /></Link>
          </div>
          {featured ? <PostCard post={featured} featured /> : null}
          <div className="post-list">
            {recent.map((post) => <PostCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      <section className="section topic-band">
        <div className="shell topic-grid">
          <div>
            <p className="eyebrow">Browse topics</p>
            <h2>按主题探索</h2>
          </div>
          <div className="topic-links">
            {[...new Map(posts.map((post) => [post.category.slug, post.category])).values()].map((category) => {
              const count = posts.filter((post) => post.category.slug === category.slug).length;
              return (
                <Link key={category.slug} href={`/posts?category=${category.slug}`}>
                  <span>{category.name}</span><strong>{String(count).padStart(2, "0")}</strong>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
