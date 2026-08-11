import Link from "next/link";

export default function CmsHome() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 720, margin: "80px auto", padding: 24 }}>
      <p style={{ color: "#68756e" }}>XTT BLOG</p>
      <h1>内容服务已启动</h1>
      <p>在管理后台撰写、预览和发布文章，公开站点只会读取已发布内容。</p>
      <Link href="/admin">进入管理后台</Link>
    </main>
  );
}
