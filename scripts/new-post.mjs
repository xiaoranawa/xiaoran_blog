// 新建文章，像 hexo new 一样：npm run new 标题 [网址名]
// 不写网址名时，英文标题会转成网址名，中文标题就用当前时间
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beijingNow } from './time.mjs';

const [title, name] = process.argv.slice(2);
if (!title) {
  console.error('用法：npm run new 标题 [网址名]');
  process.exit(1);
}

const { day, time } = beijingNow();

const fromTitle = /^[\w\s-]+$/.test(title) ? title.trim().toLowerCase().replace(/[\s_]+/g, '-') : '';
const slug = name || fromTitle || `${day}-${time.slice(0, 5).replace(':', '')}`;

const dir = fileURLToPath(new URL('../src/content/posts/', import.meta.url));
const file = `${dir}${slug}.md`;
if (existsSync(file)) {
  console.error(`src/content/posts/${slug}.md 已经有了，换个网址名吧`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
date: ${day} ${time}
# description: 列表里显示的简介，不写就取正文前 150 字
# cover: 封面图地址，不写就用自动生成的图案
# draft: true
---

`,
);
console.log(`已新建 src/content/posts/${slug}.md，网址是 /posts/${slug}/`);
