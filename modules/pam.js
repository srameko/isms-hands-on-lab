/* Module 7 — PAM: pick the least-privilege access for each role */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const ROLES = [
    {
      role: { en: 'Junior admin', cs: 'Junior administrátor' },
      correct: { en: 'Read access to logs, limited server restart rights', cs: 'Čtecí přístup k logům, omezené právo restartovat servery' },
      wrong: { en: 'Full domain admin rights', cs: 'Plná práva doménového administrátora' },
      why: { en: 'A junior admin doesn’t need domain-wide power — grant only what the daily tasks require.', cs: 'Junior administrátor nepotřebuje moc nad celou doménou — přiděl jen to, co vyžadují každodenní úkoly.' }
    },
    {
      role: { en: 'External vendor', cs: 'Externí dodavatel' },
      correct: { en: 'Access only to the specific system under contract, time-boxed', cs: 'Přístup pouze ke konkrétnímu systému dle smlouvy, časově omezený' },
      wrong: { en: 'Persistent VPN access to the entire internal network', cs: 'Trvalý VPN přístup do celé interní sítě' },
      why: { en: 'Vendor access must be scoped to the contracted system and expire — persistent broad access is a classic breach vector.', cs: 'Přístup dodavatele musí být omezen na smluvený systém a mít platnost — trvalý široký přístup je klasický vektor úniku dat.' }
    },
    {
      role: { en: 'Service account', cs: 'Servisní účet' },
      correct: { en: 'Access only to resources the automated task needs', cs: 'Přístup jen k prostředkům, které automatizovaná úloha potřebuje' },
      wrong: { en: 'Interactive login rights, password never rotated', cs: 'Právo interaktivního přihlášení, heslo se nikdy nemění' },
      why: { en: 'Service accounts should never log in interactively, and their credentials must be rotated/managed.', cs: 'Servisní účty by se nikdy neměly přihlašovat interaktivně a jejich přihlašovací údaje musí být pravidelně obměňovány.' }
    },
    {
      role: { en: 'Help desk technician', cs: 'Technik helpdesku' },
      correct: { en: 'Password reset rights, read-only ticket system access', cs: 'Právo resetovat hesla, přístup k ticketovacímu systému jen pro čtení' },
      wrong: { en: 'Access to the HR/payroll database', cs: 'Přístup k databázi HR/mezd' },
      why: { en: 'Help desk tasks don’t touch HR data — sensitive databases need strict need-to-know.', cs: 'Úkoly helpdesku se HR dat netýkají — citlivé databáze vyžadují přísné dodržování principu need-to-know.' }
    },
    {
      role: { en: 'Database administrator', cs: 'Databázový administrátor' },
      correct: { en: 'Full access to the database servers they manage', cs: 'Plný přístup k databázovým serverům, které spravuje' },
      wrong: { en: 'Access to unrelated production web servers', cs: 'Přístup k nesouvisejícím produkčním webovým serverům' },
      why: { en: 'Even powerful roles are scoped: DBA rights end at the databases they actually administer.', cs: 'I silné role mají svůj rozsah: práva DBA končí u databází, které skutečně spravuje.' }
    }
  ];

  const POINTS_PER = 10;
  const MAX = ROLES.length * POINTS_PER; // 50

  function render(container) {
    let score = 0;
    let answered = 0;

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'For each role, choose the access level that follows the least privilege principle. One option is correct; the other is over-privileged.',
      cs: 'U každé role vyber úroveň přístupu odpovídající principu nejmenších oprávnění. Jedna možnost je správná, druhá má nadměrná oprávnění.'
    });
    container.appendChild(intro);

    const resultSlot = document.createElement('div');

    ROLES.forEach(r => {
      // shuffle the two options so the correct one isn't always first
      const opts = Math.random() < 0.5 ? [{ key: 'correct', text: r.correct }, { key: 'wrong', text: r.wrong }]
                                        : [{ key: 'wrong', text: r.wrong }, { key: 'correct', text: r.correct }];
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h3>👤 ' + tr(r.role) + '</h3>' +
        '<div class="choice-row" data-row style="flex-direction:column;align-items:stretch"></div>' +
        '<div data-feedback></div>';
      const row = card.querySelector('[data-row]');
      opts.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.style.borderRadius = '10px';
        b.style.textAlign = 'left';
        b.textContent = tr(opt.text);
        b.dataset.key = opt.key;
        b.addEventListener('click', () => {
          if (row.dataset.done) return;
          row.dataset.done = '1';
          answered++;
          const correct = opt.key === 'correct';
          if (correct) score += POINTS_PER;
          row.querySelectorAll('.choice').forEach(x => {
            x.disabled = true;
            if (x.dataset.key === 'correct') x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
          });
          card.querySelector('[data-feedback]').innerHTML =
            '<div class="feedback-line ' + (correct ? 'ok' : 'bad') + '">' +
            (correct ? '✓ ' : '✗ ' + tr({ en: 'Least privilege violation — ', cs: 'Porušení principu nejmenších oprávnění — ' })) + tr(r.why) + '</div>';
          if (answered === ROLES.length) {
            ISMS.showResult(resultSlot, 'pam', score, MAX);
          }
        });
        row.appendChild(b);
      });
      container.appendChild(card);
    });

    container.appendChild(resultSlot);
  }

  ISMS.registerModule({
    id: 'pam',
    title: { en: 'PAM', cs: 'PAM' },
    icon: '🔑',
    maxScore: MAX,
    render
  });
})();
