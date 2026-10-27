import { getCollection, type CollectionEntry } from 'astro:content';
import { monthKey } from './date';

export type Post = CollectionEntry<'posts'> & {
  url: string;
  words: number;
  minutes: number;
  excerpt: string;
  text: string;
};

const CJK = /[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿]/g;

export function plainText(md: string, keepCode = true) {
  return md
    .replace(/```[^\n]*\n([\s\S]*?)```/g, keepCode ? '$1' : ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^\s*([#>]+|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[`*_~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(text: string) {
  const cjk = text.match(CJK)?.length ?? 0;
  const latin = text.replace(CJK, ' ').match(/[A-Za-z0-9]+(?:['.][A-Za-z0-9]+)*/g)?.length ?? 0;
  // 中文按每分钟 400 字，英文按每分钟 200 词估算
  return { words: cjk + latin, minutes: Math.max(1, Math.round(cjk / 400 + latin / 200)) };
}

async function load(): Promise<Post[]> {
  const entries = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries
    .map((entry) => {
      const body = entry.body ?? '';
      const text = plainText(body);
      const brief = plainText(body, false);
      return {
        ...entry,
        url: `/posts/${entry.id}/`,
        ...countWords(text),
        text,
        excerpt: entry.data.description ?? (brief.length > 150 ? `${brief.slice(0, 150)}…` : brief),
      };
    })
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

let cache: Promise<Post[]> | undefined;

export function getPosts() {
  if (import.meta.env.DEV) return load();
  return (cache ??= load());
}

export function groupByMonth(posts: Post[]) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const key = monthKey(post.data.date);
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }
  return [...groups].map(([key, items]) => ({
    key,
    year: Number(key.slice(0, 4)),
    month: Number(key.slice(5)),
    posts: items,
  }));
}
