import { ArrowUpRight, Heart, MessageCircle } from "lucide-react";

const discussionUrl = "https://github.com/xtt5241/xtt5241.github.io/discussions/1";

export function GuestbookPanel() {
  return (
    <section className="section guestbook-section" aria-labelledby="guestbook-title">
      <div className="shell guestbook-layout">
        <div>
          <p className="eyebrow">Guestbook</p>
          <h2 id="guestbook-title">留下一个小小的回声</h2>
          <p>读到这里的想法、问题，或只是一个喜欢，都很欢迎。</p>
        </div>
        <div className="guestbook-actions" aria-label="站点互动">
          <a className="guestbook-action guestbook-action--primary" href={discussionUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={20} aria-hidden="true" />
            <span>
              <strong>留一句话</strong>
              <small>在留言板参与讨论</small>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a className="guestbook-action" href={discussionUrl} target="_blank" rel="noreferrer">
            <Heart size={20} aria-hidden="true" />
            <span>
              <strong>送个喜欢</strong>
              <small>用 GitHub 表情反应</small>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
