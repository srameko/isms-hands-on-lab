/* Module 3 — CM vs. CHM: classify each config change */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const BEFORE = ['PermitRootLogin no', 'PasswordAuthentication yes', 'Port 22', 'MaxAuthTries 6'];
  const AFTER  = ['PermitRootLogin yes', 'PasswordAuthentication yes', 'Port 2222', 'MaxAuthTries 3'];

  const CHANGES = [
    {
      id: 'root',
      label: 'PermitRootLogin no → yes',
      answer: 'CHM',
      why: {
        en: 'Significantly increases risk (root login over SSH) — needs approval and documented justification.',
        cs: 'Výrazně zvyšuje riziko (přihlášení roota přes SSH) — vyžaduje schválení a zdokumentované odůvodnění.'
      }
    },
    {
      id: 'port',
      label: 'Port 22 → 2222',
      answer: 'CM',
      why: {
        en: 'Common hardening baseline practice, low risk, pre-approved standard.',
        cs: 'Běžná praxe v rámci hardeningové baseline, nízké riziko, předem schválený standard.'
      }
    },
    {
      id: 'tries',
      label: 'MaxAuthTries 6 → 3',
      answer: 'CM',
      why: {
        en: 'Tightening a security control within the approved baseline — no separate CHM approval needed.',
        cs: 'Zpřísnění bezpečnostního opatření v rámci schválené baseline — samostatné schválení přes CHM není potřeba.'
      }
    }
  ];

  const POINTS_PER = 10;
  const MAX = CHANGES.length * POINTS_PER; // 30

  function render(container) {
    let score = 0;
    let answered = 0;

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'A colleague proposes changes to the SSH server configuration. Compare the baseline with the proposal and classify each change: is it routine Configuration Management (within the approved baseline), or does it require Change Management approval?',
      cs: 'Kolegyně navrhuje změny konfigurace SSH serveru. Porovnej výchozí stav s návrhem a zařaď každou změnu: jde o běžnou Configuration Management (v rámci schválené baseline), nebo je potřeba schválení přes Change Management?'
    });
    container.appendChild(intro);

    const diffCard = document.createElement('div');
    diffCard.className = 'card';
    diffCard.innerHTML = '<h3>sshd_config — ' + tr({ en: 'proposed change', cs: 'navrhovaná změna' }) + '</h3>' +
      '<div class="diff">' +
      BEFORE.map((l, i) => {
        if (l === AFTER[i]) return '<div class="line">  ' + l + '</div>';
        return '<div class="line removed">- ' + l + '</div>' +
               '<div class="line added">+ ' + AFTER[i] + '</div>';
      }).join('') +
      '</div>';
    container.appendChild(diffCard);

    const resultSlot = document.createElement('div');

    CHANGES.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h3><code>' + ch.label + '</code></h3>' +
        '<div class="choice-row" data-row></div>' +
        '<div data-feedback></div>';
      const row = card.querySelector('[data-row]');
      [
        { key: 'CM', text: { en: 'Configuration Management (routine)', cs: 'Configuration Management (rutinní)' } },
        { key: 'CHM', text: { en: 'Change Management required', cs: 'Vyžaduje Change Management' } }
      ].forEach(opt => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.textContent = tr(opt.text);
        b.dataset.key = opt.key;
        b.addEventListener('click', () => {
          if (row.dataset.done) return;
          row.dataset.done = '1';
          answered++;
          const correct = opt.key === ch.answer;
          if (correct) score += POINTS_PER;
          row.querySelectorAll('.choice').forEach(x => {
            x.disabled = true;
            if (x.dataset.key === ch.answer) x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
          });
          card.querySelector('[data-feedback]').innerHTML =
            '<div class="feedback-line ' + (correct ? 'ok' : 'bad') + '">' +
            (correct ? '✓ ' : '✗ ') + tr(ch.why) + '</div>';
          if (answered === CHANGES.length) {
            ISMS.showResult(resultSlot, 'cm-vs-chm', score, MAX);
          }
        });
        row.appendChild(b);
      });
      container.appendChild(card);
    });

    container.appendChild(resultSlot);
  }

  ISMS.registerModule({
    id: 'cm-vs-chm',
    title: { en: 'CM vs. CHM', cs: 'CM vs. CHM' },
    icon: '⚖️',
    maxScore: MAX,
    render
  });
})();
