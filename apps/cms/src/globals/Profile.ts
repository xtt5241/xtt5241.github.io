import type { GlobalConfig } from "payload";
import { syncAfterProfileChange } from "@/hooks/syncAfterPublicContentChange";

export const Profile: GlobalConfig = {
  slug: "profile",
  label: "个人资料",
  admin: {
    group: "站点",
    components: {
      elements: { beforeDocumentControls: ["@/components/SyncGithubButton"] },
    },
  },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [syncAfterProfileChange] },
  fields: [
    { name: "name", label: "名字", type: "text", required: true },
    { name: "headline", label: "一句话介绍", type: "text", required: true },
    { name: "location", label: "所在地", type: "text" },
    { name: "bio", label: "关于我", type: "richText" },
    { name: "avatar", label: "头像", type: "upload", relationTo: "media" },
    {
      name: "links",
      label: "社交链接",
      type: "array",
      fields: [
        { name: "label", label: "名称", type: "text", required: true },
        { name: "url", label: "地址", type: "text", required: true },
      ],
    },
  ],
};
