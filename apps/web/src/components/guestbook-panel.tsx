"use client";

import { Heart, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const pageKey = "home";

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.round(hours / 24)} 天前`;
}

export function GuestbookPanel() {
  const [reactionCount, setReactionCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const load = async () => {
      const { data: authData } = await client.auth.getUser();
      const user = authData.user ?? (await client.auth.signInAnonymously()).data.user;
      const [reactionResult, commentResult, ownReactionResult] = await Promise.all([
        client.rpc("get_page_reaction_count", { target_page_key: pageKey }),
        client.from("guestbook_comments").select("id, author_name, body, created_at").eq("page_key", pageKey).order("created_at", { ascending: false }).limit(6),
        user
          ? client.from("page_reactions").select("visitor_id").eq("page_key", pageKey).eq("visitor_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setReactionCount(Number(reactionResult.data ?? 0));
      setComments((commentResult.data ?? []) as Comment[]);
      setReacted(Boolean(ownReactionResult.data));
      setLoading(false);
    };

    void load();
  }, []);

  const toggleReaction = async () => {
    if (!supabase || submitting) return;
    setSubmitting(true);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user ?? (await supabase.auth.signInAnonymously()).data.user;
    if (!user) {
      setMessage("暂时无法建立访客身份，请稍后再试。");
      setSubmitting(false);
      return;
    }

    const result = reacted
      ? await supabase.from("page_reactions").delete().eq("page_key", pageKey).eq("visitor_id", user.id)
      : await supabase.from("page_reactions").insert({ page_key: pageKey, visitor_id: user.id });

    if (result.error) {
      setMessage("操作没有保存成功，请稍后再试。");
    } else {
      setReacted(!reacted);
      setReactionCount((count) => count + (reacted ? -1 : 1));
    }
    setSubmitting(false);
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || submitting || !body.trim()) return;
    setSubmitting(true);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user ?? (await supabase.auth.signInAnonymously()).data.user;
    if (!user) {
      setMessage("暂时无法建立访客身份，请稍后再试。");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("guestbook_comments")
      .insert({
        page_key: pageKey,
        visitor_id: user.id,
        author_name: name.trim() || "一位访客",
        body: body.trim(),
      })
      .select("id, author_name, body, created_at")
      .single();

    if (error || !data) {
      setMessage("留言没有保存成功，请稍后再试。");
    } else {
      setComments((items) => [data as Comment, ...items].slice(0, 6));
      setBody("");
      setMessage("已留下你的留言。谢谢你。 ");
    }
    setSubmitting(false);
  };

  return (
    <section className="section guestbook-section" aria-labelledby="guestbook-title">
      <div className="shell guestbook-layout">
        <div>
          <p className="eyebrow">Guestbook</p>
          <h2 id="guestbook-title">留下一个小小的回声</h2>
          <p>读到这里的想法、问题，或只是一个喜欢，都很欢迎。</p>
        </div>
        <div className="guestbook-interaction" aria-label="站点互动">
          {supabase ? (
            <>
              <button className={`reaction-button${reacted ? " is-active" : ""}`} type="button" onClick={() => void toggleReaction()} disabled={loading || submitting}>
                {loading ? <LoaderCircle className="spin" size={21} aria-hidden="true" /> : <Heart size={21} fill={reacted ? "currentColor" : "none"} aria-hidden="true" />}
                <span>{reacted ? "已喜欢" : "喜欢这个小站"}</span>
                <strong>{reactionCount}</strong>
              </button>
              <form className="guestbook-form" onSubmit={submitComment}>
                <div className="guestbook-form__head"><MessageCircle size={18} aria-hidden="true" /><strong>写一句留言</strong></div>
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="昵称（可选）" aria-label="昵称" />
                <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} placeholder="写下你的想法..." aria-label="留言内容" required />
                <div className="guestbook-form__footer">
                  <span>{message}</span>
                  <button className="button button-primary" type="submit" disabled={submitting || !body.trim()}>
                    {submitting ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />} 发送
                  </button>
                </div>
              </form>
              {comments.length ? (
                <div className="guestbook-comments" aria-label="最新评论">
                  {comments.map((comment) => <article key={comment.id}>
                    <header><strong>{comment.author_name}</strong><time>{relativeTime(comment.created_at)}</time></header>
                    <p>{comment.body}</p>
                  </article>)}
                </div>
              ) : null}
            </>
          ) : <p className="guestbook-unavailable">互动服务正在准备中。</p>}
        </div>
      </div>
    </section>
  );
}
