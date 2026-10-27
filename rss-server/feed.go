package main

import (
	"bytes"
	"encoding/xml"
	"errors"
	"html"
	"io"
	"regexp"
	"strings"
	"time"
)

type item struct {
	Title string
	Link  string
	Time  time.Time
}

type rssDoc struct {
	Channel struct {
		Items []rssItem `xml:"item"`
	} `xml:"channel"`
	// RSS 1.0 的文章直接挂在根节点下
	Items []rssItem `xml:"item"`
}

type rssItem struct {
	Title   string `xml:"title"`
	Link    string `xml:"link"`
	PubDate string `xml:"pubDate"`
	DCDate  string `xml:"http://purl.org/dc/elements/1.1/ date"`
}

type atomDoc struct {
	Entries []struct {
		Title string `xml:"title"`
		Links []struct {
			Href string `xml:"href,attr"`
			Rel  string `xml:"rel,attr"`
		} `xml:"link"`
		Published string `xml:"published"`
		Updated   string `xml:"updated"`
	} `xml:"entry"`
}

var tagRe = regexp.MustCompile(`<[^>]+>`)

// 标题里常有转义过的 HTML，去掉标签、还原实体，再把换行和 &nbsp; 之类的空白统一成一个空格
func cleanTitle(s string) string {
	return strings.Join(strings.Fields(html.UnescapeString(tagRe.ReplaceAllString(s, ""))), " ")
}

var layouts = []string{
	time.RFC1123Z, time.RFC1123, time.RFC822Z, time.RFC822, time.RFC3339, time.RFC3339Nano,
	"Mon, 2 Jan 2006 15:04:05 -0700", "Mon, 2 Jan 2006 15:04:05 MST", "2 Jan 2006 15:04:05 -0700",
	"2006-01-02T15:04:05", "2006-01-02 15:04:05", "2006-01-02",
}

func parseTime(s string) time.Time {
	s = strings.TrimSpace(s)
	for _, layout := range layouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t
		}
	}
	return time.Time{}
}

func newDecoder(data []byte) *xml.Decoder {
	d := xml.NewDecoder(bytes.NewReader(data))
	// 不少博客的 RSS 不太规范，放宽一点，并认得 &nbsp; 这类 HTML 实体
	// 别开 HTMLAutoClose，它会把 RSS 里带内容的 <link> 当成 HTML 的空标签
	d.Strict = false
	d.Entity = xml.HTMLEntity
	d.CharsetReader = func(charset string, input io.Reader) (io.Reader, error) {
		if strings.EqualFold(charset, "utf-8") || strings.EqualFold(charset, "utf8") {
			return input, nil
		}
		return nil, errors.New("不支持的编码 " + charset)
	}
	return d
}

// 认得 RSS 2.0、RSS 1.0 和 Atom
func parseFeed(data []byte) ([]item, error) {
	root := ""
	d := newDecoder(data)
	for root == "" {
		tok, err := d.Token()
		if err != nil {
			return nil, err
		}
		if start, ok := tok.(xml.StartElement); ok {
			root = strings.ToLower(start.Name.Local)
		}
	}

	var items []item
	switch root {
	case "rss", "rdf":
		var doc rssDoc
		if err := newDecoder(data).Decode(&doc); err != nil {
			return nil, err
		}
		for _, it := range append(doc.Channel.Items, doc.Items...) {
			date := it.PubDate
			if date == "" {
				date = it.DCDate
			}
			items = append(items, item{cleanTitle(it.Title), strings.TrimSpace(it.Link), parseTime(date)})
		}
	case "feed":
		var doc atomDoc
		if err := newDecoder(data).Decode(&doc); err != nil {
			return nil, err
		}
		for _, e := range doc.Entries {
			link := ""
			for _, l := range e.Links {
				if l.Rel == "" || l.Rel == "alternate" {
					link = l.Href
					break
				}
			}
			if link == "" && len(e.Links) > 0 {
				link = e.Links[0].Href
			}
			date := e.Published
			if date == "" {
				date = e.Updated
			}
			items = append(items, item{cleanTitle(e.Title), strings.TrimSpace(link), parseTime(date)})
		}
	default:
		return nil, errors.New("不是 RSS 或 Atom 格式")
	}
	return items, nil
}
