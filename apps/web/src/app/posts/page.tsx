import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCard } from "@/components/post-card";
import { PostArchive } from "@/components/post-archive";
import { getPosts, toPostSummary } from "@/lib/content";

export const metadata: Metadata = { title: "文章" };

export default async function PostsPage() {
  const posts = await getPosts();
  const summaries = posts.map(toPostSummary);

  return (
    <div className="shell page-shell">
      <Suspense fallback={<PostArchiveFallback posts={summaries} />}>
        <PostArchive posts={summaries} />
      </Suspense>
    </div>
  );
}

function PostArchiveFallback({ posts }: { posts: ReturnType<typeof toPostSummary>[] }) {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Writing</p>
        <h1>全部文章</h1>
        <p>技术笔记、工程复盘，以及一些不急着得出结论的想法。</p>
      </header>
      <div className="post-list bordered-list">
        {posts.map((post) => <PostCard key={post.slug} post={post} />)}
      </div>
    </>
  );
}
