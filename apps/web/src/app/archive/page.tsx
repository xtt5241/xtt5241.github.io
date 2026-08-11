import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "时间线" };

export default async function ArchivePage() {
  const posts = await getPosts();
  const groups = posts.reduce((result, post) => {
    const year = new Date(post.publishedAt).getFullYear();
    result.set(year, [...(result.get(year) ?? []), post]);
    return result;
  }, new Map<number, typeof posts>());

  return (
    <div className="shell page-shell narrow-shell">
      <header className="page-heading">
        <p className="eyebrow">Archive</p>
        <h1>时间线</h1>
        <p>按时间回看写作轨迹。</p>
      </header>
      <div className="timeline">
        {[...groups.entries()].sort(([a], [b]) => b - a).map(([year, yearPosts]) => (
          <section key={year}>
            <h2>{year}</h2>
            <div>
              {yearPosts.map((post) => (
                <Link key={post.slug} href={`/posts/${post.slug}`}>
                  <time>{formatDate(post.publishedAt).replace(`${year}年`, "")}</time>
                  <span>{post.title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
