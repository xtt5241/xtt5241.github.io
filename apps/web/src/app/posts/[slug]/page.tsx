import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { getPost, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="article-shell">
      <Link href="/posts" className="back-link"><ArrowLeft size={16} /> 返回文章</Link>
      <header className="article-header">
        <p className="eyebrow">{post.category.name}</p>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        <div className="article-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingMinutes} 分钟阅读</span>
        </div>
      </header>
      <RichText content={post.content} />
      <footer className="article-footer">
        {post.tags.map((tag) => <span key={tag.slug}>#{tag.name}</span>)}
      </footer>
    </article>
  );
}
