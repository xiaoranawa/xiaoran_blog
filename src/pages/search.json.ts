import { ymd } from '../utils/date';
import { getPosts } from '../utils/posts';

// 站内搜索用的索引，打开搜索框时才会去拉
export async function GET() {
  const posts = await getPosts();
  const docs = posts.map((post) => ({
    title: post.data.title,
    url: post.url,
    date: ymd(post.data.date),
    text: post.text,
  }));
  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
