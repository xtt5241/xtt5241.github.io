import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/archive", label: "时间线" },
  { href: "/about", label: "关于" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label={`${siteConfig.name}首页`}>
          <span className="brand-mark">X</span>
          <span>{siteConfig.shortName}</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="header-tools">
          <Link className="icon-button" href="/search" aria-label="搜索" title="搜索"><Search size={18} /></Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
