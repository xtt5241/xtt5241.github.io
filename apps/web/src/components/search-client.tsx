"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { PostSummary } from "@/types/content";

export function SearchClient({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return posts;
    return posts.filter((post) => [post.title, post.excerpt, post.category.name, ...post.tags.map((tag) => tag.name)].join(" ").toLowerCase().includes(normalized));
  }, [normalized, posts]);

  return (
    <div className="search-tool">
      <label className="search-field">
        <Search size={20} aria-hidden="true" />
        <span className="sr-only">搜索文章</span>
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、摘要、分类或标签" />
        {query ? <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" title="清空"><X size={18} /></button> : null}
      </label>
      <p className="result-count">{normalized ? `找到 ${results.length} 篇文章` : `共 ${posts.length} 篇文章`}</p>
      <div className="search-results">
        {results.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`}>
            <span>{formatDate(post.publishedAt)}</span>
            <strong>{post.title}</strong>
            <p>{post.excerpt}</p>
          </Link>
        ))}
        {results.length === 0 ? <div className="empty-state"><Search size={24} /><p>没有找到相关内容</p></div> : null}
      </div>
    </div>
  );
}
