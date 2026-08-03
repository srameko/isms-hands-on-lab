/* Module 5 — Hardening: pick the right remediations */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const SERVER_DESC = {
    en: 'Freshly deployed Ubuntu server. Admin account uses password <code>admin123</code>. ' +
      'FTP and Telnet services are running but unused. All 65535 ports open on the firewall. ' +
      'Last OS update: 8 months ago. No centralized logging configured. ' +
      'SSH allows root login with password.',
    cs: 'Čerstvě nasazený server Ubuntu. Administrátorský účet má heslo <code>admin123</code>. ' +
      'Běží nevyužívané služby FTP a Telnet. Na firewallu je otevřených všech 65535 portů. ' +
      'Poslední aktualizace OS: před 8 měsíci. Není nakonfigurováno centralizované logování. ' +
      'SSH umožňuje přihlášení roota heslem.'
  };

  const ITEMS = [
    { text: { en: 'Change default admin password / enforce strong password policy', cs: 'Změnit výchozí heslo administrátora / vynutit silnou politiku hesel' },
      good: true, why: { en: 'admin123 is trivially guessable — first thing to fix.', cs: 'admin123 je triviálně uhodnutelné — první věc k opravě.' } },
    { text: { en: 'Disable unused services (FTP, Telnet)', cs: 'Vypnout nevyužívané služby (FTP, Telnet)' },
      good: true, why: { en: 'Unused services are pure attack surface — Telnet is also unencrypted.', cs: 'Nevyužívané služby jsou čistě útočná plocha navíc — Telnet navíc není šifrovaný.' } },
    { text: { en: 'Restrict firewall to only required ports', cs: 'Omezit firewall jen na nezbytné porty' },
      good: true, why: { en: 'Default-deny; open only what the server actually needs.', cs: 'Výchozí zákaz; otevřít jen to, co server skutečně potřebuje.' } },
    { text: { en: 'Apply pending OS/security updates', cs: 'Nainstalovat čekající aktualizace OS/bezpečnosti' },
      good: true, why: { en: '8 months of unpatched vulnerabilities is a serious exposure.', cs: '8 měsíců bez záplat znamená vážné vystavení riziku.' } },
    { text: { en: 'Configure centralized logging (e.g. forward to SIEM)', cs: 'Nastavit centralizované logování (např. přeposílání do SIEM)' },
      good: true, why: { en: 'Without logs you can’t detect or investigate incidents.', cs: 'Bez logů nelze incidenty detekovat ani vyšetřovat.' } },
    { text: { en: 'Disable root login over SSH, use key-based auth', cs: 'Zakázat přihlášení roota přes SSH, použít autentizaci klíčem' },
      good: true, why: { en: 'Root + password over SSH is a brute-force magnet.', cs: 'Root + heslo přes SSH přímo láká na brute-force útok.' } },
    { text: { en: 'Block all outbound traffic, including OS update servers', cs: 'Zablokovat veškerý odchozí provoz, včetně serverů s aktualizacemi OS' },
      good: false, why: { en: 'Overkill that breaks patching — hardening must not prevent updates.', cs: 'Zbytečný extrém, který rozbije záplatování — hardening nesmí bránit aktualizacím.' } },
    { text: { en: 'Uninstall SSH entirely so nobody can connect remotely', cs: 'Úplně odinstalovat SSH, aby se nikdo nemohl připojit vzdáleně' },
      good: false, why: { en: 'You still need managed remote access — secure it, don’t remove it.', cs: 'Řízený vzdálený přístup je pořád potřeba — zabezpeč ho, neodstraňuj ho.' } },
    { text: { en: 'Set the same strong password on all servers for consistency', cs: 'Nastavit stejné silné heslo na všech serverech kvůli konzistenci' },
      good: false, why: { en: 'Password reuse means one compromise unlocks everything.', cs: 'Opakované použití hesla znamená, že jeden únik odemkne úplně vše.' } }
  ];

  const POINTS_PER = 10;
  const MAX = ITEMS.length * POINTS_PER; // 90

  function render(container) {
    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'You’ve been handed this server to harden. Check every action you would take — but watch out, some of the proposed actions would do more harm than good.',
      cs: 'Dostala jsi tento server na zabezpečení (hardening). Zaškrtni každou akci, kterou bys provedla — pozor, některé z navržených akcí by napáchaly víc škody než užitku.'
    });
    container.appendChild(intro);

    const desc = document.createElement('div');
    desc.className = 'callout warning';
    desc.innerHTML = '<strong>' + tr({ en: 'Server state:', cs: 'Stav serveru:' }) + '</strong> ' + tr(SERVER_DESC);
    container.appendChild(desc);

    const card = document.createElement('div');
    card.className = 'card checklist';
    card.innerHTML = '<h3>' + tr({ en: 'Proposed actions', cs: 'Navrhované akce' }) + '</h3>';
    const boxes = [];
    ITEMS.forEach((item, i) => {
      const label = document.createElement('label');
      label.innerHTML = '<input type="checkbox" data-i="' + i + '"><span>' + tr(item.text) + '</span>';
      card.appendChild(label);
      boxes.push({ label, input: label.querySelector('input'), item });
    });
    container.appendChild(card);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const check = document.createElement('button');
    check.className = 'btn btn-primary';
    check.textContent = tr({ en: 'Check my hardening plan', cs: 'Zkontrolovat můj plán zabezpečení' });
    actions.appendChild(check);
    container.appendChild(actions);

    const resultSlot = document.createElement('div');
    container.appendChild(resultSlot);

    check.addEventListener('click', () => {
      check.disabled = true;
      let score = 0;
      boxes.forEach(b => {
        b.input.disabled = true;
        const correct = b.input.checked === b.item.good;
        if (correct) score += POINTS_PER;
        b.label.classList.add(correct ? 'item-ok' : 'item-bad');
        const fb = document.createElement('div');
        fb.className = 'feedback-line ' + (correct ? 'ok' : 'bad');
        fb.innerHTML = (correct ? '✓ ' : '✗ ') +
          (b.item.good ? tr({ en: 'Should be done — ', cs: 'Mělo by se udělat — ' }) : tr({ en: 'Should NOT be done — ', cs: 'Nemělo by se udělat — ' })) + tr(b.item.why);
        b.label.appendChild(fb);
      });
      ISMS.showResult(resultSlot, 'hardening', score, MAX);
    });
  }

  ISMS.registerModule({
    id: 'hardening',
    title: { en: 'Hardening', cs: 'Hardening' },
    icon: '🛡️',
    maxScore: MAX,
    render
  });
})();
