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

  const SYSTEMS = [
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
  ];

  const POINTS_PER = 10;
  const MAX = SYSTEMS.length * POINTS_PER; // 80

  function render(container) {
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
      ISMS.showResult(resultSlot, 'network-segmentation', score, MAX);
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
