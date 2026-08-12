import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { Categories } from "@/collections/Categories";
import { Media } from "@/collections/Media";
import { Posts } from "@/collections/Posts";
import { Tags } from "@/collections/Tags";
import { Users } from "@/collections/Users";
import { Profile } from "@/globals/Profile";
import { syncGithub } from "@/endpoints/syncGithub";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const webUrl = process.env.WEB_URL || "http://localhost:3000";
const cmsUrl = process.env.CMS_URL || "http://localhost:3001";

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " - XTT Blog CMS" },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      providers: ["@/components/QuickUploadProvider"],
    },
  },
  collections: [Users, Posts, Categories, Tags, Media],
  globals: [Profile],
  endpoints: [syncGithub],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "local-development-secret-change-me",
  serverURL: cmsUrl,
  cors: [webUrl, cmsUrl],
  csrf: [webUrl, cmsUrl],
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./xtt-blog.db" } }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
