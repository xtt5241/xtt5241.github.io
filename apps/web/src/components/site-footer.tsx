import Link from "next/link";
import { Github, Rss } from "lucide-react";
import { siteConfig } from "@/config/site";
import { withBasePath } from "@/lib/media";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <Link className="footer-brand" href="/">{siteConfig.name}</Link>
          <p>{siteConfig.tagline}，也记录生活。</p>
        </div>
        <div className="footer-links">
          <a className="icon-button" href={siteConfig.social.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><Github size={18} /></a>
          <a className="icon-button" href={withBasePath("/rss.xml")} aria-label="RSS" title="RSS"><Rss size={18} /></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} {siteConfig.author}</p>
      </div>
    </footer>
  );
}
