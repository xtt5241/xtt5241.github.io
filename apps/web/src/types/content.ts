export type Taxonomy = {
  name: string;
  slug: string;
};

export type RichTextNode = {
  type?: string;
  tag?: string;
  text?: string;
  format?: number | string;
  url?: string;
  newTab?: boolean;
  children?: RichTextNode[];
  fields?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  category: Taxonomy;
  tags: Taxonomy[];
  cover?: { url: string; alt: string };
  featured: boolean;
  content: RichTextNode;
};

export type PostSummary = Omit<Post, "content">;

export type Profile = {
  name: string;
  headline: string;
  location: string;
  avatar: { url: string; alt: string };
  bio: RichTextNode;
  links: Array<{ label: string; url: string }>;
};
