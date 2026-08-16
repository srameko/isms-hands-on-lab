/* Module 7 — PAM: pick the least-privilege access for each role */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const LEVELS = {
    easy: [
      {
        role: { en: 'New intern (first week)', cs: 'Nová stážistka (první týden)' },
        correct: { en: 'Read-only access to the training wiki and shared onboarding folder', cs: 'Přístup jen pro čtení k tréninkové wiki a sdílené onboardingové složce' },
        wrong: { en: 'Full access to the production customer database', cs: 'Plný přístup k produkční databázi zákazníků' },
        why: { en: 'A brand-new intern has no business reason to touch production customer data at all.', cs: 'Zcela nová stážistka nemá žádný pracovní důvod sahat na produkční data zákazníků.' }
      },
      {
        role: { en: 'Receptionist', cs: 'Recepční' },
        correct: { en: 'Access to the visitor sign-in system and shared calendar', cs: 'Přístup k systému pro evidenci návštěv a sdílenému kalendáři' },
        wrong: { en: 'Access to the engineering source code repository', cs: 'Přístup k repozitáři zdrojového kódu vývojářského týmu' },
        why: { en: 'Completely unrelated to the role — a receptionist has no need for source code access.', cs: 'Zcela nesouvisí s rolí — recepční nemá žádnou potřebu přístupu ke zdrojovému kódu.' }
      },
      {
        role: { en: 'Marketing intern', cs: 'Stážista v marketingu' },
        correct: { en: 'Access to the marketing content management system only', cs: 'Přístup pouze k marketingovému redakčnímu systému' },
        wrong: { en: 'Domain admin rights across the whole company network', cs: 'Práva doménového administrátora napříč celou firemní sítí' },
        why: { en: 'Publishing marketing content never requires domain-wide administrative power.', cs: 'Publikování marketingového obsahu nikdy nevyžaduje administrátorskou moc nad celou doménou.' }
      },
      {
        role: { en: 'Temporary summer data-entry contractor', cs: 'Letní brigádnice na zadávání dat' },
        correct: { en: 'Write access to only the one spreadsheet they’re entering data into', cs: 'Právo zápisu jen do jedné tabulky, do které zadává data' },
        wrong: { en: 'Access to every department’s shared drive', cs: 'Přístup ke sdílenému disku všech oddělení' },
        why: { en: 'The task is narrow and short-lived — access should be exactly as narrow.', cs: 'Úkol je úzce vymezený a krátkodobý — přístup by měl být stejně úzce vymezený.' }
      },
      {
        role: { en: 'Automated backup script (service account)', cs: 'Automatizovaný zálohovací skript (servisní účet)' },
        correct: { en: 'Read-only access to the specific folders it backs up', cs: 'Přístup jen pro čtení ke konkrétním složkám, které zálohuje' },
        wrong: { en: 'Interactive login with a never-expiring password and full admin rights', cs: 'Interaktivní přihlášení s heslem bez expirace a plnými administrátorskými právy' },
        why: { en: 'A backup job only ever needs to read files — it should never be able to log in interactively or hold admin rights.', cs: 'Zálohovací úloha vždy potřebuje jen číst soubory — nikdy by se neměla umět interaktivně přihlásit ani mít administrátorská práva.' }
      }
    ],
    medium: [
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
    ],
    hard: [
      {
        role: { en: 'Incident responder during an active security incident', cs: 'Reagující na aktivní bezpečnostní incident' },
        correct: { en: 'Temporary, time-boxed elevated access to the affected systems only, automatically revoked once the incident closes, fully logged', cs: 'Dočasný, časově omezený zvýšený přístup jen k postiženým systémům, automaticky odebraný po uzavření incidentu, plně logovaný' },
        wrong: { en: 'Permanent, standing domain admin rights, so they’re always ready for the next incident', cs: 'Trvalá, stálá práva doménového administrátora, aby byl vždy připraven na další incident' },
        why: { en: 'Just-in-time, scoped, auto-expiring access covers the real need without leaving a permanent high-value target sitting around between incidents.', cs: 'Přístup poskytnutý „just-in-time“, omezený a automaticky vypršující pokryje skutečnou potřebu, aniž by mezi incidenty zůstával trvale ležet lákavý cíl s vysokou hodnotou.' }
      },
      {
        role: { en: 'On-call site reliability engineer', cs: 'Pohotovostní site reliability inženýrka' },
        correct: { en: 'Standing read access to production dashboards and logs; write/restart actions require a logged, time-limited break-glass elevation', cs: 'Trvalý přístup pro čtení k produkčním dashboardům a logům; akce zápisu/restartu vyžadují logované, časově omezené nouzové zvýšení oprávnění' },
        wrong: { en: 'Standing full production root access at all times, since they might need it at any moment', cs: 'Trvalý plný root přístup do produkce po celou dobu, protože ho může kdykoli potřebovat' },
        why: { en: 'Frequent legitimate need doesn’t justify standing full access — read access can stay always-on, but the risky write/restart actions should still go through a gated, logged elevation.', cs: 'Častá legitimní potřeba neospravedlňuje trvalý plný přístup — čtení může zůstat vždy zapnuté, ale riskantní akce zápisu/restartu by měly stále procházet řízeným a logovaným zvýšením oprávnění.' }
      },
      {
        role: { en: 'Data scientist training models on customer behavior', cs: 'Datová vědkyně trénující modely na chování zákazníků' },
        correct: { en: 'Access to a de-identified copy of the dataset in a separate analytics environment', cs: 'Přístup k anonymizované kopii datasetu v oddělaném analytickém prostředí' },
        wrong: { en: 'Direct read access to the live production customer database', cs: 'Přímý čtecí přístup k živé produkční databázi zákazníků' },
        why: { en: 'Even “only read access” to production can be more than needed — if a de-identified copy satisfies the actual task, that’s the least-privilege choice, not raw prod access.', cs: '„Jen čtecí přístup“ k produkci může být pořád víc, než je potřeba — pokud anonymizovaná kopie pokryje skutečný úkol, je to volba odpovídající nejmenším oprávněním, ne surový přístup do produkce.' }
      },
      {
        role: { en: 'Junior help desk technician', cs: 'Junior technik helpdesku' },
        correct: { en: 'Standard password-reset rights, but resets for the “Executives” security group require secondary approval from their manager', cs: 'Standardní právo resetovat hesla, ale reset pro bezpečnostní skupinu „Vedení“ vyžaduje dodatečné schválení nadřízeným' },
        wrong: { en: 'Standard password-reset rights, identical for every account in the company including executives', cs: 'Standardní právo resetovat hesla, stejné pro všechny účty ve firmě včetně vedení' },
        why: { en: 'Least privilege isn’t only about breadth of access — high-value accounts (like executives, frequent phishing/BEC targets) often warrant an extra approval step even for an otherwise routine action.', cs: 'Nejmenší oprávnění nejsou jen o šíři přístupu — účty s vysokou hodnotou (jako vedení, časté cíle phishingu a BEC podvodů) si často zaslouží krok schválení navíc, i pro jinak rutinní akci.' }
      },
      {
        role: { en: 'CI/CD pipeline service account deploying to production', cs: 'Servisní účet CI/CD pipeline nasazující do produkce' },
        correct: { en: 'Scoped deployment permissions limited to the one application it deploys, using short-lived credentials issued per pipeline run', cs: 'Omezená oprávnění k nasazení jen jedné aplikace, kterou nasazuje, s krátkodobými přihlašovacími údaji vydávanými pro každý běh pipeline' },
        wrong: { en: 'A long-lived static API token with account-wide deployment rights to every application, stored as a pipeline secret', cs: 'Dlouhodobý statický API token s právy nasazovat do všech aplikací napříč účtem, uložený jako tajemství v pipeline' },
        why: { en: 'Both scope and credential lifetime matter for least privilege: a leaked short-lived, narrowly-scoped credential is far less damaging than a leaked static token that can deploy anywhere indefinitely.', cs: 'Pro nejmenší oprávnění záleží jak na rozsahu, tak na životnosti přihlašovacích údajů: uniklý krátkodobý a úzce vymezený údaj napáchá mnohem menší škodu než uniklý statický token, který může trvale nasazovat kamkoli.' }
      }
    ]
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Obviously mismatched access requests — a good place to build a feel for least privilege.',
      cs: 'Zjevně nepřiměřené žádosti o přístup — dobré na vybudování citu pro nejmenší oprávnění.'
    },
    medium: {
      en: 'The original five roles.',
      cs: 'Původních pět rolí.'
    },
    hard: {
      en: 'Advanced PAM concepts — just-in-time access, tiered controls for high-value accounts, data minimization, short-lived credentials.',
      cs: 'Pokročilé koncepty PAM — přístup just-in-time, odstupňovaná opatření pro cenné účty, minimalizace dat, krátkodobé přihlašovací údaje.'
    }
  };

  const POINTS_PER = 10;
  const MAX = LEVELS.medium.length * POINTS_PER; // 50

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
    const ROLES = LEVELS[level];
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
            ISMS.showResult(resultSlot, 'pam', score, MAX, level);
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
