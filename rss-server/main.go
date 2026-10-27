// 朋友圈订阅服务：定时抓取配置里的 RSS / Atom，汇总成一个 JSON 接口给博客用
package main

import (
	"cmp"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"slices"
	"sync"
	"syscall"
	"time"
	_ "time/tzdata"
)

type Feed struct {
	Name   string `json:"name"`
	Feed   string `json:"feed"`
	Avatar string `json:"avatar,omitempty"`
	URL    string `json:"url,omitempty"`
}

type Config struct {
	Listen       string   `json:"listen"`
	Interval     string   `json:"interval"`
	PerFeed      int      `json:"per_feed"`
	AllowOrigins []string `json:"allow_origins"`
	Feeds        []Feed   `json:"feeds"`
}

type Post struct {
	Title  string `json:"title"`
	Link   string `json:"link"`
	Date   string `json:"date"`
	Time   int64  `json:"time"`
	Author string `json:"author"`
	Avatar string `json:"avatar,omitempty"`
	Site   string `json:"site,omitempty"`
}

type Result struct {
	Updated string   `json:"updated"`
	Feeds   int      `json:"feeds"`
	Failed  []string `json:"failed"`
	Posts   []Post   `json:"posts"`
}

const maxPosts = 300

var (
	configPath = flag.String("config", "config.json", "配置文件路径")
	cachePath  = flag.String("cache", "data/cache.json", "上一轮结果的缓存文件")
	shanghai   = mustLocation("Asia/Shanghai")
	client     = &http.Client{Timeout: 15 * time.Second}

	mu      sync.RWMutex
	current = Result{Failed: []string{}, Posts: []Post{}}
	payload []byte
)

func mustLocation(name string) *time.Location {
	loc, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return loc
}

func loadConfig() (Config, error) {
	cfg := Config{Listen: "127.0.0.1:8787", Interval: "30m", PerFeed: 8}
	data, err := os.ReadFile(*configPath)
	if err != nil {
		return cfg, err
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("配置文件格式不对：%w", err)
	}
	if cfg.PerFeed <= 0 {
		cfg.PerFeed = 8
	}
	return cfg, nil
}

func fetchFeed(ctx context.Context, f Feed, perFeed int) ([]Post, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, f.Feed, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; xiaoowo-rss-circle/1.0; +https://blog.xiaoowo.top)")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	data, err := io.ReadAll(io.LimitReader(resp.Body, 5<<20))
	if err != nil {
		return nil, err
	}
	items, err := parseFeed(data)
	if err != nil {
		return nil, err
	}
	slices.SortFunc(items, func(a, b item) int { return b.Time.Compare(a.Time) })

	var posts []Post
	for _, it := range items {
		if it.Title == "" || it.Link == "" {
			continue
		}
		p := Post{Title: it.Title, Link: it.Link, Author: f.Name, Avatar: f.Avatar, Site: f.URL}
		if !it.Time.IsZero() {
			p.Date = it.Time.In(shanghai).Format("2006-01-02")
			p.Time = it.Time.UnixMilli()
		}
		posts = append(posts, p)
		if len(posts) == perFeed {
			break
		}
	}
	return posts, nil
}

// 并发抓所有订阅，单个失败不影响其他
func refresh(ctx context.Context, cfg Config) {
	type res struct {
		name  string
		posts []Post
		err   error
	}
	results := make(chan res, len(cfg.Feeds))
	limit := make(chan struct{}, 6)
	for _, f := range cfg.Feeds {
		go func() {
			limit <- struct{}{}
			defer func() { <-limit }()
			posts, err := fetchFeed(ctx, f, cfg.PerFeed)
			results <- res{f.Name, posts, err}
		}()
	}

	next := Result{Feeds: len(cfg.Feeds), Failed: []string{}, Posts: []Post{}}
	for range cfg.Feeds {
		r := <-results
		if r.err != nil {
			log.Printf("抓取失败：%s（%v）", r.name, r.err)
			next.Failed = append(next.Failed, r.name)
			continue
		}
		next.Posts = append(next.Posts, r.posts...)
	}
	slices.SortFunc(next.Posts, func(a, b Post) int { return cmp.Compare(b.Time, a.Time) })
	if len(next.Posts) > maxPosts {
		next.Posts = next.Posts[:maxPosts]
	}
	next.Updated = time.Now().In(shanghai).Format(time.RFC3339)
	publish(next)
	log.Printf("抓取完成：%d 个订阅，%d 篇文章，失败 %d 个", next.Feeds, len(next.Posts), len(next.Failed))

	if err := os.MkdirAll(filepath.Dir(*cachePath), 0o755); err == nil {
		mu.RLock()
		_ = os.WriteFile(*cachePath, payload, 0o644)
		mu.RUnlock()
	}
}

func publish(r Result) {
	data, _ := json.Marshal(r)
	mu.Lock()
	current, payload = r, data
	mu.Unlock()
}

// 启动时先读上一轮的缓存，抓取完成前也有数据可返回
func loadCache() {
	data, err := os.ReadFile(*cachePath)
	if err != nil {
		return
	}
	var r Result
	if json.Unmarshal(data, &r) == nil {
		publish(r)
		log.Printf("已读取缓存：%d 篇文章", len(r.Posts))
	}
}

func handler(cfg Config) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/circle", func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if slices.Contains(cfg.AllowOrigins, "*") {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if slices.Contains(cfg.AllowOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Add("Vary", "Origin")
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=300")
		mu.RLock()
		data := payload
		mu.RUnlock()
		if data == nil {
			data, _ = json.Marshal(current)
		}
		_, _ = w.Write(data)
	})
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.WriteString(w, "ok")
	})
	return mux
}

func configChanged(last time.Time) (time.Time, bool) {
	info, err := os.Stat(*configPath)
	if err != nil {
		return last, false
	}
	return info.ModTime(), info.ModTime().After(last)
}

func main() {
	flag.Parse()
	cfg, err := loadConfig()
	if err != nil {
		log.Fatalf("读取配置失败：%v", err)
	}
	interval, err := time.ParseDuration(cfg.Interval)
	if err != nil || interval < time.Minute {
		interval = 30 * time.Minute
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	loadCache()
	srv := &http.Server{Addr: cfg.Listen, Handler: handler(cfg), ReadHeaderTimeout: 10 * time.Second}
	go func() {
		log.Printf("监听 http://%s ，接口 /api/circle", cfg.Listen)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("启动失败：%v", err)
		}
	}()

	// 定时抓取；配置文件改了就提前抓一轮，订阅列表不用重启就能生效
	go func() {
		modTime, _ := configChanged(time.Time{})
		refresh(ctx, cfg)
		ticker := time.NewTicker(interval)
		check := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		defer check.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			case <-check.C:
				var changed bool
				if modTime, changed = configChanged(modTime); !changed {
					continue
				}
				log.Print("配置文件有改动，重新抓取")
			}
			if next, err := loadConfig(); err == nil {
				cfg.Feeds, cfg.PerFeed = next.Feeds, next.PerFeed
			} else {
				log.Printf("读取配置失败，沿用旧订阅：%v", err)
			}
			refresh(ctx, cfg)
		}
	}()

	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdown)
}
