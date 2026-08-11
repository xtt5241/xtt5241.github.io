const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? "";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function withBasePath(path: string) {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}

export function resolveMediaUrl(url: string) {
  if (isStaticExport) {
    const fileMarker = "/api/media/file/";
    const markerIndex = url.indexOf(fileMarker);
    if (markerIndex >= 0) {
      return withBasePath(`/media/${url.slice(markerIndex + fileMarker.length)}`);
    }
  }

  if (/^https?:\/\//.test(url)) return url;
  return `${cmsUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
