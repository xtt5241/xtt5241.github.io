import type { CollectionConfig } from "payload";
import { prepareNamedSlug } from "@/utilities/content";

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: { singular: "标签", plural: "标签" },
  admin: { useAsTitle: "name", group: "内容" },
  access: { read: () => true },
  hooks: { beforeValidate: [prepareNamedSlug] },
  fields: [
    { name: "name", label: "名称", type: "text", required: true, unique: true },
    { name: "slug", label: "网址标识", type: "text", required: true, unique: true, index: true, admin: { description: "可留空，将根据名称自动生成。" } },
  ],
};
