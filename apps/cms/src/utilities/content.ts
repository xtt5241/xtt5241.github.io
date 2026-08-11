import type { CollectionBeforeValidateHook } from "payload";

export function slugify(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  if (node.root) return collectText(node.root);
  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = Array.isArray(node.children) ? node.children.map(collectText).join(" ") : "";
  return `${ownText} ${childText}`.replace(/\s+/g, " ").trim();
}

export const preparePost: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;

  if (!data.slug && typeof data.title === "string") data.slug = slugify(data.title);

  const bodyText = collectText(data.content);
  if (!data.excerpt && bodyText) data.excerpt = bodyText.slice(0, 180);
  if (!data.readingMinutes && bodyText) {
    const chineseCharacters = (bodyText.match(/[\p{Script=Han}]/gu) ?? []).length;
    const otherWords = bodyText.replace(/[\p{Script=Han}]/gu, " ").split(/\s+/).filter(Boolean).length;
    data.readingMinutes = Math.max(1, Math.ceil(chineseCharacters / 300 + otherWords / 220));
  }
  if (data._status === "published" && !data.publishedAt) data.publishedAt = new Date().toISOString();

  return data;
};

export const prepareNamedSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && !data.slug && typeof data.name === "string") data.slug = slugify(data.name);
  return data;
};
