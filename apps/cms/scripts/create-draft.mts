import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "../src/payload.config.ts";

type Frontmatter = Record<string, string | string[]>;

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {} as Frontmatter, body: source };

  const frontmatter: Frontmatter = {};
  let activeArrayKey: string | undefined;

  for (const line of match[1].split(/\r?\n/)) {
    const arrayItem = line.match(/^\s+-\s+(.+)$/);
    if (arrayItem && activeArrayKey) {
      const values = frontmatter[activeArrayKey];
      frontmatter[activeArrayKey] = [...(Array.isArray(values) ? values : []), arrayItem[1].trim()];
      continue;
    }

    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (!field) continue;
    const [, key, rawValue] = field;
    activeArrayKey = rawValue.trim() ? undefined : key;
    frontmatter[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }

  return { frontmatter, body: match[2] };
}

function textNode(text: string) {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}

function paragraph(text: string) {
  return {
    children: text ? [textNode(text)] : [], direction: null, format: "", indent: 0,
    type: "paragraph", version: 1, textFormat: 0, textStyle: "",
  };
}

function heading(text: string, tag: "h2" | "h3" | "h4") {
  return { children: [textNode(text)], direction: null, format: "", indent: 0, tag, type: "heading", version: 1 };
}

function markdownToLexical(markdown: string) {
  const children: Record<string, unknown>[] = [];
  let paragraphLines: string[] = [];
  const flush = () => {
    const value = paragraphLines.join(" ").trim();
    if (value) children.push(paragraph(value));
    paragraphLines = [];
  };

  for (const rawLine of markdown.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      flush();
      const level = Math.min(Math.max(match[1].length, 2), 4) as 2 | 3 | 4;
      children.push(heading(match[2], `h${level}`));
    } else if (!line) {
      flush();
    } else if (/^([-*]|\d+\.)\s+/.test(line)) {
      flush();
      children.push(paragraph(line.replace(/^([-*]|\d+\.)\s+/, "")));
    } else {
      paragraphLines.push(line.replace(/^>\s?/, ""));
    }
  }
  flush();
  return { root: { children, direction: null, format: "", indent: 0, type: "root", version: 1 } };
}

async function ensureNamedDocument(payload: Awaited<ReturnType<typeof getPayload>>, collection: "categories" | "tags", name: string) {
  const existing = await payload.find({ collection, where: { name: { equals: name } }, limit: 1, overrideAccess: true });
  if (existing.docs[0]) return existing.docs[0].id;
  const created = await payload.create({
    collection,
    data: { name, slug: name === "一日一问" ? "daily-question" : undefined },
    overrideAccess: true,
  });
  return created.id;
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error("Usage: create-draft.mts <markdown-file>");

  const source = await readFile(path.resolve(process.cwd(), input), "utf8");
  const { frontmatter, body } = parseFrontmatter(source);
  const title = typeof frontmatter.title === "string" ? frontmatter.title : path.basename(input, path.extname(input));
  const slug = typeof frontmatter.slug === "string" && frontmatter.slug
    ? frontmatter.slug
    : path.basename(input, path.extname(input));
  const categoryName = typeof frontmatter.category === "string" ? frontmatter.category : "随笔";
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  const plainText = body.replace(/^#{1,4}\s+/gm, "").replace(/\s+/g, " ").trim();
  const excerpt = plainText.slice(0, 180) || "一篇尚未发布的博客草稿。";
  const payload = await getPayload({ config });
  const category = await ensureNamedDocument(payload, "categories", categoryName);
  const tagIds = await Promise.all(tags.map((tag) => ensureNamedDocument(payload, "tags", tag)));
  const existing = await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, overrideAccess: true });
  const data = {
    title, slug, excerpt, content: markdownToLexical(body), category, tags: tagIds,
    readingMinutes: Math.max(1, Math.ceil(plainText.length / 500)),
    seo: { title, description: excerpt.slice(0, 160) },
  };
  const post = existing.docs[0]
    ? await payload.update({ collection: "posts", id: existing.docs[0].id, data, draft: true, overrideAccess: true })
    : await payload.create({ collection: "posts", data, draft: true, overrideAccess: true });

  console.log(JSON.stringify({ id: post.id, title: post.title, slug: post.slug, status: post._status, category: categoryName }, null, 2));
}

void main();
