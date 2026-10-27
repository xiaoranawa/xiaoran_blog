# rss-server

博客「朋友圈」页面背后的小服务：定时抓取订阅的 RSS / Atom，汇总成一个 JSON 接口，博客在浏览器里直接读它。只用 Go 标准库，编译出来就一个可执行文件。

## 订阅哪些博客

改同目录下的 `config.json`，默认一个都没有。往 `feeds` 里加，格式是：

```json
{
  "listen": "127.0.0.1:8787",
  "interval": "30m",
  "per_feed": 8,
  "allow_origins": ["https://blog.xiaoowo.top", "http://localhost:4321"],
  "feeds": [
    { "name": "某某的博客", "feed": "https://example.com/rss.xml", "avatar": "https://example.com/avatar.png", "url": "https://example.com" }
  ]
}
```

| 字段 | 说明 |
| :-- | :-- |
| `listen` | 监听地址，只监听本机，外面通过 Cloudflare Tunnel 访问 |
| `interval` | 多久抓一次，最少 1 分钟 |
| `per_feed` | 每个订阅最多取几篇 |
| `allow_origins` | 允许哪些网站来读，写 `"*"` 就是谁都能读 |
| `feeds` | 订阅列表，`avatar` 和 `url` 可以不填 |

改完保存就行，服务大约 30 秒内会发现并重新抓一轮，不用重启。

## 运行

```bash
go build -o rss-server.exe .
./rss-server.exe
```

启动后打开 http://127.0.0.1:8787/api/circle 能看到 JSON 就对了。每轮抓取的结果会存到 `data/cache.json`，重启时先用它顶上。

要放到 Linux 服务器上，可以直接交叉编译：

```bash
GOOS=linux GOARCH=amd64 go build -o rss-server .
```

## 用 Cloudflare Tunnel 绑到 rss.xiaoowo.top

前提：`xiaoowo.top` 的 DNS 托管在 Cloudflare。

**图形界面（最省事）**：Cloudflare 后台 → Zero Trust → Networks → Tunnels → 新建隧道，按提示在跑这个服务的机器上装好 cloudflared，然后加一条 Public Hostname：子域名 `rss`，域名 `xiaoowo.top`，服务类型 `HTTP`，地址 `127.0.0.1:8787`。

**命令行**：

```bash
cloudflared tunnel login
cloudflared tunnel create rss
cloudflared tunnel route dns rss rss.xiaoowo.top
```

然后直接把转发目标写在命令行里跑，不用写 config.yml：

```bash
cloudflared tunnel --protocol http2 --url http://127.0.0.1:8787 run rss
```

日志里没有 `No ingress rules` 这行警告就对了。开机自启用下面的脚本。

## 开机自启

- **Windows**：把 `rss-server.exe`、`config.json`、`install-windows.ps1` 放在同一个文件夹，管理员身份运行 `powershell -ExecutionPolicy Bypass -File install-windows.ps1`。它会把服务和隧道注册成开机自启的计划任务（SYSTEM 身份、不用登录、挂了自动拉起）。cloudflared 不在 `D:\cloudflared\` 的话，加 `-Cloudflared 路径` 参数。
- **Linux**：写一个 systemd 服务，`WorkingDirectory` 指到程序所在目录，`ExecStart` 指向 `rss-server`，`Restart=always`。

## 接口

`GET /api/circle` 返回：

```json
{
  "updated": "2026-10-27T18:30:00+08:00",
  "feeds": 3,
  "failed": ["抓取失败的订阅名"],
  "posts": [
    { "title": "文章标题", "link": "https://...", "date": "2026-10-27", "time": 1793000000000, "author": "某某的博客", "avatar": "https://...", "site": "https://..." }
  ]
}
```

文章按时间倒序，最多 300 篇。`GET /healthz` 返回 `ok`，可以拿来做存活检查。
