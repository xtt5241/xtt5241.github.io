"use client";

import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import type { PostSummary } from "@/types/content";

export function PostArchive({ posts }: { posts: PostSummary[] }) {
  const category = useSearchParams().get("category") ?? "";
  const filtered = category
    ? posts.filter((post) => post.category.slug === category)
    : posts;

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Writing</p>
        <h1>{category ? filtered[0]?.category.name ?? "文章" : "全部文章"}</h1>
        <p>{category ? `${filtered.length} 篇相关记录` : "技术笔记、工程复盘，以及一些不急着得出结论的想法。"}</p>
      </header>
      <div className="post-list bordered-list">
        {filtered.map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
    </>
  );
}
