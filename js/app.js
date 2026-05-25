// ── Router ──────────────────────────────────────────────────────────────────
function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  const parts = hash.split('/').filter(Boolean);
  return parts;
}

function navigate(path) {
  window.location.hash = path;
}

function render() {
  const parts = getRoute();
  const app = document.getElementById('app');

  // #/  →  landing
  if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) {
    app.innerHTML = renderLanding();
    return;
  }

  const lang = parts[0];
  if (lang !== 'en' && lang !== 'nl') {
    app.innerHTML = renderLanding();
    return;
  }

  // #/en  or  #/nl  →  home (bio + collection)
  if (parts.length === 1) {
    app.innerHTML = renderHome(lang);
    bindFilters(lang);
    return;
  }

  // #/en/bio  or  #/nl/bio
  if (parts[1] === 'bio') {
    app.innerHTML = renderBio(lang);
    return;
  }

  // #/en/collection
  if (parts[1] === 'collection') {
    app.innerHTML = renderCollection(lang);
    bindFilters(lang);
    return;
  }

  // #/en/painting/01
  if (parts[1] === 'painting' && parts[2]) {
    app.innerHTML = renderPainting(lang, parts[2]);
    return;
  }

  app.innerHTML = renderHome(lang);
  bindFilters(lang);
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

// ── Shared nav ───────────────────────────────────────────────────────────────
function nav(lang) {
  const t = SITE[lang].nav;
  const otherLang = t.langCode;
  const currentHash = window.location.hash;
  const otherHash = currentHash.replace(`#/${lang}`, `#/${otherLang}`);
  return `
  <nav class="site-nav">
    <a class="nav-brand" href="#/${lang}">${SITE[lang].siteName}</a>
    <div class="nav-links">
      <a href="#/${lang}">${t.home}</a>
      <a href="#/${lang}/bio">${t.biography}</a>
      <a href="#/${lang}/collection">${t.collection}</a>
      <a class="lang-switch" href="${otherHash || '#/' + otherLang}">${t.language}</a>
    </div>
  </nav>`;
}

function footer(lang) {
  const year = new Date().getFullYear();
  const credit = lang === 'nl'
    ? 'Privécollectie · FLF Carlebur · Mei 2026'
    : 'Private Collection · FLF Carlebur · May 2026';
  return `<footer class="site-footer"><p>${credit}</p></footer>`;
}

// ── Landing page ─────────────────────────────────────────────────────────────
function renderLanding() {
  const en = SITE.en.landing;
  return `
  <div class="landing">
    <div class="landing-inner">
      <div class="landing-portrait">
        <img src="images/portrait.jpg" alt="François Carlebur" onerror="this.style.display='none'">
      </div>
      <h1 class="landing-name">François Carlebur</h1>
      <p class="landing-dates">1821 – 1893</p>
      <p class="landing-subtitle">${en.subtitle} / Schilderijen &amp; Aquarellen</p>
      <p class="landing-subline">${en.subline}</p>
      <p class="landing-choose">${en.chooseLanguage} / Kies uw taal</p>
      <div class="landing-buttons">
        <a class="btn btn-primary" href="#/en">${en.enterEn}</a>
        <a class="btn btn-secondary" href="#/nl">${en.enterNl}</a>
      </div>
    </div>
  </div>`;
}

