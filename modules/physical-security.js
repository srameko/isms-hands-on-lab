/* Module 2 — Physical Security: find the weaknesses on the floor plan */
(function () {
  'use strict';

  const tr = ISMS.tr;

  // x/y are positions on the 720x480 SVG floor plan
  const HOTSPOTS = [
    { id: 'door',    label: '1', x: 512, y: 108, weakness: true,
      name: { en: 'Server room door propped open', cs: 'Dveře serverovny podepřené otevřené' },
      why: { en: 'Bypasses badge/access control entirely.', cs: 'Zcela obchází kontrolu přístupu pomocí karty.' } },
    { id: 'sticky',  label: '2', x: 200, y: 200, weakness: true,
      name: { en: 'Sticky note with password on monitor', cs: 'Papírek s heslem nalepený na monitoru' },
      why: { en: 'Credential exposure to anyone passing by.', cs: 'Přihlašovací údaje jsou vystaveny komukoli, kdo jde kolem.' } },
    { id: 'tailgate',label: '3', x: 84,  y: 388, weakness: true,
      name: { en: 'Person holding door for someone carrying boxes', cs: 'Osoba podržující dveře někomu s krabicemi v rukou' },
      why: { en: 'Tailgating — no badge check.', cs: 'Tailgating — bez kontroly přístupové karty.' } },
    { id: 'badge',   label: '4', x: 208, y: 396, weakness: true,
      name: { en: 'Visitor badge left unattended at reception', cs: 'Návštěvnická karta ponechaná bez dozoru na recepci' },
      why: { en: 'Can be taken and reused.', cs: 'Kdokoli si ji může vzít a zneužít.' } },
    { id: 'window',  label: '5', x: 74,  y: 160, weakness: true,
      name: { en: 'Monitor visible from ground-floor street window', cs: 'Monitor viditelný z okna do ulice v přízemí' },
      why: { en: 'Shoulder surfing / visual data leakage.', cs: 'Shoulder surfing / únik dat vizuálním pozorováním.' } },
    { id: 'clean',   label: '6', x: 622, y: 170, weakness: true,
      name: { en: 'Cleaning staff working alone in server room', cs: 'Úklidový personál sám v serverovně' },
      why: { en: 'Unsupervised access to sensitive area.', cs: 'Nekontrolovaný přístup do citlivého prostoru.' } },
    { id: 'cabinet', label: '7', x: 386, y: 300, weakness: true,
      name: { en: 'Locked filing cabinet with key in the lock', cs: 'Uzamčená kartotéka s klíčem ponechaným v zámku' },
      why: { en: 'Physical lock defeated by leaving key accessible.', cs: 'Fyzický zámek je zbytečný, když je klíč volně dostupný.' } },
    { id: 'fire',    label: '8', x: 466, y: 408, weakness: false,
      name: { en: 'Fire extinguisher clearly signed and accessible', cs: 'Hasicí přístroj zřetelně označený a dostupný' },
      why: { en: 'This is correct practice, not a weakness.', cs: 'Toto je správná praxe, ne slabina.' } },
    { id: 'cctv',    label: '9', x: 330, y: 430, weakness: false,
      name: { en: 'CCTV camera covering main entrance', cs: 'Kamerový systém pokrývající hlavní vchod' },
      why: { en: 'Correct control in place.', cs: 'Správně nastavené opatření.' } }
  ];

  const POINTS_PER = 10;
  const MAX = HOTSPOTS.length * POINTS_PER; // 90

  function planSvg() {
    const officeLabel = tr({ en: 'OPEN OFFICE', cs: 'OPEN OFFICE' });
    const streetLabel = tr({ en: 'street window', cs: 'okno do ulice' });
    const serverLabel = tr({ en: 'SERVER ROOM', cs: 'SERVEROVNA' });
    const archiveLabel = tr({ en: 'ARCHIVE', cs: 'ARCHIV' });
    const receptionLabel = tr({ en: 'RECEPTION', cs: 'RECEPCE' });
    const entranceLabel = tr({ en: 'main entrance', cs: 'hlavní vchod' });
    return (
      '<svg viewBox="0 0 720 480" role="img" aria-label="' + tr({ en: 'Office floor plan', cs: 'Půdorys kanceláře' }) + '">' +
      '<rect x="0" y="0" width="720" height="480" fill="#f0eef6"/>' +
      // outer walls
      '<rect x="20" y="20" width="680" height="440" fill="#ffffff" stroke="#2D2E83" stroke-width="4"/>' +
      // open office (left)
      '<rect x="40" y="40" width="380" height="260" fill="#eef7fb" stroke="#b9b6cc" stroke-width="2"/>' +
      '<text x="60" y="66" font-size="15" font-weight="800" fill="#2D2E83" font-family="Open Sans, sans-serif">' + officeLabel + '</text>' +
      // desks
      '<rect x="120" y="150" width="90" height="40" rx="4" fill="#d7d4e6"/>' +
      '<rect x="250" y="150" width="90" height="40" rx="4" fill="#d7d4e6"/>' +
      '<rect x="120" y="230" width="90" height="40" rx="4" fill="#d7d4e6"/>' +
      '<rect x="250" y="230" width="90" height="40" rx="4" fill="#d7d4e6"/>' +
      // street window on the left wall
      '<rect x="16" y="110" width="8" height="110" fill="#00BFE7"/>' +
      '<text x="34" y="128" font-size="11" fill="#666" font-family="Open Sans, sans-serif">' + streetLabel + '</text>' +
      // server room (top right)
      '<rect x="460" y="40" width="220" height="180" fill="#fdeef6" stroke="#b9b6cc" stroke-width="2"/>' +
      '<text x="478" y="66" font-size="15" font-weight="800" fill="#2D2E83" font-family="Open Sans, sans-serif">' + serverLabel + '</text>' +
      '<rect x="500" y="130" width="34" height="70" rx="3" fill="#c9c5dd"/>' +
      '<rect x="560" y="130" width="34" height="70" rx="3" fill="#c9c5dd"/>' +
      // server room doorway (gap)
      '<line x1="460" y1="90" x2="460" y2="130" stroke="#ffffff" stroke-width="4"/>' +
      // storage / archive (middle right)
      '<rect x="340" y="260" width="150" height="90" fill="#fbf6ea" stroke="#b9b6cc" stroke-width="2"/>' +
      '<text x="352" y="282" font-size="13" font-weight="800" fill="#2D2E83" font-family="Open Sans, sans-serif">' + archiveLabel + '</text>' +
      // reception (bottom)
      '<rect x="40" y="340" width="300" height="100" fill="#f2f9ec" stroke="#b9b6cc" stroke-width="2"/>' +
      '<text x="56" y="364" font-size="15" font-weight="800" fill="#2D2E83" font-family="Open Sans, sans-serif">' + receptionLabel + '</text>' +
      // entrance
      '<rect x="60" y="452" width="70" height="10" fill="#E6007E"/>' +
      '<text x="140" y="462" font-size="11" fill="#666" font-family="Open Sans, sans-serif">' + entranceLabel + '</text>' +
      '<g id="hotspots"></g>' +
      '</svg>'
    );
  }

  function render(container) {
    const picked = new Set();

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'You’re walking through this office on a security audit. Tap every numbered spot you consider a physical security weakness — but beware, some spots are perfectly fine. Then check your findings.',
      cs: 'Procházíš touto kanceláří v rámci bezpečnostního auditu. Klepni na každé očíslované místo, které považuješ za slabinu fyzické bezpečnosti — pozor, některá místa jsou naprosto v pořádku. Poté zkontroluj svá zjištění.'
    });
    container.appendChild(intro);

    const wrap = document.createElement('div');
    wrap.className = 'floorplan-wrap card';
    wrap.innerHTML = planSvg();
    container.appendChild(wrap);

    const legend = document.createElement('div');
    legend.className = 'card';
    legend.innerHTML = '<h3>' + tr({ en: 'Spots', cs: 'Místa' }) + '</h3><ol style="margin:0;padding-left:1.3rem">' +
      HOTSPOTS.map(h => '<li id="leg-' + h.id + '">' + tr(h.name) + '</li>').join('') +
      '</ol>';
    container.appendChild(legend);

    const g = wrap.querySelector('#hotspots');
    const svgNS = 'http://www.w3.org/2000/svg';
    HOTSPOTS.forEach(h => {
      const grp = document.createElementNS(svgNS, 'g');
      grp.setAttribute('class', 'hotspot');
      grp.setAttribute('id', 'hs-' + h.id);
      grp.setAttribute('tabindex', '0');
      grp.setAttribute('role', 'button');
      grp.setAttribute('aria-label', tr(h.name));
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', h.x); c.setAttribute('cy', h.y); c.setAttribute('r', 15);
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', h.x); t.setAttribute('y', h.y + 4);
      t.setAttribute('text-anchor', 'middle');
      t.textContent = h.label;
      grp.appendChild(c); grp.appendChild(t);
      function toggle() {
        if (grp.dataset.locked) return;
        if (picked.has(h.id)) { picked.delete(h.id); grp.classList.remove('picked'); }
        else { picked.add(h.id); grp.classList.add('picked'); }
      }
      grp.addEventListener('click', toggle);
      grp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      g.appendChild(grp);
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    const check = document.createElement('button');
    check.className = 'btn btn-primary';
    check.textContent = tr({ en: 'Check my findings', cs: 'Zkontrolovat moje zjištění' });
    actions.appendChild(check);
    container.appendChild(actions);

    const resultSlot = document.createElement('div');
    container.appendChild(resultSlot);

    check.addEventListener('click', () => {
      check.disabled = true;
      let score = 0;
      HOTSPOTS.forEach(h => {
        const grp = wrap.querySelector('#hs-' + h.id);
        grp.dataset.locked = '1';
        grp.classList.remove('picked');
        const chose = picked.has(h.id);
        const correct = chose === h.weakness;
        if (correct) score += POINTS_PER;
        grp.classList.add(correct ? 'reveal-hit' : 'reveal-miss');
        const li = legend.querySelector('#leg-' + h.id);
        li.innerHTML = tr(h.name) +
          ' <span class="feedback-line ' + (correct ? 'ok' : 'bad') + '" style="display:block">' +
          (correct ? '✓ ' : '✗ ') +
          (h.weakness ? tr({ en: 'Weakness — ', cs: 'Slabina — ' }) : tr({ en: 'Not a weakness — ', cs: 'Není to slabina — ' })) + tr(h.why) + '</span>';
      });
      ISMS.showResult(resultSlot, 'physical-security', score, MAX);
    });
  }

  ISMS.registerModule({
    id: 'physical-security',
    title: { en: 'Physical Security', cs: 'Fyzická bezpečnost' },
    icon: '🏢',
    maxScore: MAX,
    render
  });
})();
