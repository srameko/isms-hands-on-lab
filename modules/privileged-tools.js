/* Module 6 — Privileged Tools: approve or reject install requests */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const OPTIONS = [
    { key: 'approve', text: { en: 'Approve', cs: 'Schválit' } },
    { key: 'conditions', text: { en: 'Approve with conditions', cs: 'Schválit s podmínkami' } },
    { key: 'reject', text: { en: 'Reject', cs: 'Zamítnout' } }
  ];

  const LEVELS = {
    easy: [
      {
        from: { en: 'IT admin', cs: 'IT administrátor' },
        req: { en: 'Requests to update the company’s already-approved antivirus agent to the latest version.', cs: 'Žádá o aktualizaci již schváleného firemního antivirového agenta na nejnovější verzi.' },
        answer: 'approve',
        why: {
          en: 'Routine update of already-vetted, already-approved software — keeping it current is itself good security hygiene.',
          cs: 'Rutinní aktualizace už prověřeného a schváleného softwaru — udržování aktuální verze je samo o sobě dobrá bezpečnostní hygiena.'
        }
      },
      {
        from: { en: 'Employee', cs: 'Zaměstnanec' },
        req: { en: 'Asks to install a cracked, pirated copy of expensive design software downloaded from a torrent site.', cs: 'Žádá o instalaci prolomené, pirátské kopie drahého grafického softwaru staženého z torrentu.' },
        answer: 'reject',
        why: {
          en: 'Illegal, unsigned, and a near-guaranteed malware vector — an easy and clear reject.',
          cs: 'Nelegální, nepodepsané a téměř jistá cesta pro malware — jasné a jednoznačné zamítnutí.'
        }
      },
      {
        from: { en: 'Salesperson', cs: 'Obchodní zástupkyně' },
        req: { en: 'Requests the company’s already-approved CRM desktop client, needed daily for their job.', cs: 'Žádá o firmou již schváleného CRM desktopového klienta, který denně potřebuje pro svou práci.' },
        answer: 'approve',
        why: {
          en: 'Standard tooling, documented daily need, already on the approved software list.',
          cs: 'Standardní nástroj, zdokumentovaná každodenní potřeba, už je na seznamu schváleného softwaru.'
        }
      },
      {
        from: { en: 'Unverified caller', cs: 'Neověřený volající' },
        req: { en: 'Someone who isn’t a confirmed employee emails IT asking them to remotely install a “remote support tool” to “help fix an issue” — no ticket, no identity verification.', cs: 'Osoba, která není ověřeným zaměstnancem, píše IT s žádostí o vzdálenou instalaci „nástroje pro vzdálenou podporu“, aby „pomohla vyřešit problém“ — bez ticketu, bez ověření identity.' },
        answer: 'reject',
        why: {
          en: 'Classic social-engineering pattern — no ticket, no verified identity, unsolicited request for remote-access tooling.',
          cs: 'Klasický vzorec sociálního inženýrství — žádný ticket, neověřená identita, nevyžádaná žádost o nástroj pro vzdálený přístup.'
        }
      },
      {
        from: { en: 'Short-term contractor', cs: 'Krátkodobý dodavatel' },
        req: { en: 'On a fixed 2-week project, requests admin rights to the team’s shared analytics tool, which also holds unrelated departments’ data.', cs: 'V rámci dvoutýdenního projektu žádá o administrátorská práva ke sdílenému analytickému nástroji týmu, který obsahuje i data nesouvisejících oddělení.' },
        answer: 'conditions',
        why: {
          en: 'A legitimate short-term need, but access must be scoped to what the contract actually requires and set to expire when the project ends — not open-ended admin rights to unrelated data.',
          cs: 'Legitimní krátkodobá potřeba, ale přístup musí být omezen jen na to, co smlouva skutečně vyžaduje, a musí vypršet s koncem projektu — ne neomezená administrátorská práva k nesouvisejícím datům.'
        }
      }
    ],
    medium: [
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
    ],
    hard: [
      {
        from: { en: 'Executive assistant', cs: 'Asistentka vedení' },
        req: { en: 'Requests admin rights on the CFO’s laptop to install software on the CFO’s behalf while he travels — a delegation the CFO approved verbally over the phone last week, with no written record.', cs: 'Žádá o administrátorská práva na notebooku finanční ředitelky, aby mohla instalovat software jejím jménem během jejích cest — delegování, které finanční ředitelka minulý týden ústně schválila po telefonu, bez jakéhokoli písemného záznamu.' },
        answer: 'conditions',
        why: {
          en: 'The delegated need itself is plausible and common, but a verbal-only approval leaves no audit trail — approve conditional on getting the delegation documented (e.g. a ticket or signed request) and time-boxed.',
          cs: 'Delegovaná potřeba je sama o sobě věrohodná a běžná, ale čistě ústní schválení nezanechává žádnou auditní stopu — schval podmíněně tím, že se delegování zdokumentuje (např. ticketem nebo podepsanou žádostí) a časově omezí.'
        }
      },
      {
        from: { en: 'Senior engineer', cs: 'Senior inženýr' },
        req: { en: 'A highly trusted, senior engineer asks to install a network vulnerability scanner on their own workstation “to poke around and see what’s out there” on the corporate network — no assigned engagement, no scope, no manager sign-off.', cs: 'Velmi důvěryhodný senior inženýr žádá o instalaci síťového skeneru zranitelností na vlastní pracovní stanici, aby si „proklikal, co se v korporátní síti najde“ — bez přiděleného zadání, bez rozsahu, bez schválení nadřízeným.' },
        answer: 'reject',
        why: {
          en: 'Trust in the individual isn’t a substitute for process — unauthorized, unscoped scanning of the corporate network can itself trigger security alerts and carries real risk. It needs to come back as a scoped, authorized request, not proceed as-is.',
          cs: 'Důvěra v konkrétní osobu nenahrazuje proces — neautorizované skenování korporátní sítě bez rozsahu může samo spustit bezpečnostní alarmy a nese reálné riziko. Musí se vrátit jako žádost s jasným rozsahem a schválením, ne pokračovat takto.'
        }
      },
      {
        from: { en: 'Finance analyst', cs: 'Finanční analytička' },
        req: { en: 'Requests a spreadsheet add-in from the verified Microsoft marketplace, digitally signed, with limited permissions (reads only the active workbook), for a task explicitly required by their role.', cs: 'Žádá o doplněk do tabulkového procesoru z ověřeného Microsoft marketplace, digitálně podepsaný, s omezenými oprávněními (čte jen aktivní sešit), pro úkol výslovně vyžadovaný její rolí.' },
        answer: 'approve',
        why: {
          en: 'Don’t reject every add-in reflexively just because a bad browser extension showed up elsewhere — this one is signed, from a vetted marketplace, has narrowly scoped permissions, and matches a documented role need.',
          cs: 'Neodmítej automaticky každý doplněk jen proto, že se jinde objevilo špatné rozšíření prohlížeče — tenhle je podepsaný, z prověřeného marketplace, má úzce vymezená oprávnění a odpovídá zdokumentované potřebě role.'
        }
      },
      {
        from: { en: 'New DevOps hire', cs: 'Nový DevOps zaměstnanec' },
        req: { en: 'Requests Docker, identical to what every other DevOps engineer already has approved — but an onboarding delay means their account isn’t yet in the “DevOps” group, so the automated workflow flags them as ineligible.', cs: 'Žádá o Docker, identicky jako všichni ostatní DevOps inženýři, kteří ho už mají schváleného — kvůli zpoždění v onboardingu ale její účet ještě není ve skupině „DevOps“, takže ji automatizovaný proces označí jako nezpůsobilou.' },
        answer: 'approve',
        why: {
          en: 'The actual business need clearly matches an already-standard, already-approved tool for this role — the ineligibility is an identity-group sync bug, not a real security concern. Approve the request and fix the group membership separately.',
          cs: 'Skutečná potřeba jasně odpovídá už standardnímu a schválenému nástroji pro tuto roli — nezpůsobilost je chyba v synchronizaci identitní skupiny, ne skutečný bezpečnostní problém. Žádost schval a členství ve skupině oprav samostatně.'
        }
      },
      {
        from: { en: 'Regional office manager', cs: 'Vedoucí regionální pobočky' },
        req: { en: 'Requests remote-desktop software to help a remote employee with a home printer issue — the exact tool the company approved and used for this purpose for two years, except the vendor was acquired last month by a company with a poor security track record, and the product hasn’t been re-reviewed since.', cs: 'Žádá o software pro vzdálenou plochu, aby pomohla vzdálenému zaměstnanci s problémem s domácí tiskárnou — přesně ten nástroj, který firma pro tento účel schválila a používala poslední dva roky, jenže dodavatele minulý měsíc koupila firma se špatnou bezpečnostní historií a produkt od té doby neprošel novou revizí.' },
        answer: 'conditions',
        why: {
          en: '“Previously approved” isn’t permanent — an acquisition materially changes the vendor’s risk profile. The use case is still legitimate, so approve conditional on a fresh security re-review of the product before continued/new installs.',
          cs: '„Dříve schváleno” není trvalý stav — akvizice zásadně mění rizikový profil dodavatele. Účel použití je stále legitimní, proto schval podmíněně tím, že produkt projde novou bezpečnostní revizí, než se bude dál instalovat.'
        }
      }
    ]
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Clear-cut approve/reject calls — a good place to build a feel for the approved software list and least privilege.',
      cs: 'Jednoznačná rozhodnutí schválit/zamítnout — dobré na vybudování citu pro seznam schváleného softwaru a nejmenší oprávnění.'
    },
    medium: {
      en: 'The original five requests.',
      cs: 'Původních pět žádostí.'
    },
    hard: {
      en: 'Judgment calls where trust, prior approval, and process each pull in a different direction — read past the job title.',
      cs: 'Rozhodnutí vyžadující úsudek, kde důvěra, dřívější schválení a proces táhnou každý jinam — čti dál než jen pracovní titul.'
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
    const REQUESTS = LEVELS[level];
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
            ISMS.showResult(resultSlot, 'privileged-tools', score, MAX, level);
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