// ── Home (bio summary + collection preview) ──────────────────────────────────
function renderHome(lang) {
  const t = SITE[lang];
  const firstPara = t.bio.text[0];
  const collLabel = lang === 'nl' ? 'Bekijk de collectie' : 'View the Collection';
  const bioLabel  = lang === 'nl' ? 'Lees de biografie' : 'Read the Biography';

  const featured = PAINTINGS.slice(0, 6);
  const cards = featured.map(p => paintingCard(p, lang)).join('');

  return `
  ${nav(lang)}
  <div class="page-hero">
    <div class="hero-content">
      <div class="hero-portrait">
        <img src="images/portrait.jpg" alt="François Carlebur" onerror="this.style.display='none'">
      </div>
      <div class="hero-text">
        <h1>François Carlebur</h1>
        <p class="hero-dates">1821 – 1893 · Dordrecht</p>
        <p class="hero-intro">${firstPara}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/${lang}/bio">${bioLabel}</a>
          <a class="btn btn-outline" href="#/${lang}/collection">${collLabel}</a>
        </div>
      </div>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <h2 class="section-title">${t.collection.heading}</h2>
      <p class="section-intro">${t.collection.intro}</p>
      <div class="grid grid-3">${cards}</div>
      <div class="section-cta">
        <a class="btn btn-outline" href="#/${lang}/collection">${collLabel} →</a>
      </div>
    </div>
  </section>
  ${footer(lang)}`;
}

// ── Biography ────────────────────────────────────────────────────────────────
function renderBio(lang) {
  const t = SITE[lang];
  const paras = t.bio.text.map(p => `<p>${p}</p>`).join('');
  return `
  ${nav(lang)}
  <div class="page-header">
    <div class="container">
      <h1>${t.bio.heading}</h1>
      <p class="page-sub">François Carlebur (1821–1893)</p>
    </div>
  </div>
  <section class="section">
    <div class="container container-narrow">
      <div class="bio-portrait">
        <img src="images/portrait.jpg" alt="François Carlebur" onerror="this.parentElement.style.display='none'">
        <p class="caption">François Carlebur (1821–1893)</p>
      </div>
      <div class="bio-text">${paras}</div>
    </div>
  </section>
  <section class="section section-alt">
    <div class="container">
      <h2 class="section-title">${lang === 'nl' ? 'Oeuvre — Overzicht' : 'Oeuvre — Overview'}</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-num">104</span>
          <span class="stat-label">${lang === 'nl' ? 'Bekende werken' : 'Known works'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">46</span>
          <span class="stat-label">${lang === 'nl' ? 'Aquarellen' : 'Watercolours'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">42</span>
          <span class="stat-label">${lang === 'nl' ? 'Olieverfschilderijen' : 'Oil paintings'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">19</span>
          <span class="stat-label">${lang === 'nl' ? 'Werken in deze collectie' : 'Works in this collection'}</span>
        </div>
      </div>
      <div class="turning-point">
        <h3>${lang === 'nl' ? 'Het Omslagpunt (1862–1865)' : 'The Turning Point (1862–1865)'}</h3>
        <p>${lang === 'nl'
          ? 'Er is een duidelijk \'omslagpunt\' in zijn gedateerde werk tussen 1862 en 1865: een hiaat in de productie, tegelijkertijd het moment waarop hij van voornamelijk aquarellen overstapt naar olieverfschilderijen. Voor 1861 was 68,9% van zijn werk in aquarel; na 1865 domineert olieverf met 83,7%.'
          : 'There is a clear \'turning point\' in his dated work between 1862 and 1865: a gap in production, coinciding with a decisive shift from watercolours to oil paintings. Before 1861, 68.9% of his work was in watercolour; after 1865, oil painting dominates at 83.7%.'
        }</p>
      </div>
    </div>
  </section>
  ${footer(lang)}`;
}

// ── Collection index ─────────────────────────────────────────────────────────
function renderCollection(lang) {
  const t = SITE[lang];
  const cats = t.collection.categories;
  const filterBtns = Object.entries(cats).map(([key, label]) =>
    `<button class="filter-btn" data-cat="${key}">${label}</button>`
  ).join('');

  const cards = PAINTINGS.map(p => paintingCard(p, lang)).join('');

  return `
  ${nav(lang)}
  <div class="page-header">
    <div class="container">
      <h1>${t.collection.heading}</h1>
      <p class="page-sub">${lang === 'nl' ? '19 werken · Mei 2026' : '19 works · May 2026'}</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <p class="section-intro">${t.collection.intro}</p>
      <div class="filter-bar">
        <button class="filter-btn active" data-cat="all">${t.collection.filterAll}</button>
        ${filterBtns}
      </div>
      <div class="grid grid-3" id="painting-grid">${cards}</div>
    </div>
  </section>
  ${footer(lang)}`;
}

