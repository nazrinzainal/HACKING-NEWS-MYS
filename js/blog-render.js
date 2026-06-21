// Renders berita cards from data/articles.json, filterable by region (Malaysia / Antarabangsa)
function poster(c, glyph) {
  return `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="g${c.replace('#','')}" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stop-color="${c}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#050505" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="200" height="140" fill="#0e0d0d"/>
    <rect width="200" height="140" fill="url(#g${c.replace('#','')})"/>
    <g transform="translate(100,68)" opacity="0.9">${glyph(c)}</g>
    <rect width="200" height="140" fill="none" stroke="${c}" stroke-opacity="0.25" stroke-width="1"/>
  </svg>`;
}

const GLYPHS = {
  skull: c => `<circle r="30" fill="none" stroke="${c}" stroke-width="3"/><circle cx="-12" cy="-4" r="6" fill="${c}"/><circle cx="12" cy="-4" r="6" fill="${c}"/><path d="M-10 14 Q0 22 10 14" stroke="${c}" stroke-width="3" fill="none"/>`,
  virus: c => `<circle r="22" fill="none" stroke="${c}" stroke-width="3"/><g stroke="${c}" stroke-width="3"><line x1="0" y1="-30" x2="0" y2="-40"/><line x1="0" y1="30" x2="0" y2="40"/><line x1="-30" y1="0" x2="-40" y2="0"/><line x1="30" y1="0" x2="40" y2="0"/><line x1="-21" y1="-21" x2="-28" y2="-28"/><line x1="21" y1="21" x2="28" y2="28"/><line x1="-21" y1="21" x2="-28" y2="28"/><line x1="21" y1="-21" x2="28" y2="-28"/></g>`,
  bug: c => `<ellipse rx="22" ry="18" fill="none" stroke="${c}" stroke-width="3"/><circle cx="-8" cy="-6" r="4" fill="${c}"/><circle cx="8" cy="-6" r="4" fill="${c}"/><line x1="-16" y1="-20" x2="-22" y2="-32" stroke="${c}" stroke-width="3"/><line x1="16" y1="-20" x2="22" y2="-32" stroke="${c}" stroke-width="3"/>`,
  hoodie: c => `<circle r="32" fill="none" stroke="${c}" stroke-width="3"/><path d="M-18 22 Q0 -10 18 22 Z" fill="none" stroke="${c}" stroke-width="2"/><ellipse cy="-2" rx="15" ry="16" fill="none" stroke="${c}" stroke-width="2"/>`
};

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

let ALL_ARTICLES = [];
let CURRENT_REGION = 'all';

function renderCards(articles) {
  const grid = document.getElementById('blog-grid');
  if (!articles.length) {
    grid.innerHTML = `<p style="color:var(--text-dim)">&gt; tiada siaran untuk bahagian ini lagi.</p>`;
    return;
  }

  grid.innerHTML = articles.map((a, i) => {
    const thumb = a.image
      ? `<img src="${a.image}" alt="${a.title}" loading="lazy" decoding="async" data-fallback-idx="${i}">`
      : poster(a.color, GLYPHS[a.icon] || GLYPHS.bug);
    return `
    <div class="post-card">
      <div class="post-thumb">${thumb}</div>
      <div class="post-body">
        <span class="post-tag" style="color:${a.color};border-color:${a.color};">${a.tag}</span>
        <h3>${a.title}</h3>
        <p>${a.summary}</p>
        <div class="post-meta"><span>${fmtDate(a.date)}</span><span>${a.readTime}</span></div>
        <a href="${a.link}" target="_blank" rel="noopener" class="post-link">&gt; baca lanjut</a>
      </div>
    </div>
  `;
  }).join('');

  grid.querySelectorAll('img[data-fallback-idx]').forEach(img => {
    const a = articles[+img.dataset.fallbackIdx];
    img.addEventListener('error', () => {
      img.outerHTML = poster(a.color, GLYPHS[a.icon] || GLYPHS.bug);
    });
  });
}

function applyFilter(region) {
  CURRENT_REGION = region;
  const filtered = region === 'all' ? ALL_ARTICLES : ALL_ARTICLES.filter(a => a.region === region);
  renderCards(filtered);
}

async function renderBlog() {
  const grid = document.getElementById('blog-grid');
  const tabs = document.getElementById('region-tabs');
  try {
    const res = await fetch('data/articles.json');
    ALL_ARTICLES = await res.json();
    applyFilter(CURRENT_REGION);

    if (tabs) {
      tabs.addEventListener('click', e => {
        const btn = e.target.closest('.region-tab');
        if (!btn) return;
        tabs.querySelectorAll('.region-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.region);
      });
    }
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--red-bright)">&gt; gagal muatkan siaran: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', renderBlog);
