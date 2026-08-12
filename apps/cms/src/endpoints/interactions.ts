import type { Endpoint } from "payload";

type InteractionComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ADMIN_KEY;
  if (!url || !key) throw new Error("Supabase 管理连接尚未配置。");
  return { url: url.replace(/\/$/, ""), key };
}

async function request(path: string, init?: RequestInit) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`互动数据请求失败 (${response.status})。`);
  return response;
}

export const getInteractions: Endpoint = {
  path: "/interactions",
  method: "get",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "需要登录后才能管理互动内容。" }, { status: 401 });
    }

    try {
      const [reactionResponse, commentsResponse] = await Promise.all([
        request("page_reactions?select=page_key&page_key=eq.home", {
          headers: { Prefer: "count=exact", Range: "0-0" },
        }),
        request("guestbook_comments?select=id,author_name,body,created_at&page_key=eq.home&order=created_at.desc&limit=100"),
      ]);

      const total = Number(reactionResponse.headers.get("content-range")?.split("/")[1] ?? 0);
      const comments = await commentsResponse.json() as InteractionComment[];
      return Response.json({ reactionCount: total, comments });
    } catch (error) {
      const message = error instanceof Error ? error.message : "互动数据暂时不可用。";
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

export const deleteInteractionComment: Endpoint = {
  path: "/interactions/comment",
  method: "delete",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "需要登录后才能管理互动内容。" }, { status: 401 });
    }

    try {
      const body = await req.json?.().catch(() => null) as { id?: string } | null;
      if (!body?.id) return Response.json({ error: "缺少留言标识。" }, { status: 400 });

      await request(`guestbook_comments?id=eq.${encodeURIComponent(body.id)}`, { method: "DELETE" });
      return Response.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除留言失败。";
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