function bindFilters(lang) {
  setTimeout(() => {
    const btns = document.querySelectorAll('.filter-btn');
    const grid = document.getElementById('painting-grid');
    if (!btns.length || !grid) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        grid.querySelectorAll('.painting-card').forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }, 50);
}

// ── Painting card ────────────────────────────────────────────────────────────
function paintingCard(painting, lang) {
  const p = painting[lang];
  const imgSrc = `images/painting-${painting.id}.jpg`;
  const dateStr = painting.dated ? painting.date : SITE[lang].detail.undated;
  return `
  <a class="painting-card" data-cat="${painting.category}" href="#/${lang}/painting/${painting.id}">
    <div class="card-img">
      <img src="${imgSrc}" alt="${p.title}"
           onerror="this.parentElement.classList.add('no-img');this.style.display='none'">
      <div class="card-img-placeholder"><span>[${painting.id}]</span></div>
    </div>
    <div class="card-body">
      <p class="card-id">[${painting.id}]  ·  ${dateStr}</p>
      <h3 class="card-title">${p.title}</h3>
      <p class="card-medium">${p.medium}</p>
      <p class="card-dim">${p.dimensions}</p>
    </div>
  </a>`;
}

// ── Painting detail ──────────────────────────────────────────────────────────
function renderPainting(lang, id) {
  const painting = PAINTINGS.find(p => p.id === id);
  if (!painting) return renderHome(lang);

  const t = SITE[lang];
  const p = painting[lang];
  const dt = t.detail;
  const dateStr = painting.dated ? painting.date : dt.undated;
  const imgSrc = `images/painting-${painting.id}.jpg`;

  const catKey = painting.category;
  const catLabel = t.collection.categories[catKey] || p.categoryLabel;

  const allIds = PAINTINGS.map(x => x.id);
  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;
  const prevLabel = lang === 'nl' ? '← Vorige' : '← Previous';
  const nextLabel = lang === 'nl' ? 'Volgende →' : 'Next →';

  return `
  ${nav(lang)}
  <section class="section">
    <div class="container">
      <a class="back-link" href="#/${lang}/collection">${dt.backToCollection}</a>
      <div class="detail-grid">
        <div class="detail-img-wrap">
          <div class="detail-img-box">
            <img src="${imgSrc}" alt="${p.title}"
                 onerror="this.parentElement.classList.add('no-img-detail');this.style.display='none'">
            <div class="detail-img-placeholder">
              <span>[${painting.id}]</span>
              <small>${dt.imageCredit} <code>images/painting-${painting.id}.jpg</code></small>
            </div>
          </div>
        </div>
        <div class="detail-info">
          <p class="detail-id">[${painting.id}]</p>
          <h1 class="detail-title">${p.title}</h1>
          <table class="detail-table">
            <tr><th>${dt.date}</th><td>${dateStr}</td></tr>
            <tr><th>${dt.medium}</th><td>${p.medium}</td></tr>
            <tr><th>${dt.dimensions}</th><td>${p.dimensions}</td></tr>
            <tr><th>${dt.category}</th><td>${catLabel}</td></tr>
            <tr><th>${dt.acquisition}</th><td>${p.acquisition}</td></tr>
          </table>
          <h2 class="detail-desc-heading">${dt.description}</h2>
          <p class="detail-desc">${p.description}</p>
        </div>
      </div>
      <div class="detail-nav">
        ${prevId ? `<a class="btn btn-outline" href="#/${lang}/painting/${prevId}">${prevLabel}</a>` : '<span></span>'}
        <a class="btn btn-outline" href="#/${lang}/collection">${dt.backToCollection}</a>
        ${nextId ? `<a class="btn btn-outline" href="#/${lang}/painting/${nextId}">${nextLabel}</a>` : '<span></span>'}
      </div>
    </div>
  </section>
  ${footer(lang)}`;
}
