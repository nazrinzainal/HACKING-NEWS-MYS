# SiberWatch

Portal berita hacking, ransomware, malware dan kebocoran data — liputan Malaysia & antarabangsa. Gaya visual terinspirasi DEFCON (dark, red/black/white, terminal vibe).

## Ciri-ciri

- **Dua bahagian berita**: Malaysia 🇲🇾 dan Antarabangsa 🌐, dengan tab filter
- **Auto-update harian** — GitHub Actions (`.github/workflows/fetch-news.yml`) jalan setiap hari, tarik artikel terkini dari The Hacker News, BleepingComputer, KrebsOnSecurity, dan Google News (carian Malaysia)
- **Fully responsive** — auto-resize untuk desktop, laptop, tablet, dan telefon (hamburger menu pada skrin kecil)
- **Font self-hosted** (Bebas Neue + JetBrains Mono) — tak bergantung pada Google Fonts CDN, loading laju walau offline/slow network

## Struktur

```
index.html          - Laman utama
berita.html          - Siaran berita (Malaysia / Antarabangsa)
css/style.css        - Tema DEFCON
js/main.js            - Efek terminal, nav mobile
js/blog-render.js     - Render kad berita dari data/articles.json
fetch-news.js         - Script tarik RSS → data/articles.json
data/articles.json    - Data artikel (auto-update)
assets/fonts/         - Font self-hosted
.github/workflows/    - GitHub Actions (auto-fetch harian)
```

## Jalankan secara lokal

```bash
node fetch-news.js        # tarik artikel terkini
python -m http.server 8099   # atau npx serve
```

Bukak `http://localhost:8099`

## Deploy

Site ini static — boleh host terus di **GitHub Pages** (branch `main`, root `/`). Selepas push, enable Pages di repo Settings → Pages.

Penafian: semua content untuk tujuan edukasi & kesedaran. Tak menggalakkan sebarang aktiviti haram.
