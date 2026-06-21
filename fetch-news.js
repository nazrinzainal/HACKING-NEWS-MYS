// Auto-fetch cyber security news from RSS feeds and merge into data/articles.json
const fs = require('fs');
const path = require('path');

const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', tag: 'Risikan Ancaman', color: '#cc0000', icon: 'skull', region: 'international' },
  { url: 'https://www.bleepingcomputer.com/feed/', tag: 'Berita', color: '#e8e8e8', icon: 'bug', region: 'international' },
  { url: 'https://krebsonsecurity.com/feed/', tag: 'Siasatan', color: '#ff3b3b', icon: 'hoodie', region: 'international' },
  { url: 'https://news.google.com/rss/search?q=%22keselamatan%20siber%22%20OR%20%22kebocoran%20data%22%20OR%20%22serangan%20siber%22%20Malaysia%20when:14d&hl=ms-MY&gl=MY&ceid=MY:ms', tag: 'Malaysia', color: '#ffb800', icon: 'hoodie', region: 'malaysia' },
  { url: 'https://news.google.com/rss/search?q=%22cybersecurity%22%20OR%20%22data%20breach%22%20OR%20%22cyberattack%22%20Malaysia%20when:14d&hl=en-MY&gl=MY&ceid=MY:en', tag: 'Malaysia', color: '#ffb800', icon: 'hoodie', region: 'malaysia' }
];

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const MAX_ARTICLES_PER_REGION = 24;

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

// Blogger/Blogspot serves full-res images (often several MB) at /s1600/ etc.
// Downsize by swapping the size segment so thumbnails load fast.
function shrinkIfBlogger(url) {
  return url.replace(/\/s\d{2,4}(?:-c)?\//, '/s400-c/');
}

function extractImage(block) {
  // 1. <media:content url="..."> or <media:thumbnail url="...">
  let m = block.match(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["']/);
  if (m) return shrinkIfBlogger(decodeEntities(m[1]));

  // 2. <enclosure ... url="..." ... type="image/..." ...> (attributes can be in any order)
  m = block.match(/<enclosure\s+([^>]+)\/?>/);
  if (m) {
    const attrs = m[1];
    const isImage = /type=["']image\/[^"']+["']/.test(attrs);
    const urlMatch = attrs.match(/url=["']([^"']+)["']/);
    if (isImage && urlMatch) return shrinkIfBlogger(decodeEntities(urlMatch[1]));
  }

  // 3. first <img src="..."> inside description/content:encoded
  const bodyMatch = block.match(/<(?:content:encoded|description)>([\s\S]*?)<\/(?:content:encoded|description)>/);
  if (bodyMatch) {
    const imgMatch = decodeEntities(bodyMatch[1]).match(/<img[^>]*src=["']([^"']+)["']/);
    if (imgMatch) return shrinkIfBlogger(decodeEntities(imgMatch[1]));
  }
  return null;
}

function parseRss(xml, feedMeta) {
  const items = [];
  const itemBlocks = xml.split('<item>').slice(1);
  for (const block of itemBlocks.slice(0, 8)) {
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = block.match(/<description>([\s\S]*?)<\/description>/);
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (!titleMatch || !linkMatch) continue;

    const title = decodeEntities(titleMatch[1]).trim();
    const link = decodeEntities(linkMatch[1]).trim();
    const summaryRaw = descMatch ? stripHtml(decodeEntities(descMatch[1])) : '';
    const summary = summaryRaw.slice(0, 220) + (summaryRaw.length > 220 ? '…' : '');
    const date = dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const image = extractImage(block);

    items.push({
      id: slugify(title),
      tag: feedMeta.tag,
      color: feedMeta.color,
      icon: feedMeta.icon,
      region: feedMeta.region,
      image,
      title,
      summary: summary || 'Baca artikel penuh untuk detail lanjut.',
      date,
      readTime: Math.max(3, Math.round(summary.split(' ').length / 40)) + ' min read',
      link
    });
  }
  return items;
}

async function fetchFeed(feedMeta) {
  try {
    const res = await fetch(feedMeta.url, { headers: { 'User-Agent': 'Mozilla/5.0 SiberWatchBot/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRss(xml, feedMeta);
  } catch (err) {
    console.error(`[fetch-news] failed for ${feedMeta.url}: ${err.message}`);
    return [];
  }
}

async function main() {
  const existing = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : [];
  const existingIds = new Set(existing.map(a => a.id));

  const results = await Promise.all(FEEDS.map(fetchFeed));
  const fresh = results.flat().filter(a => !existingIds.has(a.id));

  const combined = [...fresh, ...existing].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Cap independently per region so Malaysia articles aren't crowded out by the busier international feeds.
  const merged = ['malaysia', 'international']
    .flatMap(region => combined.filter(a => a.region === region).slice(0, MAX_ARTICLES_PER_REGION));

  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
  console.log(`[fetch-news] added ${fresh.length} new article(s), total ${merged.length}`);
}

main();
