import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Noto_Serif_SC } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}` }} />
      </head>
      <body>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
