const Parser = require('rss-parser');
// Add custom headers to act as a browser to avoid 404/403 blocks from media servers
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
  },
  timeout: 5000
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Using Google News Search RSS for maximum reliability and uptime.
  // It searches for soccer news related to transfers, managers, or matches in Japanese.
  const feeds = [
    {
      name: 'google-news-transfer',
      url: 'https://news.google.com/rss/search?q=%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC+%E7%A7%BB%E7%B1%8D&hl=ja&gl=JP&ceid=JP:ja',
      defaultCategory: 'transfer',
      sourceName: 'Googleニュース (移籍)'
    },
    {
      name: 'google-news-manager',
      url: 'https://news.google.com/rss/search?q=%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC+%E7%9B%A3%E7%9D%A3&hl=ja&gl=JP&ceid=JP:ja',
      defaultCategory: 'manager',
      sourceName: 'Googleニュース (監督)'
    },
    {
      name: 'google-news-match',
      url: 'https://news.google.com/rss/search?q=%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC+%E8%A9%A6%E5%90%88&hl=ja&gl=JP&ceid=JP:ja',
      defaultCategory: 'match',
      sourceName: 'Googleニュース (試合)'
    }
  ];

  // Fix manager URL encoding (監督 in utf-8 hex is %E7%9B%A3%E7%6D%63 -> wait, %E7%9B%A3%E7%9D%A3 is 監督)
  // Let's replace the string in post-processing to ensure correct encoding.

  try {
    const allItems = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        parsed.items.forEach(item => {
          const title = item.title || '';
          let category = feed.defaultCategory;

          // Keyword check for dynamic classification
          if (title.includes('移籍') || title.includes('獲得') || title.includes('合意') || title.includes('加入') || title.includes('契約')) {
            category = 'transfer';
          } else if (title.includes('監督') || title.includes('解任') || title.includes('就任') || title.includes('退任')) {
            category = 'manager';
          } else if (title.includes('イーフト') || title.includes('eFootball')) {
            category = 'efootball';
          }

          // Clean title (Google News appends " - Source Name" at the end of the title)
          let cleanTitle = title;
          const lastDash = title.lastIndexOf(' - ');
          if (lastDash !== -1) {
            cleanTitle = title.substring(0, lastDash);
          }

          // Extract original source from Google News title if available
          let source = feed.sourceName;
          if (lastDash !== -1) {
            source = title.substring(lastDash + 3);
          }

          allItems.push({
            title: cleanTitle,
            link: item.link,
            pubDate: item.pubDate || item.isoDate,
            source: source,
            category: category
          });
        });
      } catch (e) {
        console.error(`Failed to fetch ${feed.name}:`, e);
      }
    }

    // Sort by date descending
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Remove duplicates by title
    const uniqueItems = [];
    const seen = new Set();
    for (const item of allItems) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        uniqueItems.push(item);
      }
    }

    // Limit to 12 items
    const limitedItems = uniqueItems.slice(0, 12);

    res.status(200).json(limitedItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
};
