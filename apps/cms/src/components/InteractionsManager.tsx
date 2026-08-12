"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

type InteractionData = {
  reactionCount: number;
  comments: Comment[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InteractionsManager() {
  const [data, setData] = useState<InteractionData>();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setError("");
    const response = await fetch("/api/interactions", { cache: "no-store" });
    const result = await response.json() as InteractionData & { error?: string };
    if (!response.ok) throw new Error(result.error || "互动数据加载失败。");
    setData(result);
  }, []);

  useEffect(() => {
    void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "互动数据加载失败。"));
  }, [load]);

  const deleteComment = async (comment: Comment) => {
    if (!window.confirm(`删除「${comment.author_name}」的这条留言？此操作无法撤销。`)) return;

    setBusyId(comment.id);
    setError("");
    try {
      const response = await fetch("/api/interactions/comment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "删除失败。");
      setData((current) => current && { ...current, comments: current.comments.filter(({ id }) => id !== comment.id) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "删除失败。");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="interactions-manager">
      <header className="interactions-header">
        <div>
          <p className="interactions-kicker">Homepage</p>
          <h1>站点互动</h1>
        </div>
        <button className="btn btn--style-secondary btn--size-medium" type="button" onClick={() => void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "互动数据加载失败。"))}>刷新</button>
      </header>

      <div className="interactions-summary">
        <div><span>首页点赞</span><strong>{data?.reactionCount ?? "-"}</strong></div>
        <div><span>留言总数</span><strong>{data?.comments.length ?? "-"}</strong></div>
      </div>

      {error ? <p className="interactions-error">{error}</p> : null}

      <section className="interactions-table-wrap" aria-labelledby="comments-heading">
        <div className="interactions-section-heading">
          <h2 id="comments-heading">留言</h2>
          <span>{data ? `最近 ${data.comments.length} 条` : "读取中"}</span>
        </div>
        {data?.comments.length ? (
          <table className="interactions-table">
            <thead><tr><th>访客</th><th>内容</th><th>时间</th><th aria-label="操作" /></tr></thead>
            <tbody>{data.comments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.author_name}</td>
                <td className="interactions-comment">{comment.body}</td>
                <td>{formatDate(comment.created_at)}</td>
                <td><button className="btn btn--style-secondary btn--size-small" type="button" disabled={busyId === comment.id} onClick={() => void deleteComment(comment)}>{busyId === comment.id ? "删除中" : "删除"}</button></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="interactions-empty">还没有留言。</p>}
      </section>
    </div>
  );
}
