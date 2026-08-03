/* Module 6 — Privileged Tools: approve or reject install requests */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const OPTIONS = [
    { key: 'approve', text: { en: 'Approve', cs: 'Schválit' } },
    { key: 'conditions', text: { en: 'Approve with conditions', cs: 'Schválit s podmínkami' } },
    { key: 'reject', text: { en: 'Reject', cs: 'Zamítnout' } }
  ];

  const REQUESTS = [
    {
      from: { en: 'Help desk technician', cs: 'Technik helpdesku' },
      req: { en: 'Requests Wireshark to troubleshoot a network issue.', cs: 'Žádá o Wireshark kvůli řešení problému na síti.' },
      answer: 'conditions',
      why: {
        en: 'Legitimate need, but packet capture is a powerful tool — approve with justification, time limit, and logging.',
        cs: 'Legitimní potřeba, ale zachytávání paketů je mocný nástroj — schval s odůvodněním, časovým omezením a logováním.'
      }
    },
    {
      from: { en: 'Marketing employee', cs: 'Zaměstnankyně marketingu' },
      req: { en: 'Requests an unsigned freeware PDF compressor found online.', cs: 'Žádá o nepodepsaný freeware na kompresi PDF nalezený na internetu.' },
      answer: 'reject',
      why: {
        en: 'Unsigned software, no business justification for a privileged install, not on the approved software list.',
        cs: 'Nepodepsaný software, chybí byznysové odůvodnění pro privilegovanou instalaci, není na seznamu schváleného softwaru.'
      }
    },
    {
      from: { en: 'Developer', cs: 'Vývojářka' },
      req: { en: 'Requests Docker for a documented project need.', cs: 'Žádá o Docker pro zdokumentovanou potřebu projektu.' },
      answer: 'approve',
      why: {
        en: 'Standard tooling, documented need, on the approved software list.',
        cs: 'Standardní nástroj, zdokumentovaná potřeba, je na seznamu schváleného softwaru.'
      }
    },
    {
      from: { en: 'Finance employee', cs: 'Zaměstnankyně financí' },
      req: { en: 'Requests a browser extension for currency conversion that requires access to all browser tabs.', cs: 'Žádá o rozšíření prohlížeče pro převod měn, které vyžaduje přístup ke všem otevřeným panelům.' },
      answer: 'reject',
      why: {
        en: 'Excessive permissions (reads every tab — including banking systems) and no security review.',
        cs: 'Nadměrná oprávnění (čte všechny panely — včetně bankovních systémů) a chybí bezpečnostní posouzení.'
      }
    },
    {
      from: { en: 'IT admin', cs: 'IT administrátor' },
      req: { en: 'Requests an update of the approved company VPN client.', cs: 'Žádá o aktualizaci schváleného firemního VPN klienta.' },
      answer: 'approve',
      why: {
        en: 'Already vetted software — routine update, keeping it current is itself a security measure.',
        cs: 'Software už je prověřený — rutinní aktualizace, udržování aktuální verze je samo o sobě bezpečnostní opatření.'
      }
    }
  ];

  const POINTS_PER = 10;
  const MAX = REQUESTS.length * POINTS_PER; // 50

  function render(container) {
    let score = 0;
    let answered = 0;

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'You review software installation requests today. Decide each one according to least privilege and the approved software list. Some need conditions attached, not a plain yes.',
      cs: 'Dnes posuzuješ žádosti o instalaci softwaru. Rozhodni o každé z nich podle principu nejmenších oprávnění a seznamu schváleného softwaru. U některých je potřeba přidat podmínky, ne jen prosté ano.'
    });
    container.appendChild(intro);

    const resultSlot = document.createElement('div');

    REQUESTS.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h3>📥 ' + tr({ en: 'Request', cs: 'Žádost' }) + ' #' + (idx + 1) + ' — ' + tr(r.from) + '</h3>' +
        '<p>' + tr(r.req) + '</p>' +
        '<div class="choice-row" data-row></div>' +
        '<div data-feedback></div>';
      const row = card.querySelector('[data-row]');
      OPTIONS.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.textContent = tr(opt.text);
        b.dataset.key = opt.key;
        b.addEventListener('click', () => {
          if (row.dataset.done) return;
          row.dataset.done = '1';
          answered++;
          const correct = opt.key === r.answer;
          if (correct) score += POINTS_PER;
          const answerLabel = OPTIONS.find(o => o.key === r.answer);
          row.querySelectorAll('.choice').forEach(x => {
            x.disabled = true;
            if (x.dataset.key === r.answer) x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
          });
          card.querySelector('[data-feedback]').innerHTML =
            '<div class="feedback-line ' + (correct ? 'ok' : 'bad') + '">' +
            (correct ? '✓ ' : '✗ ' + tr({ en: 'Correct decision:', cs: 'Správné rozhodnutí:' }) + ' <strong>' + tr(answerLabel.text) + '</strong> — ') + tr(r.why) + '</div>';
          if (answered === REQUESTS.length) {
            ISMS.showResult(resultSlot, 'privileged-tools', score, MAX);
          }
        });
        row.appendChild(b);
      });
      container.appendChild(card);
    });

    container.appendChild(resultSlot);
  }

  ISMS.registerModule({
    id: 'privileged-tools',
    title: { en: 'Privileged Tools', cs: 'Privilegované nástroje' },
    icon: '📋',
    maxScore: MAX,
    render
  });
})();
