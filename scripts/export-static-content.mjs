import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cmsUrl = (process.env.CMS_URL || "http://localhost:3001").replace(/\/$/, "");
const snapshotPath = resolve(projectRoot, "apps/web/src/content/snapshot.json");
const sourceMediaDir = resolve(projectRoot, "apps/cms/media");
const publicMediaDir = resolve(projectRoot, "apps/web/public/media");

async function getJson(path) {
  const response = await fetch(`${cmsUrl}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

const [postsResponse, profile] = await Promise.all([
  getJson("/api/posts?where[_status][equals]=published&sort=-publishedAt&depth=2&limit=100"),
  getJson("/api/globals/profile?depth=2"),
]);

const posts = Array.isArray(postsResponse.docs) ? postsResponse.docs : [];
const snapshot = {
  generatedAt: new Date().toISOString(),
  posts: makePortable(posts),
  profile: makePortable(profile),
};

await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

await rm(publicMediaDir, { recursive: true, force: true });
await mkdir(publicMediaDir, { recursive: true });

const mediaFiles = (await readdir(sourceMediaDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name !== ".gitkeep");

await Promise.all(mediaFiles.map((entry) =>
  cp(resolve(sourceMediaDir, entry.name), resolve(publicMediaDir, entry.name)),
));

console.log(`Exported ${posts.length} published post(s) and ${mediaFiles.length} media file(s).`);

function makePortable(value) {
  if (typeof value === "string") {
    const marker = "/api/media/file/";
    const markerIndex = value.indexOf(marker);
    return markerIndex >= 0 ? value.slice(markerIndex) : value;
  }
  if (Array.isArray(value)) return value.map(makePortable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, makePortable(item)]));
  }
  return value;
}
