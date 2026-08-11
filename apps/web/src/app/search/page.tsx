import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { getPosts, toPostSummary } from "@/lib/content";

export const metadata: Metadata = { title: "搜索" };

export default async function SearchPage() {
  return (
    <div className="shell page-shell narrow-shell">
      <header className="page-heading compact-heading">
        <p className="eyebrow">Search</p>
        <h1>搜索文章</h1>
      </header>
      <SearchClient posts={(await getPosts()).map(toPostSummary)} />
    </div>
  );
}
