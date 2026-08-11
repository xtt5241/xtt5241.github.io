import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = { title: "关于" };

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="shell page-shell about-layout">
      <aside className="about-aside">
        <Image src={profile.avatar.url} width={215} height={215} alt={profile.avatar.alt} preload />
        <div>
          <p className="eyebrow">About</p>
          <h1>{profile.name}</h1>
          <p>{profile.location}</p>
        </div>
      </aside>
      <div className="about-content">
        <h2>你好，我是 {profile.name}。</h2>
        <p className="about-headline">{profile.headline}</p>
        <RichText content={profile.bio} />
        <div className="about-links">
          {profile.links.map((link) => <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={15} /></a>)}
          <Link href="/posts">阅读文章 <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </div>
  );
}
