import { withBasePath } from "@/lib/media";

export const siteConfig = {
  name: "XTT 的小站",
  shortName: "XTT",
  tagline: "记录思考与成长",
  description: "写下技术实践，也收藏那些让生活变得具体的片刻。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  heroImage: withBasePath("/images/hero-legacy.png"),
  avatar: withBasePath("/images/avatar.png"),
  author: "XTT",
  location: "China",
  email: "",
  social: {
    github: "https://github.com/xtt5241",
  },
} as const;
