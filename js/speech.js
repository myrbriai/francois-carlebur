/* ── Text-to-speech using the Web Speech API ──────────────────────────────── */
const Speech = (() => {
  if (!window.speechSynthesis) return { toggle() {}, stop() {} };

  const synth = window.speechSynthesis;
  let utterance = null;
  let state = 'idle'; // 'idle' | 'playing' | 'paused'
  let voices = [];

  // Chrome loads voices asynchronously
  function loadVoices() {
    voices = synth.getVoices();
    if (!voices.length) {
      synth.addEventListener('voiceschanged', () => { voices = synth.getVoices(); }, { once: true });
    }
  }
  loadVoices();

  // ── Icons ────────────────────────────────────────────────────────────────
  const ICONS = {
    speaker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>`,
    pause:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>`,
    play:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>`,
  };

  // ── Language helpers ─────────────────────────────────────────────────────
  function getCurrentLang() {
    return (window.location.hash || '').startsWith('#/nl') ? 'nl' : 'en';
  }

  function getBestVoice(lang) {
    voices = synth.getVoices();
    const code = lang === 'nl' ? 'nl' : 'en';
    // Prefer local (on-device) voices; fall back to any matching lang
    return voices.find(v => v.lang.toLowerCase().startsWith(code) && v.localService)
        || voices.find(v => v.lang.toLowerCase().startsWith(code))
        || null;
  }

  // ── Text extraction ──────────────────────────────────────────────────────
  function getReadableText() {
    const app = document.getElementById('app');
    if (!app) return '';

    // Painting detail page
    const detailTitle = app.querySelector('.detail-title');
    if (detailTitle) {
      const parts = [detailTitle.innerText.trim()];
      app.querySelectorAll('.detail-table tr').forEach(row => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) parts.push(`${th.innerText.trim()}: ${td.innerText.trim()}`);
      });
      const desc = app.querySelector('.detail-desc');
      if (desc) parts.push(desc.innerText.trim());
      return parts.join('. ');
    }

    // Biography page
    const bioText = app.querySelector('.bio-text');
    if (bioText) {
      const heading = app.querySelector('.page-header h1');
      const tp = app.querySelector('.turning-point');
      const parts = [];
      if (heading) parts.push(heading.innerText.trim());
      parts.push(bioText.innerText.trim());
      if (tp) parts.push(tp.innerText.trim());
      return parts.join('. ');
    }

    // Home page (hero)
    const heroText = app.querySelector('.hero-text');
    if (heroText) {
      const parts = [heroText.innerText.trim()];
      const intro = app.querySelector('.section-intro');
      if (intro) parts.push(intro.innerText.trim());
      return parts.join('. ');
    }

    // Collection page
    const pageHeader = app.querySelector('.page-header h1');
    const sectionIntro = app.querySelector('.section-intro');
    if (pageHeader && sectionIntro) {
      return [pageHeader.innerText.trim(), sectionIntro.innerText.trim()].join('. ');
    }

    // Landing page
    const landing = app.querySelector('.landing-inner');
    if (landing) return landing.innerText.trim();

    // Generic fallback: strip nav/footer/buttons
    const clone = app.cloneNode(true);
    clone.querySelectorAll('nav, footer, button, .filter-bar, .detail-nav, .back-link, a.btn, .card-id').forEach(el => el.remove());
    return (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // ── State & UI ───────────────────────────────────────────────────────────
  function setState(newState) {
    state = newState;
    updateBtn();
  }

  function updateBtn() {
    const btn = document.getElementById('speech-btn');
    if (!btn) return;

    const lang = getCurrentLang();
    const LABELS = {
      nl: { idle: 'Voorlezen', playing: 'Pauzeer', paused: 'Hervat' },
      en: { idle: 'Read aloud', playing: 'Pause', paused: 'Resume' },
    };

    btn.className = `speech-btn speech-${state}`;
    btn.querySelector('.speech-icon').innerHTML =
      state === 'playing' ? ICONS.pause :
      state === 'paused'  ? ICONS.play  : ICONS.speaker;
    btn.querySelector('.speech-label').textContent = LABELS[lang][state];
    btn.setAttribute('aria-label', LABELS[lang][state]);
  }

  // ── Core controls ────────────────────────────────────────────────────────
  function startSpeaking() {
    synth.cancel();
    const text = getReadableText();
    if (!text) return;

    const lang = getCurrentLang();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = lang === 'nl' ? 'nl-NL' : 'en-GB';
    utterance.rate   = 0.93;
    utterance.pitch  = 1;
    utterance.volume = 1;

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onstart  = () => setState('playing');
    utterance.onend    = () => setState('idle');
    utterance.onpause  = () => setState('paused');
    utterance.onresume = () => setState('playing');
    utterance.onerror  = (e) => { if (e.error !== 'interrupted') setState('idle'); };

    synth.speak(utterance);
  }

  function toggle() {
    if (state === 'idle')    { startSpeaking(); }
    else if (state === 'playing') { synth.pause();  setState('paused'); }
    else                     { synth.resume(); setState('playing'); }
  }

  function stop() {
    synth.cancel();
    setState('idle');
  }

  // Stop on navigation; refresh button label for new language
  window.addEventListener('hashchange', () => {
    stop();
    setTimeout(updateBtn, 80); // wait for hash to settle
  });

  // Initialise button icon after DOM loads
  document.addEventListener('DOMContentLoaded', updateBtn);

  return { toggle, stop };
})();
