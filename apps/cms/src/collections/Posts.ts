import {
  BlocksFeature,
  CodeBlock,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { publishedOrAuthenticated } from "@/access/publishedOrAuthenticated";
import { preparePost } from "@/utilities/content";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "文章", plural: "文章" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    group: "内容",
    components: {
      edit: {
        PublishButton: "@/components/PublishButton",
        beforeDocumentControls: ["@/components/SyncGithubButton"],
      },
    },
    description: "撰写、保存草稿并发布文章。Slug、摘要、阅读时间和首次发布时间都可以自动生成。",
    preview: (doc) => doc?._status === "published" && doc.slug
      ? `${process.env.WEB_URL || "http://localhost:3000"}/posts/${doc.slug}`
      : null,
  },
  access: {
    read: publishedOrAuthenticated,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: {
    drafts: { autosave: { interval: 1500, showSaveDraftButton: true }, schedulePublish: true },
    maxPerDoc: 30,
  },
  hooks: { beforeValidate: [preparePost] },
  fields: [
    { name: "title", label: "标题", type: "text", required: true },
    { name: "slug", label: "网址标识", type: "text", required: true, unique: true, index: true, admin: { description: "可留空，将根据标题自动生成。发布后不建议修改。" } },
    { name: "excerpt", label: "摘要", type: "textarea", required: true, maxLength: 220, admin: { description: "可留空，将从正文自动截取。建议手动写一句更准确的摘要。" } },
    {
      name: "content",
      label: "正文",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          BlocksFeature({ blocks: [CodeBlock()] }),
        ],
      }),
    },
    { name: "cover", label: "封面", type: "upload", relationTo: "media" },
    { name: "category", label: "分类", type: "relationship", relationTo: "categories" },
    { name: "tags", label: "标签", type: "relationship", relationTo: "tags", hasMany: true },
    { name: "publishedAt", label: "发布时间", type: "date", admin: { position: "sidebar", description: "首次发布时自动填写，也可以手动指定。", date: { pickerAppearance: "dayAndTime" } } },
    { name: "featured", label: "首页精选", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { name: "readingMinutes", label: "预计阅读分钟", type: "number", min: 1, admin: { position: "sidebar", description: "留空时根据正文自动估算。" } },
    {
      name: "seo",
      label: "搜索优化",
      type: "group",
      fields: [
        { name: "title", label: "SEO 标题", type: "text" },
        { name: "description", label: "SEO 描述", type: "textarea", maxLength: 160 },
      ],
    },
  ],
};
