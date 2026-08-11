import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const files = [
  {
    path: resolve("apps/web/.env.local"),
    content: "NEXT_PUBLIC_SITE_URL=http://localhost:3000\nNEXT_PUBLIC_CMS_URL=http://localhost:3001\n",
  },
  {
    path: resolve("apps/cms/.env"),
    content: [
      "DATABASE_URI=file:./xtt-blog.db",
      `PAYLOAD_SECRET=${randomBytes(32).toString("hex")}`,
      "WEB_URL=http://localhost:3000",
      "CMS_URL=http://localhost:3001",
      "",
    ].join("\n"),
  },
];

for (const file of files) {
  if (existsSync(file.path)) {
    console.log(`保留已有配置：${file.path}`);
    continue;
  }

  writeFileSync(file.path, file.content, { encoding: "utf8", mode: 0o600 });
  console.log(`已创建配置：${file.path}`);
}

console.log("配置完成。运行 pnpm dev 启动前台和 CMS。");
