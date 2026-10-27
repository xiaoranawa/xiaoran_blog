package main

import "testing"

func TestParseFeed(t *testing.T) {
	cases := map[string]struct {
		xml   string
		title string
		link  string
		date  string
	}{
		"rss2": {
			xml: `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>x</title>
<item><title><![CDATA[A &amp; B]]></title><link>https://a.com/1</link><pubDate>Mon, 26 Oct 2026 12:00:00 +0800</pubDate></item>
</channel></rss>`,
			title: "A & B", link: "https://a.com/1", date: "2026-10-26",
		},
		"atom": {
			xml: `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><title type="html">C&amp;nbsp;D</title><link rel="replies" href="https://b.com/c"/><link href="https://b.com/2"/><published>2026-10-01T08:00:00Z</published></entry>
</feed>`,
			title: "C D", link: "https://b.com/2", date: "2026-10-01",
		},
		"rss1": {
			xml: `<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<item><title>E</title><link>https://c.com/3</link><dc:date>2026-09-30T23:30:00+08:00</dc:date></item>
</rdf:RDF>`,
			title: "E", link: "https://c.com/3", date: "2026-09-30",
		},
	}
	for name, c := range cases {
		items, err := parseFeed([]byte(c.xml))
		if err != nil || len(items) != 1 {
			t.Fatalf("%s: err=%v items=%d", name, err, len(items))
		}
		got := items[0]
		date := got.Time.In(shanghai).Format("2006-01-02")
		if got.Title != c.title || got.Link != c.link || date != c.date {
			t.Errorf("%s: got %q %q %s", name, got.Title, got.Link, date)
		}
	}
}

func TestParseFeedRejectsHTML(t *testing.T) {
	if _, err := parseFeed([]byte(`<html><body>not a feed</body></html>`)); err == nil {
		t.Error("网页不该被当成订阅源")
	}
}
