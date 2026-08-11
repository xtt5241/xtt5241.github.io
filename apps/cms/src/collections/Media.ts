import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "图片", plural: "媒体库" },
  admin: { group: "内容" },
  access: { read: () => true },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "card", width: 960, height: 600, position: "centre" },
      { name: "wide", width: 1600, height: 900, position: "centre" }
    ],
    adminThumbnail: "card",
    mimeTypes: ["image/*"],
  },
  fields: [
    { name: "alt", label: "替代文本", type: "text" },
    { name: "caption", label: "图片说明", type: "text" },
  ],
};
