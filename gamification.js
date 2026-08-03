/* ISMS Hands-On Lab — shared core: login, storage, tabs, scoring, i18n (CS/EN) */
(function () {
  'use strict';

  const STORAGE_KEY = 'isms-lab-progress';
  const modules = [];        // registration order = tab order
  let state = { name: null, modules: {}, lang: 'cs', theme: null }; // theme: null = auto, 'light', 'dark'
  let activeId = null;

  /* ---------- i18n ---------- */
  const I18N = {
    en: {
      loginTitle: 'Welcome!',
      loginDesc: 'Enter your name so the lab can track your progress on this device.',
      loginPlaceholder: 'Your name',
      loginButton: 'Start the lab',
      loginNote: 'Your name and score stay in this browser only — nothing is sent anywhere.',
      changeName: 'Change name',
      badge: '🏅 Security Analyst',
      modulesWord: 'modules',
      footer: 'Czechitas — Information Security Specialist · practice companion to the ISMS lectures',
      tierChampion: 'Security Champion 🏆',
      tierSolid: 'Solid grasp 💪',
      tierWeak: 'Worth a second look 🔍',
      bestSoFar: 'Your best so far: <strong>{best}</strong> — best score is what counts.',
      tryAgain: 'Try again',
      notAttempted: 'Not attempted yet',
      bestLine: 'Best: {score} / {max} · attempts: {attempts}',
      themeAuto: 'Match system theme',
      themeLight: 'Light theme',
      themeDark: 'Dark theme',
      certTabTitle: 'Certificate',
      certTitle: 'Certificate of Completion',
      certIntro: 'Awarded for completing all modules of the ISMS Hands-On Lab.',
      certDate: 'Date:',
      certScore: 'Total score:',
      certPrint: 'Print / save as PDF'
    },
    cs: {
      loginTitle: 'Vítej!',
      loginDesc: 'Zadej své jméno, aby si lab mohl v tomto prohlížeči pamatovat tvůj postup.',
      loginPlaceholder: 'Tvoje jméno',
      loginButton: 'Spustit lab',
      loginNote: 'Tvoje jméno a skóre zůstávají jen v tomto prohlížeči — nikam se neodesílají.',
      changeName: 'Změnit jméno',
      badge: '🏅 Bezpečnostní analýza zvládnuta',
      modulesWord: 'modulů',
      footer: 'Czechitas — Specialistka informační bezpečnosti · doprovodné cvičení k přednáškám ISMS',
      tierChampion: 'Mistrovský výkon 🏆',
      tierSolid: 'Solidní znalosti 💪',
      tierWeak: 'Stojí za to zopakovat 🔍',
      bestSoFar: 'Tvoje dosavadní nejlepší skóre: <strong>{best}</strong> — počítá se to nejlepší.',
      tryAgain: 'Zkusit znovu',
      notAttempted: 'Zatím nevyzkoušeno',
      bestLine: 'Nejlepší: {score} / {max} · pokusů: {attempts}',
      themeAuto: 'Podle systému',
      themeLight: 'Světlý motiv',
      themeDark: 'Tmavý motiv',
      certTabTitle: 'Certifikát',
      certTitle: 'Certifikát o dokončení',
      certIntro: 'Uděleno za dokončení všech modulů ISMS Hands-On Labu.',
      certDate: 'Datum:',
      certScore: 'Celkové skóre:',
      certPrint: 'Vytisknout / uložit jako PDF'
    }
  };

  function lang() { return state.lang === 'en' ? 'en' : 'cs'; }

  function t(key, vars) {
    let s = (I18N[lang()] && I18N[lang()][key]) || I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  // pick localized text out of a { en, cs } object provided by a module
  function tr(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang()] || obj.en || obj.cs || '';
  }

  /* ---------- storage (graceful without localStorage) ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = Object.assign({ name: null, modules: {}, lang: 'cs', theme: null }, JSON.parse(raw));
    } catch (e) { /* private mode etc. — run without persistence */ }
    if (state.lang !== 'en' && state.lang !== 'cs') state.lang = 'cs';
    if (state.theme !== 'light' && state.theme !== 'dark') state.theme = null;
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------- scoring ---------- */
  function moduleState(id) {
    return state.modules[id] || { score: 0, maxScore: 0, completed: false, attempts: 0 };
  }

  function reportScore(id, score, maxScore) {
    const prev = moduleState(id);
    const best = Math.max(prev.score || 0, score);
    state.modules[id] = {
      score: best, maxScore: maxScore,
      completed: true,
      attempts: (prev.attempts || 0) + 1
    };
    save();
    updateHeader();
    updateTabs();
    if (score === maxScore) confetti();
    return best;
  }

  function tier(score, maxScore) {
    const pct = maxScore ? score / maxScore : 0;
    if (pct >= 0.9) return t('tierChampion');
    if (pct >= 0.6) return t('tierSolid');
    return t('tierWeak');
  }

  function medal(score, maxScore) {
    const pct = maxScore ? score / maxScore : 0;
    if (pct >= 0.9) return '🥇';
    if (pct >= 0.75) return '🥈';
    if (pct >= 0.6) return '🥉';
    return '';
  }

  function totals() {
    let total = 0, max = 0, done = 0;
    modules.forEach(m => {
      max += m.maxScore;
      const s = moduleState(m.id);
      total += s.score || 0;
      if (s.completed) done++;
    });
    return { total, max, done, count: modules.length };
  }

  /* ---------- header / tabs ---------- */
  function updateHeader() {
    const tt = totals();
    document.getElementById('total-score').textContent = tt.total;
    document.getElementById('max-score').textContent = tt.max;
    document.getElementById('modules-done').textContent = tt.done;
    document.getElementById('modules-total').textContent = tt.count;
    document.getElementById('modules-word').textContent = t('modulesWord');
    document.getElementById('progress-fill').style.width =
      (tt.count ? (tt.done / tt.count) * 100 : 0) + '%';
    document.getElementById('header-name').textContent = state.name || '';
    document.getElementById('header-badge').textContent = t('badge');
    document.getElementById('header-badge').classList.toggle('hidden', tt.done < tt.count);
    updateCertTab();
  }

  function updateTabs() {
    modules.forEach(m => {
      const btn = document.getElementById('tab-' + m.id);
      if (!btn) return;
      const s = moduleState(m.id);
      btn.classList.toggle('done', !!s.completed);
      btn.classList.toggle('active', m.id === activeId);
      btn.querySelector('.tab-check').textContent = s.completed ? (medal(s.score, s.maxScore) || '✓') : '';
    });
  }

  function updateCertTab() {
    const btn = document.getElementById('tab-certificate');
    if (!btn) return;
    const tt = totals();
    btn.classList.toggle('hidden', tt.count === 0 || tt.done < tt.count);
    btn.classList.toggle('active', activeId === 'certificate');
  }

  function buildTabs() {
    const nav = document.getElementById('tabs');
    nav.innerHTML = '';
    modules.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'tab';
      btn.id = 'tab-' + m.id;
      btn.innerHTML =
        '<span class="tab-icon">' + m.icon + '</span>' +
        '<span>' + tr(m.title) + '</span>' +
        '<span class="tab-check"></span>';
      btn.addEventListener('click', () => show(m.id));
      nav.appendChild(btn);
    });
    const certBtn = document.createElement('button');
    certBtn.className = 'tab cert-tab done hidden';
    certBtn.id = 'tab-certificate';
    certBtn.innerHTML =
      '<span class="tab-icon">🎓</span>' +
      '<span>' + t('certTabTitle') + '</span>' +
      '<span class="tab-check"></span>';
    certBtn.addEventListener('click', () => showCertificate());
    nav.appendChild(certBtn);
    updateTabs();
    updateCertTab();
  }

  function show(id) {
    const m = modules.find(x => x.id === id);
    if (!m) return;
    activeId = id;
    const container = document.getElementById('module-container');
    container.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'module-header';
    const s = moduleState(id);
    const medalIcon = s.completed ? medal(s.score, s.maxScore) : '';
    head.innerHTML =
      '<h2>' + m.icon + ' ' + tr(m.title) + '</h2>' +
      '<span class="module-best">' +
      (s.completed ? (medalIcon ? medalIcon + ' ' : '') + t('bestLine', { score: s.score, max: m.maxScore, attempts: s.attempts }) : t('notAttempted')) +
      '</span>';
    container.appendChild(head);

    const body = document.createElement('div');
    container.appendChild(body);
    m.render(body);
    updateTabs();
    window.scrollTo({ top: 0 });
  }

  /* ---------- shared result screen ---------- */
  function showResult(container, id, score, maxScore, retryLabel) {
    const best = reportScore(id, score, maxScore);
    const div = document.createElement('div');
    div.className = 'result-screen card';
    const medalIcon = medal(score, maxScore);
    div.innerHTML =
      '<div class="result-score">' + score + ' / ' + maxScore + '</div>' +
      '<div class="result-tier">' + (medalIcon ? medalIcon + ' ' : '') + tier(score, maxScore) + '</div>' +
      (best > score ? '<p>' + t('bestSoFar', { best: best }) + '</p>' : '') +
      '<div class="actions" style="justify-content:center">' +
      '<button class="btn btn-secondary" data-retry>' + (retryLabel || t('tryAgain')) + '</button>' +
      '</div>';
    div.querySelector('[data-retry]').addEventListener('click', () => show(id));
    container.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- certificate ---------- */
  function showCertificate() {
    activeId = 'certificate';
    const container = document.getElementById('module-container');
    container.innerHTML = '';
    const tt = totals();
    const dateStr = new Date().toLocaleDateString(lang() === 'cs' ? 'cs-CZ' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const overallMedal = medal(tt.total, tt.max);

    const card = document.createElement('div');
    card.className = 'certificate card';
    card.innerHTML =
      '<div class="cert-badge">🎓</div>' +
      '<h2 class="cert-title">' + t('certTitle') + '</h2>' +
      '<p class="cert-intro">' + t('certIntro') + '</p>' +
      '<div class="cert-name">' + (state.name || '') + '</div>' +
      '<div class="cert-meta">' +
        '<span>' + t('certDate') + ' ' + dateStr + '</span>' +
        '<span>' + t('certScore') + ' ' + tt.total + ' / ' + tt.max + '</span>' +
        '<span>' + (overallMedal ? overallMedal + ' ' : '') + tier(tt.total, tt.max) + '</span>' +
      '</div>' +
      '<div class="cert-modules">' +
        modules.map(m => {
          const s = moduleState(m.id);
          return '<div class="cert-module">' +
            '<span class="cert-module-icon">' + m.icon + '</span>' +
            '<span class="cert-module-name">' + tr(m.title) + '</span>' +
            '<span class="cert-module-score">' + (medal(s.score, s.maxScore) || '✓') + ' ' + s.score + '/' + s.maxScore + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="actions no-print" style="justify-content:center">' +
        '<button class="btn btn-primary" data-print>' + t('certPrint') + '</button>' +
      '</div>';
    card.querySelector('[data-print]').addEventListener('click', () => window.print());
    container.appendChild(card);

    updateTabs();
    updateHeader();
    window.scrollTo({ top: 0 });
  }

  /* ---------- confetti (pure CSS/JS, lightweight) ---------- */
  function confetti() {
    const layer = document.getElementById('confetti-layer');
    const colors = ['#E6007E', '#00BFE7', '#FFCB04', '#8CC63E', '#F36F21', '#91268F'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      layer.appendChild(p);
      setTimeout(() => p.remove(), 3400);
    }
  }

  /* ---------- static text (login card, footer, switches) ---------- */
  function applyStaticText() {
    document.documentElement.lang = lang();
    document.getElementById('login-title').textContent = t('loginTitle');
    document.getElementById('login-desc').textContent = t('loginDesc');
    document.getElementById('login-name').placeholder = t('loginPlaceholder');
    document.getElementById('login-btn').textContent = t('loginButton');
    document.getElementById('login-note').textContent = t('loginNote');
    document.getElementById('change-name').title = t('changeName');
    document.getElementById('app-footer-text').textContent = t('footer');
    document.querySelectorAll('.switch-btn[data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang());
    });
    document.querySelectorAll('.switch-btn[data-theme="auto"]').forEach(b => { b.title = t('themeAuto'); });
    document.querySelectorAll('.switch-btn[data-theme="light"]').forEach(b => { b.title = t('themeLight'); });
    document.querySelectorAll('.switch-btn[data-theme="dark"]').forEach(b => { b.title = t('themeDark'); });
  }

  function setLang(l) {
    if (l !== 'en' && l !== 'cs') return;
    if (state.lang === l) return;
    state.lang = l;
    save();
    applyStaticText();
    buildTabs();
    updateHeader();
    if (activeId === 'certificate') showCertificate();
    else if (activeId) show(activeId);
  }

  function initLangSwitch() {
    document.querySelectorAll('.switch-btn[data-lang]').forEach(b => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
  }

  /* ---------- theme (light / dark / auto) ---------- */
  function applyTheme() {
    if (state.theme === 'light' || state.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', state.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    document.querySelectorAll('.switch-btn[data-theme]').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === (state.theme || 'auto'));
    });
  }

  function setTheme(th) {
    state.theme = (th === 'light' || th === 'dark') ? th : null;
    save();
    applyTheme();
  }

  function initThemeSwitch() {
    document.querySelectorAll('.switch-btn[data-theme]').forEach(b => {
      b.addEventListener('click', () => setTheme(b.dataset.theme));
    });
  }

  /* ---------- login ---------- */
  function initLogin() {
    const overlay = document.getElementById('login-overlay');
    const app = document.getElementById('app');
    const input = document.getElementById('login-name');
    const btn = document.getElementById('login-btn');

    function enter() {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      state.name = name;
      save();
      overlay.classList.add('hidden');
      app.classList.remove('hidden');
      updateHeader();
    }
    btn.addEventListener('click', enter);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') enter(); });

    document.getElementById('change-name').addEventListener('click', () => {
      input.value = state.name || '';
      app.classList.add('hidden');
      overlay.classList.remove('hidden');
      input.focus();
    });

    if (state.name) {
      overlay.classList.add('hidden');
      app.classList.remove('hidden');
    } else {
      overlay.classList.remove('hidden');
      input.focus();
    }
  }

  /* ---------- public API ---------- */
  window.ISMS = {
    registerModule(mod) { modules.push(mod); },
    showResult,
    lang,
    tr,
    t,
    boot() {
      load();
      applyStaticText();
      initLangSwitch();
      applyTheme();
      initThemeSwitch();
      buildTabs();
      initLogin();
      updateHeader();
      updateTabs();
      if (modules.length) show(modules[0].id);
    }
  };
})();
