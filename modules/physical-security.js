/* Module 2 — Physical Security: find the weaknesses on the floor plan */
(function () {
  'use strict';

  const tr = ISMS.tr;

  // x/y are fixed positions on the 720x480 SVG floor plan, shared by every difficulty level
  const POSITIONS = [
    { id: 'door',    label: '1', x: 512, y: 108 },
    { id: 'sticky',  label: '2', x: 200, y: 200 },
    { id: 'tailgate',label: '3', x: 84,  y: 388 },
    { id: 'badge',   label: '4', x: 208, y: 396 },
    { id: 'window',  label: '5', x: 74,  y: 160 },
    { id: 'clean',   label: '6', x: 622, y: 170 },
    { id: 'cabinet', label: '7', x: 386, y: 300 },
    { id: 'fire',    label: '8', x: 466, y: 408 },
    { id: 'cctv',    label: '9', x: 330, y: 430 }
  ];

  const LEVELS = {
    easy: {
      door:    { weakness: true,
        name: { en: 'Server room door propped open with a chair', cs: 'Dveře serverovny podepřené židlí a otevřené' },
        why: { en: 'Bypasses badge/access control entirely — anyone can just walk in.', cs: 'Zcela obchází kontrolu přístupu pomocí karty — kdokoli může volně vejít.' } },
      sticky:  { weakness: true,
        name: { en: 'Password written on a sticky note stuck to the monitor', cs: 'Heslo napsané na papírku nalepeném na monitoru' },
        why: { en: 'Credentials exposed in plain sight to anyone passing by.', cs: 'Přihlašovací údaje jsou vystaveny na očích komukoli, kdo jde kolem.' } },
      tailgate:{ weakness: true,
        name: { en: 'Stranger in a delivery uniform slips in right behind an employee, no badge shown', cs: 'Cizí osoba v uniformě doručovatele proklouzne hned za zaměstnancem, bez ukázání karty' },
        why: { en: 'Classic tailgating — access gained without any badge check at all.', cs: 'Klasický tailgating — přístup získán zcela bez kontroly přístupové karty.' } },
      badge:   { weakness: true,
        name: { en: 'Unattended visitor badge lying on the reception desk, no one watching it', cs: 'Nehlídaná návštěvnická karta ležící na recepčním pultu' },
        why: { en: 'Anyone walking by can pick it up and use it to gain access.', cs: 'Kdokoli kolem procházející si ji může vzít a zneužít pro vstup.' } },
      window:  { weakness: false,
        name: { en: 'Ground-floor street window covered with opaque privacy film', cs: 'Okno do ulice v přízemí zakryté neprůhlednou bezpečnostní fólií' },
        why: { en: 'Nothing inside is visible from the street — the control is doing its job.', cs: 'Zevnitř není zvenku nic vidět — opatření plní svůj účel.' } },
      clean:   { weakness: true,
        name: { en: 'Cleaning contractor props the server room door open to move a cart through, no escort', cs: 'Úklidová firma si podepře dveře serverovny kvůli vozíku, bez doprovodu' },
        why: { en: 'Unsupervised third party with open access to a sensitive area.', cs: 'Nekontrolovaná třetí strana s otevřeným přístupem do citlivého prostoru.' } },
      cabinet: { weakness: true,
        name: { en: 'Locked filing cabinet with the key left hanging in the lock', cs: 'Uzamčená kartotéka s klíčem ponechaným v zámku' },
        why: { en: 'The lock is pointless if the key is left right there.', cs: 'Zámek je k ničemu, když je klíč ponechán přímo v něm.' } },
      fire:    { weakness: false,
        name: { en: 'Fire extinguisher clearly signed and mounted in the hallway', cs: 'Hasicí přístroj zřetelně označený a zavěšený na chodbě' },
        why: { en: 'This is correct safety practice, not a weakness.', cs: 'Toto je správná bezpečnostní praxe, ne slabina.' } },
      cctv:    { weakness: false,
        name: { en: 'CCTV camera clearly covering the main entrance', cs: 'Kamerový systém zřetelně pokrývající hlavní vchod' },
        why: { en: 'Correct control in place, working as intended.', cs: 'Správně nastavené opatření, funguje jak má.' } }
    },
    medium: {
      door:    { weakness: true,
        name: { en: 'Server room door propped open', cs: 'Dveře serverovny podepřené otevřené' },
        why: { en: 'Bypasses badge/access control entirely.', cs: 'Zcela obchází kontrolu přístupu pomocí karty.' } },
      sticky:  { weakness: true,
        name: { en: 'Sticky note with password on monitor', cs: 'Papírek s heslem nalepený na monitoru' },
        why: { en: 'Credential exposure to anyone passing by.', cs: 'Přihlašovací údaje jsou vystaveny komukoli, kdo jde kolem.' } },
      tailgate:{ weakness: true,
        name: { en: 'Person holding door for someone carrying boxes', cs: 'Osoba podržující dveře někomu s krabicemi v rukou' },
        why: { en: 'Tailgating — no badge check.', cs: 'Tailgating — bez kontroly přístupové karty.' } },
      badge:   { weakness: true,
        name: { en: 'Visitor badge left unattended at reception', cs: 'Návštěvnická karta ponechaná bez dozoru na recepci' },
        why: { en: 'Can be taken and reused.', cs: 'Kdokoli si ji může vzít a zneužít.' } },
      window:  { weakness: true,
        name: { en: 'Monitor visible from ground-floor street window', cs: 'Monitor viditelný z okna do ulice v přízemí' },
        why: { en: 'Shoulder surfing / visual data leakage.', cs: 'Shoulder surfing / únik dat vizuálním pozorováním.' } },
      clean:   { weakness: true,
        name: { en: 'Cleaning staff working alone in server room', cs: 'Úklidový personál sám v serverovně' },
        why: { en: 'Unsupervised access to sensitive area.', cs: 'Nekontrolovaný přístup do citlivého prostoru.' } },
      cabinet: { weakness: true,
        name: { en: 'Locked filing cabinet with key in the lock', cs: 'Uzamčená kartotéka s klíčem ponechaným v zámku' },
        why: { en: 'Physical lock defeated by leaving key accessible.', cs: 'Fyzický zámek je zbytečný, když je klíč volně dostupný.' } },
      fire:    { weakness: false,
        name: { en: 'Fire extinguisher clearly signed and accessible', cs: 'Hasicí přístroj zřetelně označený a dostupný' },
        why: { en: 'This is correct practice, not a weakness.', cs: 'Toto je správná praxe, ne slabina.' } },
      cctv:    { weakness: false,
        name: { en: 'CCTV camera covering main entrance', cs: 'Kamerový systém pokrývající hlavní vchod' },
        why: { en: 'Correct control in place.', cs: 'Správně nastavené opatření.' } }
    },
    hard: {
      door:    { weakness: false,
        name: { en: 'Server room door in fail-safe unlocked mode during a supervised fire-drill test', cs: 'Dveře serverovny v režimu fail-safe (odemčeno) během dozorovaného cvičného požárního poplachu' },
        why: { en: 'Fail-safe egress during a fire event is a life-safety requirement, and it’s happening under a supervised, scheduled drill — not a security weakness.', cs: 'Fail-safe úniková cesta při požáru je požadavek na bezpečnost osob a probíhá pod dozorem v rámci plánovaného cvičení — není to bezpečnostní slabina.' } },
      sticky:  { weakness: false,
        name: { en: 'Sticky note on a monitor listing this week’s on-call phone numbers', cs: 'Papírek na monitoru s telefonními čísly aktuální pohotovosti' },
        why: { en: 'No credentials or sensitive data on it — an on-call rota isn’t a security weakness.', cs: 'Neobsahuje žádné přihlašovací údaje ani citlivá data — rozpis pohotovosti není bezpečnostní slabina.' } },
      tailgate:{ weakness: false,
        name: { en: 'Two employees badge in at the same door within a second of each other, each with their own card', cs: 'Dva zaměstnanci projdou stejnými dveřmi v rozestupu jedné vteřiny, každý s vlastní kartou' },
        why: { en: 'Both individually authenticate with a valid badge — that isn’t tailgating, even though it looks similar at a glance.', cs: 'Oba se individuálně autentizují platnou kartou — o tailgating nejde, i když to na první pohled tak vypadá.' } },
      badge:   { weakness: false,
        name: { en: 'Visitor badge that auto-expires after 4 hours, worn on a lanyard by an escorted visitor', cs: 'Návštěvnická karta s automatickým vypršením platnosti po 4 hodinách, nošená na klíčence doprovázeným návštěvníkem' },
        why: { en: 'Time-limited, worn by the visitor, and escorted — this is correct visitor management, not a weakness.', cs: 'Časově omezená, nošená návštěvníkem a s doprovodem — jde o správnou správu návštěv, ne o slabinu.' } },
      window:  { weakness: true,
        name: { en: 'Street-facing window has anti-glare privacy film, but on sunny afternoons monitor content is still faintly readable from outside', cs: 'Okno do ulice má protiodleskovou bezpečnostní fólii, ale za slunečných odpolední je obsah monitoru zvenku stále slabě čitelný' },
        why: { en: 'The film alone doesn’t fully solve the problem — screens near street-facing windows should also be angled away regardless of any film applied.', cs: 'Fólie sama problém plně neřeší — monitory u oken do ulice by měly být natočené mimo dohled bez ohledu na to, zda je fólie nalepená.' } },
      clean:   { weakness: false,
        name: { en: 'Cleaning contractor in the server room, wearing a visible contractor badge, accompanied the whole time by an IT staff member', cs: 'Úklidová firma v serverovně s viditelnou kartou dodavatele, po celou dobu v doprovodu pracovníka IT' },
        why: { en: 'Escorted the entire time by IT staff — supervised third-party access to a sensitive area is standard practice.', cs: 'Po celou dobu v doprovodu IT — dohlížený přístup třetí strany do citlivého prostoru je standardní praxe.' } },
      cabinet: { weakness: false,
        name: { en: 'Locked filing cabinet, its key stored in a badge-controlled key safe nearby', cs: 'Uzamčená kartotéka, jejíž klíč je uložen v nedalekém trezoru na klíče chráněném kartou' },
        why: { en: 'The key sits behind its own access control instead of being left exposed — proper key management.', cs: 'Klíč je uložen za vlastní kontrolou přístupu místo toho, aby byl volně dostupný — správná správa klíčů.' } },
      fire:    { weakness: true,
        name: { en: 'Fire extinguisher is mounted and signed, but its inspection tag shows it expired 14 months ago', cs: 'Hasicí přístroj je zavěšený a označený, ale jeho kontrolní štítek ukazuje, že revize vypršela před 14 měsíci' },
        why: { en: 'An expired inspection means whether the extinguisher would actually work is unverified — a real control gap, not just missing paperwork.', cs: 'Prošlá revize znamená, že funkčnost přístroje v reálné situaci není ověřena — jde o skutečnou mezeru v opatření, ne jen o chybějící papír.' } },
      cctv:    { weakness: true,
        name: { en: 'CCTV camera is mounted over the main entrance, but has been pointed at the ceiling for three weeks after a cleaning mishap, unnoticed', cs: 'Kamera je zavěšená nad hlavním vchodem, ale po nehodě při úklidu už tři týdny míří do stropu, aniž by si toho kdokoli všiml' },
        why: { en: 'A camera that isn’t recording anything useful provides no real detective control — hardware being present doesn’t mean the control is effective.', cs: 'Kamera, která nesnímá nic užitečného, neposkytuje žádnou reálnou detektivní kontrolu — přítomnost hardwaru neznamená, že opatření funguje.' } }
    }
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Clear-cut weaknesses and clearly fine controls — good for learning to spot the classics.',
      cs: 'Jednoznačné slabiny a zjevně v pořádku fungující opatření — dobré na naučení se poznávat klasiky.'
    },
    medium: {
      en: 'The original nine spots on the floor plan — a realistic mixed audit.',
      cs: 'Původních devět míst na půdorysu — reálný smíšený audit.'
    },
    hard: {
      en: 'The same spots, reframed with extra context — several answers flip once you read the details, testing real judgment.',
      cs: 'Stejná místa, převyprávěná s dalším kontextem — u několika se odpověď otočí, jakmile si přečteš detaily. Testuje skutečný úsudek.'
    }
  };

  const POINTS_PER = 10;
  const MAX = POSITIONS.length * POINTS_PER; // 90

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
    ISMS.renderDifficultyPicker(container, {
      descriptions: DESCRIPTIONS,
      onPick(level) {
        container.innerHTML = '';
        renderExercise(container, level);
      }
    });
  }

  function renderExercise(container, level) {
    const HOTSPOTS = POSITIONS.map(p => Object.assign({}, p, LEVELS[level][p.id]));
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
      ISMS.showResult(resultSlot, 'physical-security', score, MAX, level);
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
