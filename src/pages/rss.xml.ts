import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config';
import { getPosts } from '../utils/posts';

// 文章里的时间是按北京时间写的，读出来却被当成了 UTC，放进 RSS 前减掉 8 小时
const UTC_OFFSET = 8 * 60 * 60 * 1000;

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date.valueOf() - UTC_OFFSET),
      description: post.excerpt,
      link: post.url,
    })),
    customData: '<language>zh-CN</language>',
  });
}
