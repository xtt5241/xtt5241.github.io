import type { ReactNode } from "react";
import type { RichTextNode } from "@/types/content";
import { ZoomableImage } from "@/components/zoomable-image";
import { resolveMediaUrl } from "@/lib/media";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function renderUpload(node: RichTextNode, key: string, eager: boolean): ReactNode {
  const media = asRecord(node.value);
  const rawUrl = typeof media.url === "string" ? media.url : "";

  if (!rawUrl) return null;

  const width = typeof media.width === "number" ? media.width : 1600;
  const height = typeof media.height === "number" ? media.height : 900;
  const alt = typeof media.alt === "string" ? media.alt : "";
  const caption = typeof media.caption === "string" ? media.caption : "";

  return (
    <figure className="prose-media" key={key}>
      <ZoomableImage
        alt={alt}
        eager={eager}
        height={height}
        src={resolveMediaUrl(rawUrl)}
        width={width}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function renderChildren(node: RichTextNode, key: string, context: { uploadIndex: number }): ReactNode {
  if (node.type === "text") {
    let value: ReactNode = node.text ?? "";
    if (typeof node.format === "number") {
      if (node.format & 1) value = <strong>{value}</strong>;
      if (node.format & 2) value = <em>{value}</em>;
      if (node.format & 16) value = <code>{value}</code>;
    }
    return <span key={key}>{value}</span>;
  }

  const children = node.children?.map((child, index) => renderChildren(child, `${key}-${index}`, context));
  switch (node.type) {
    case "root": return <>{children}</>;
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      if (node.tag === "h3") return <h3 key={key}>{children}</h3>;
      if (node.tag === "h4") return <h4 key={key}>{children}</h4>;
      return <h2 key={key}>{children}</h2>;
    }
    case "quote": return <blockquote key={key}>{children}</blockquote>;
    case "list": return node.tag === "ol" ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>;
    case "listitem": return <li key={key}>{children}</li>;
    case "link": return <a key={key} href={node.url} target={node.newTab ? "_blank" : undefined} rel={node.newTab ? "noreferrer" : undefined}>{children}</a>;
    case "linebreak": return <br key={key} />;
    case "upload": {
      const eager = context.uploadIndex === 0;
      context.uploadIndex += 1;
      return renderUpload(node, key, eager);
    }
    default:
      if (node.fields && typeof node.fields.code === "string") return <pre key={key}><code>{node.fields.code}</code></pre>;
      return <div key={key}>{children}</div>;
  }
}

export function RichText({ content }: { content: RichTextNode }) {
  return <div className="prose">{renderChildren(content, "root", { uploadIndex: 0 })}</div>;
}
