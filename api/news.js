const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const feeds = [
    { name: 'ultra-soccer', url: 'https://web.ultra-soccer.jp/rss/rss.xml', category: 'match' },
    { name: 'goal', url: 'https://www.goal.com/jp/feeds/news', category: 'transfer' }
  ];

  try {
    const allItems = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        parsed.items.forEach(item => {
          // Determine category based on keywords in title
          let category = feed.category;
          const title = item.title || '';
          if (title.includes('移籍') || title.includes('獲得') || title.includes('合意') || title.includes('加入') || title.includes('契約')) {
            category = 'transfer';
          } else if (title.includes('監督') || title.includes('解任') || title.includes('就任') || title.includes('退任')) {
            category = 'manager';
          } else if (title.includes('イーフト') || title.includes('eFootball')) {
            category = 'efootball';
          }

          allItems.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || item.isoDate,
            source: feed.name === 'ultra-soccer' ? '超ワールドサッカー' : 'Goal.com',
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
