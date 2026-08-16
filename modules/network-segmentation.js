/* Module 8 — Network Segmentation: place systems into the right zones */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const ZONES = [
    { id: 'dmz',    name: { en: 'DMZ', cs: 'DMZ' } },
    { id: 'lan',    name: { en: 'Internal LAN', cs: 'Interní LAN' } },
    { id: 'iot',    name: { en: 'IoT VLAN', cs: 'IoT VLAN' } },
    { id: 'guest',  name: { en: 'Guest Network', cs: 'Hostovská síť' } },
    { id: 'pci',    name: { en: 'PCI Segment', cs: 'PCI segment' } }
  ];

  const LEVELS = {
    easy: [
      { id: 'website', name: { en: '🌐 Company public website server', cs: '🌐 Server veřejných webových stránek firmy' }, zone: 'dmz',
        why: { en: 'Directly reachable from the internet — belongs in the DMZ, isolated from the internal network.', cs: 'Přímo dosažitelné z internetu — patří do DMZ, izolované od interní sítě.' } },
      { id: 'emaillaptop', name: { en: '💻 Employee laptop used only for internal email and documents', cs: '💻 Notebook zaměstnance používaný jen na interní e-mail a dokumenty' }, zone: 'lan',
        why: { en: 'A managed employee device doing internal work lives on the Internal LAN.', cs: 'Spravované zařízení zaměstnance na interní práci patří do interní LAN.' } },
      { id: 'bulb', name: { en: '💡 Smart light bulb controller', cs: '💡 Ovladač chytré žárovky' }, zone: 'iot',
        why: { en: 'A classic IoT device — hard to patch, so it’s quarantined in its own VLAN.', cs: 'Klasické IoT zařízení — špatně se záplatuje, proto je izolované ve vlastní VLAN.' } },
      { id: 'visitorphone', name: { en: '📱 Visitor’s personal phone on guest WiFi', cs: '📱 Osobní telefon návštěvníka na hostovské WiFi' }, zone: 'guest',
        why: { en: 'An untrusted personal device belongs on the Guest Network, never touching internal resources.', cs: 'Nedůvěryhodné osobní zařízení patří do hostovské sítě a nikdy by se nemělo dostat k interním prostředkům.' } },
      { id: 'payroll', name: { en: '🧾 Accountant’s workstation running internal payroll software', cs: '🧾 Pracovní stanice účetní se interním mzdovým softwarem' }, zone: 'lan',
        why: { en: 'An internal-only business application on a managed workstation belongs on the Internal LAN.', cs: 'Čistě interní firemní aplikace na spravované stanici patří do interní LAN.' } },
      { id: 'checkout', name: { en: '💳 Credit card swipe terminal at checkout', cs: '💳 Terminál na čtení platebních karet u pokladny' }, zone: 'pci',
        why: { en: 'Cardholder data systems are isolated in a PCI segment (PCI DSS requirement).', cs: 'Systémy s daty držitelů karet jsou izolované v PCI segmentu (požadavek PCI DSS).' } },
      { id: 'wiki', name: { en: '📖 Internal wiki server for employee documentation', cs: '📖 Interní wiki server s dokumentací pro zaměstnance' }, zone: 'lan',
        why: { en: 'An internal-only knowledge base belongs on the Internal LAN.', cs: 'Čistě interní znalostní báze patří do interní LAN.' } },
      { id: 'dns', name: { en: '🌍 Public-facing DNS server for the company domain', cs: '🌍 Veřejný DNS server pro doménu firmy' }, zone: 'dmz',
        why: { en: 'Answers queries from the whole internet — belongs in the DMZ.', cs: 'Odpovídá na dotazy z celého internetu — patří do DMZ.' } }
    ],
    medium: [
      { id: 'web',     name: { en: '🌐 Public web server', cs: '🌐 Veřejný webový server' }, zone: 'dmz',
        why: { en: 'Internet-facing systems belong in the DMZ, isolated from the internal network.', cs: 'Systémy dostupné z internetu patří do DMZ, izolované od interní sítě.' } },
      { id: 'hr',      name: { en: '🗄️ Internal HR database', cs: '🗄️ Interní databáze HR' }, zone: 'lan',
        why: { en: 'Sensitive internal data stays on the Internal LAN, never exposed to the DMZ.', cs: 'Citlivá interní data zůstávají v interní LAN a nikdy se nevystavují do DMZ.' } },
      { id: 'camera',  name: { en: '📷 IoT security camera', cs: '📷 IoT bezpečnostní kamera' }, zone: 'iot',
        why: { en: 'IoT devices are hard to patch — quarantine them in their own VLAN.', cs: 'IoT zařízení se špatně záplatují — izoluj je do vlastní VLAN.' } },
      { id: 'guestpc', name: { en: '💻 Guest WiFi laptop', cs: '💻 Notebook na hostovské WiFi' }, zone: 'guest',
        why: { en: 'Untrusted guest devices must never touch internal resources.', cs: 'Nedůvěryhodná hostovská zařízení se nesmí nikdy dostat k interním prostředkům.' } },
      { id: 'dev',     name: { en: '👩‍💻 Developer workstation', cs: '👩‍💻 Pracovní stanice vývojářky' }, zone: 'lan',
        why: { en: 'Managed employee devices live on the Internal LAN.', cs: 'Spravovaná zařízení zaměstnanců patří do interní LAN.' } },
      { id: 'pos',     name: { en: '💳 Payment card terminal', cs: '💳 Platební terminál' }, zone: 'pci',
        why: { en: 'Cardholder data systems are isolated in a PCI segment (PCI DSS requirement).', cs: 'Systémy s daty držitelů karet jsou izolované v PCI segmentu (požadavek PCI DSS).' } },
      { id: 'files',   name: { en: '📁 Internal file server', cs: '📁 Interní souborový server' }, zone: 'lan',
        why: { en: 'Internal services for employees belong on the Internal LAN.', cs: 'Interní služby pro zaměstnance patří do interní LAN.' } },
      { id: 'vendor',  name: { en: '🔌 External vendor’s remote access device', cs: '🔌 Zařízení pro vzdálený přístup externího dodavatele' }, zone: 'dmz',
        why: { en: 'Never directly on the Internal LAN — vendor access terminates in the DMZ, then goes through controlled, monitored gateways.', cs: 'Nikdy přímo v interní LAN — přístup dodavatele končí v DMZ a dál pokračuje přes řízené a monitorované brány.' } }
    ],
    hard: [
      { id: 'wikiproxy', name: { en: '📖 Reverse-proxy front end that exposes one public knowledge-base section of the internal wiki to unauthenticated internet users', cs: '📖 Reverzní proxy zpřístupňující jednu veřejnou sekci interní wiki neautentizovaným uživatelům z internetu' }, zone: 'dmz',
        why: { en: 'Whatever component directly accepts unauthenticated traffic from the internet belongs in the DMZ, even if the rest of the service is otherwise internal — classify by what it’s exposed to, not by what it “mostly” does.', cs: 'Cokoli, co přímo přijímá neautentizovaný provoz z internetu, patří do DMZ, i když je zbytek služby jinak interní — zařazuj podle toho, čemu je vystaveno, ne podle toho, co „převážně” dělá.' } },
      { id: 'badge', name: { en: '🚪 Network-connected badge reader / door-lock controller for centralized physical access management', cs: '🚪 Síťově připojená čtečka karet / ovladač zámku dveří pro centrální správu fyzického přístupu' }, zone: 'iot',
        why: { en: 'Being security-critical doesn’t make a device more trustworthy — it’s still an embedded, hard-to-patch device, so it belongs quarantined in the IoT VLAN like any other, not promoted onto the trusted LAN.', cs: 'To, že je zařízení bezpečnostně kritické, ho nedělá důvěryhodnějším — pořád jde o vestavěné, špatně záplatovatelné zařízení, které patří izolované do IoT VLAN jako každé jiné, ne povýšené do důvěryhodné LAN.' } },
      { id: 'vpnlaptop', name: { en: '👩‍💼 Marketing team laptop, currently used from a coffee shop over the company’s managed VPN', cs: '👩‍💼 Notebook marketingového týmu, aktuálně používaný z kavárny přes firemní spravovanou VPN' }, zone: 'lan',
        why: { en: 'The VPN gives it logical membership in the internal network regardless of physical location — zone is about trust level, not geography.', cs: 'VPN mu dává logické členství v interní síti bez ohledu na fyzickou polohu — zóna je o úrovni důvěry, ne o zeměpisné poloze.' } },
      { id: 'p2pepos', name: { en: '💳 Point-of-sale terminal using point-to-point encryption, so card data is encrypted the instant it’s swiped', cs: '💳 Platební terminál s point-to-point šifrováním, kdy jsou data karty zašifrována ihned po přejetí' }, zone: 'pci',
        why: { en: 'Point-to-point encryption reduces risk, but the physical terminal is still a target for tampering or memory-scraping malware — it stays in the PCI segment; encryption elsewhere in the flow doesn’t remove the terminal itself from scope.', cs: 'Point-to-point šifrování snižuje riziko, ale fyzický terminál je stále cílem pro manipulaci nebo malware čtoucí paměť — zůstává v PCI segmentu; šifrování jinde v toku nevyjímá samotný terminál z rozsahu.' } },
      { id: 'portal', name: { en: '🔐 Guest WiFi captive-portal server, company-managed infrastructure that enforces guest policy before granting internet access', cs: '🔐 Server hostovského captive portálu, firemní spravovaná infrastruktura vynucující politiku hostovské sítě před povolením přístupu na internet' }, zone: 'lan',
        why: { en: 'Infrastructure that manages and enforces the guest network’s policy is a trusted, company-managed system — it isn’t itself an untrusted guest device, so it belongs on the Internal LAN, not inside the guest zone it controls.', cs: 'Infrastruktura, která spravuje a vynucuje politiku hostovské sítě, je důvěryhodný, firmou spravovaný systém — sama není nedůvěryhodným hostovským zařízením, proto patří do interní LAN, ne do hostovské zóny, kterou řídí.' } },
      { id: 'contractorlaptop', name: { en: '🧑‍💻 Contractor’s personal laptop, brought from home, connecting only to one approved SaaS tool over the internet, never touching internal resources', cs: '🧑‍💻 Osobní notebook dodavatele přinesený z domova, připojující se jen k jednomu schválenému SaaS nástroji přes internet, bez dotyku interních prostředků' }, zone: 'guest',
        why: { en: 'An unmanaged personal device stays on the least-trusted network regardless of who owns it or their business relationship — having a contract doesn’t upgrade an unmanaged laptop’s trust level.', cs: 'Nespravované osobní zařízení zůstává v nejméně důvěryhodné síti bez ohledu na to, komu patří nebo jaký má obchodní vztah — smlouva nezvyšuje úroveň důvěry nespravovaného notebooku.' } },
      { id: 'thermostat', name: { en: '🌡️ Smart thermostat that has quietly shared the employee LAN subnet for two years with no incidents', cs: '🌡️ Chytrý termostat, který už dva roky bez incidentu tiše sdílí podsíť se zaměstnaneckou LAN' }, zone: 'iot',
        why: { en: '“No incidents so far” isn’t a justification for miscategorization — it’s still an embedded IoT device and belongs in the IoT VLAN, however long it’s been sitting on the LAN unnoticed.', cs: '„Zatím žádný incident” není ospravedlnění pro špatné zařazení — pořád jde o vestavěné IoT zařízení, které patří do IoT VLAN, ať už si nepozorovaně sedí v LAN sebedéle.' } },
      { id: 'orderdb', name: { en: '🗄️ Backend application server holding full order histories and customer details, queried by the public web server via an internal API on every page load', cs: '🗄️ Backendový aplikační server s kompletní historií objednávek a údaji zákazníků, dotazovaný veřejným webovým serverem přes interní API při každém načtení stránky' }, zone: 'lan',
        why: { en: 'Being queried constantly by a DMZ system isn’t a reason to move the data-holding backend into the DMZ too — the DMZ web server should act as a controlled intermediary, while the sensitive backend stays isolated on the Internal LAN.', cs: 'To, že je server neustále dotazován systémem v DMZ, není důvod přesunout i backend s daty do DMZ — webový server v DMZ by měl fungovat jako řízený prostředník, zatímco citlivý backend zůstává izolovaný v interní LAN.' } }
    ]
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Obvious placements — a good place to build a feel for the five zones.',
      cs: 'Zjevná umístění — dobré na vybudování citu pro pět zón.'
    },
    medium: {
      en: 'The original eight systems.',
      cs: 'Původních osm systémů.'
    },
    hard: {
      en: 'Subtler cases — trust vs. criticality, logical vs. physical location, and where scope really ends. Read the details.',
      cs: 'Jemnější případy — důvěra vs. kritičnost, logická vs. fyzická poloha a kde skutečně končí rozsah. Čti detaily.'
    }
  };

  const POINTS_PER = 10;
  const MAX = LEVELS.medium.length * POINTS_PER; // 80

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
    const SYSTEMS = LEVELS[level];
    const placement = {};   // systemId -> zoneId
    let activeSystem = null;

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'Design the network: tap a system, then tap the zone where it belongs. Tap ✕ on a placed system to move it. When everything is placed, validate your design.',
      cs: 'Navrhni síť: klepni na systém a poté na zónu, kam patří. Klepnutím na ✕ u umístěného systému ho přesuneš. Až budou všechny systémy umístěné, ověř svůj návrh.'
    });
    container.appendChild(intro);

    const poolCard = document.createElement('div');
    poolCard.className = 'card';
    poolCard.innerHTML = '<h3>' + tr({ en: 'Systems to place', cs: 'Systémy k umístění' }) + '</h3><div class="chip-pool" data-pool></div>';
    const pool = poolCard.querySelector('[data-pool]');
    container.appendChild(poolCard);

    const zonesWrap = document.createElement('div');
    zonesWrap.className = 'zones';
    container.appendChild(zonesWrap);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const check = document.createElement('button');
    check.className = 'btn btn-primary';
    check.textContent = tr({ en: 'Validate my network design', cs: 'Ověřit můj návrh sítě' });
    check.disabled = true;
    actions.appendChild(check);
    container.appendChild(actions);

    const resultSlot = document.createElement('div');
    container.appendChild(resultSlot);

    let locked = false;

    const chips = {};
    SYSTEMS.forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = tr(s.name);
      chip.addEventListener('click', () => {
        if (locked || placement[s.id]) return;
        if (activeSystem === s.id) { activeSystem = null; }
        else { activeSystem = s.id; }
        refresh();
      });
      pool.appendChild(chip);
      chips[s.id] = chip;
    });

    const zoneEls = {};
    ZONES.forEach(z => {
      const el = document.createElement('div');
      el.className = 'zone';
      el.innerHTML = '<h4>' + tr(z.name) + '</h4><div data-slot></div>';
      el.addEventListener('click', () => {
        if (locked || !activeSystem) return;
        placement[activeSystem] = z.id;
        activeSystem = null;
        refresh();
      });
      zonesWrap.appendChild(el);
      zoneEls[z.id] = el;
    });

    function refresh() {
      SYSTEMS.forEach(s => {
        chips[s.id].classList.toggle('active', activeSystem === s.id);
        chips[s.id].classList.toggle('placed', !!placement[s.id]);
      });
      ZONES.forEach(z => {
        zoneEls[z.id].classList.toggle('targetable', !!activeSystem);
        const slot = zoneEls[z.id].querySelector('[data-slot]');
        slot.innerHTML = '';
        SYSTEMS.filter(s => placement[s.id] === z.id).forEach(s => {
          const pc = document.createElement('span');
          pc.className = 'placed-chip';
          pc.innerHTML = tr(s.name) + (locked ? '' : ' <button aria-label="' + tr({ en: 'Remove', cs: 'Odebrat' }) + '">✕</button>');
          if (!locked) {
            pc.querySelector('button').addEventListener('click', e => {
              e.stopPropagation();
              delete placement[s.id];
              refresh();
            });
          }
          slot.appendChild(pc);
        });
      });
      check.disabled = Object.keys(placement).length !== SYSTEMS.length;
    }

    check.addEventListener('click', () => {
      locked = true;
      check.disabled = true;
      let score = 0;
      const feedback = document.createElement('div');
      feedback.className = 'card';
      feedback.innerHTML = '<h3>' + tr({ en: 'Review', cs: 'Vyhodnocení' }) + '</h3>';
      SYSTEMS.forEach(s => {
        const correct = placement[s.id] === s.zone;
        if (correct) score += POINTS_PER;
        const zoneName = tr(ZONES.find(z => z.id === s.zone).name);
        const line = document.createElement('div');
        line.className = 'feedback-line ' + (correct ? 'ok' : 'bad');
        line.innerHTML = (correct ? '✓ ' : '✗ ') + tr(s.name) +
          (correct ? ' — ' + tr({ en: 'correct.', cs: 'správně.' }) + ' ' : ' — ' + tr({ en: 'belongs in', cs: 'patří do' }) + ' <strong>' + zoneName + '</strong>. ') + tr(s.why);
        feedback.appendChild(line);
      });
      refresh();
      // color placed chips
      SYSTEMS.forEach(s => {
        const slot = zoneEls[placement[s.id]].querySelector('[data-slot]');
        Array.from(slot.querySelectorAll('.placed-chip')).forEach(pc => {
          if (pc.textContent.indexOf(tr(s.name)) > -1) {
            pc.classList.add(placement[s.id] === s.zone ? 'correct' : 'wrong');
          }
        });
      });
      container.insertBefore(feedback, resultSlot);
      ISMS.showResult(resultSlot, 'network-segmentation', score, MAX, level);
    });

    refresh();
  }

  ISMS.registerModule({
    id: 'network-segmentation',
    title: { en: 'Segmentation', cs: 'Segmentace' },
    icon: '🕸️',
    maxScore: MAX,
    render
  });
})();
