# 霄の杂物间

霄染的个人博客，用 [Astro](https://astro.build) 搭建。侧栏参考 [落憾](https://blog.luoh.org)，页脚宠物挂件和侧栏倒计时来自 [梦爱吃鱼](https://blog.bsgun.cn) 的教程，右侧回到顶部的小猫来自 [GoTop](https://github.com/MisakaTAT/GoTop)。

## 常用命令

| 命令 | 作用 |
| :-- | :-- |
| `npm install` | 安装依赖 |
| `npm run dev` | 本地预览，打开 http://localhost:4321 |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 预览构建结果 |
| `npm run new 标题 [网址名]` | 新建一篇文章，自动填好标题和时间 |
| `npm run memo 内容` | 发一条闲言，自动填好时间 |

## 写东西

- **文章**：`src/content/posts/*.md`，frontmatter 写 `title`、`date`，可选 `description`、`cover`、`slug`、`updated`、`draft`。没有分类和标签。用 `npm run new 标题 网址名` 生成会自动填好标题和时间，网址名不写时英文标题会转成网址名，中文标题就用当前时间。
- **闲言**：`src/data/memos.yaml`，一条一项，`content` 支持 Markdown，加 `draft: true` 只在本地显示。短的用 `npm run memo 内容` 直接发，会自动接在文件末尾。每页条数在 `src/config.ts` 的 `site.memosPerPage`。- **友链**：`src/data/friends.ts`。
- **关于**：`src/pages/about.md`。

## 改配置

所有可调项都在 `src/config.ts`：站名、头像、建站日期、导航、页脚按钮、萌备案号、许可协议、背景图 API 和模糊度、倒计时节日、欢迎框的来源网站名称和时间段文案、博主所在城市、评论、访问统计脚本。各地的梗和城市坐标在 `src/data/places.ts`。

域名 `https://blog.xiaoowo.top` 写在 `astro.config.mjs` 的 `site` 里。

### 评论（Giscus）

已经接好了，评论存在本仓库 `xiaoranawa/xiaoran_blog` 的 Discussions 里，分类是 Announcements。换仓库的话按下面重新弄一遍：

1. 准备一个公开的 GitHub 仓库，在仓库 Settings 里勾上 Discussions；
2. 安装 [giscus 应用](https://github.com/apps/giscus) 并授权这个仓库；
3. 打开 [giscus.app](https://giscus.app/zh-CN)，填仓库名，分类选 Announcements，页面下方会生成一段代码；
4. 把里面的 `data-repo`、`data-repo-id`、`data-category`、`data-category-id` 填进 `src/config.ts` 的 `comments`。

填好后每篇文章底下就会出现评论区。

## 都有些什么

- 首页文章热力图：仿 GitHub 贡献图，按每天写的字数变色，浅色模式白到黑、深色模式暗到白
- 宽屏三栏：左边头像、搜索（Ctrl K）、导航、徽章、主题切换；右边欢迎来访、倒计时、归档和网站资讯（合在一张卡片里），文章页还有目录
- 欢迎来访卡片：显示访客来自哪里、离博主多远、当地的梗，可以展开看 IP 和运营商
- 窄一点的屏幕右栏会排到正文下面；手机端导航收进左上角抽屉，所有卡片排到正文后面
- 回到顶部：宽屏是右边吊着的小猫，往下滚一点就会垂下来；窄屏和手机是右下角的小按钮
- 评论：Giscus，每篇文章底下，访客用 GitHub 登录就能评论，跟着网站深浅色变
- 朋友圈：汇总订阅博客的最新文章（钓鱼随机抽一篇、鱼塘卡片、再来亿点）。数据来自 `rss-server` 文件夹里的 Go 服务，部署方法见那里的 README；订阅列表在它的 `config.json`，默认是空的
- Cookie 提示：左下角，点过「知道了」就不再出现
- 左侧栏底部徽章：萌备「异次元之旅」动图（配色在 `badges.travel.color` 改）和无聊湾，手机上在左上角菜单里
- 背景：随机图 API，带一点模糊，超大的图会先缩小再显示；面板是实色，颜色跟着背景图的主色调变
- 左侧大头像卡片：鼠标移上去点进关于页；右栏最下面有一张装饰图（`site.sticker`）
- 右上角欢迎框：显示访客是从哪个网站点进来的（友链里的站会显示朋友的名字），再按访客当地时间说一句话
- 右下角时间胶囊：打开或刷新页面时，按访客当地时间从屏幕右边弹出一句话（欢迎框在的话等它收起），站内换页不会再弹，文案在 `src/config.ts` 的 `timeTip`
- 页脚：社交按钮、宠物挂件、「由 Astro 驱动」、萌 ICP 备案、CC BY-NC-ND 4.0 图标
- 站内搜索、RSS、sitemap、代码高亮和一键复制、文章目录
- 复制提示：复制文字或代码后，顶部滑下一条「复制成功，复制和转载请标注本文地址」，颜色跟着背景图，文案在 `src/config.ts` 的 `copyTip`
- 友链页顶部：一张头图，换图直接替换 `public/img/friends-banner.webp`
- 加载动画：朋友圈拉取数据时，以及站内跳转超过 0.3 秒还没加载完时，会出现一只追着尾巴转圈的长猫
- 控制台横幅：打开 F12 控制台能看到主题蓝的站点字符画和「本站已上线 xx 天」，字符画在 `src/scripts/banner.txt`
