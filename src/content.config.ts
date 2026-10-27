import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// 闲言写在 yaml 里，content 支持 Markdown；可以读好几个文件，不存在的跳过
function memosLoader(...paths: string[]): Loader {
  return {
    name: 'memos-loader',
    async load({ store, parseData, renderMarkdown, watcher, config, logger }) {
      const files = paths.map((path) => fileURLToPath(new URL(path, config.root)));
      const sync = async () => {
        // 和 Astro 解析 frontmatter 的方式一致，时间按书写的样子当作 UTC
        const lists = await Promise.all(
          files.map(async (file) => (existsSync(file) ? (parse(await readFile(file, 'utf-8'), { customTags: ['timestamp'] }) ?? []) : [])),
        );
        store.clear();
        for (const [f, list] of lists.entries()) {
          if (!Array.isArray(list)) {
            logger.error(`${paths[f]} 应该是一个列表`);
            continue;
          }
          for (const [i, raw] of list.entries()) {
            const id = `${f}-${i}`;
            const data = await parseData({ id, data: raw });
            store.set({ id, data, rendered: await renderMarkdown(String(raw.content ?? '')) });
          }
        }
      };
      await sync();
      const reload = (changed: string) => files.includes(changed) && sync();
      for (const file of files) watcher?.add(file);
      watcher?.on('add', reload).on('change', reload).on('unlink', reload);
    },
  };
}

const memos = defineCollection({
  loader: memosLoader('src/data/memos.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    content: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, memos };
