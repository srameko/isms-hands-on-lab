/* Module 5 — Hardening: pick the right remediations */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const LEVELS = {
    easy: {
      desc: {
        en: 'Freshly deployed test server for a weekend workshop. Admin account uses password <code>admin123</code>. ' +
          'Telnet is running but nobody uses it. The firewall allows all inbound traffic. ' +
          'The OS hasn’t been updated in over a year. There is no logging configured at all.',
        cs: 'Čerstvě nasazený testovací server pro víkendový workshop. Administrátorský účet má heslo <code>admin123</code>. ' +
          'Běží Telnet, který nikdo nepoužívá. Firewall povoluje veškerý příchozí provoz. ' +
          'OS nebyl aktualizován už přes rok. Není nastavené žádné logování.'
      },
      items: [
        { text: { en: 'Change the default admin password', cs: 'Změnit výchozí heslo administrátora' },
          good: true, why: { en: 'admin123 is trivially guessable — first thing to fix.', cs: 'admin123 je triviálně uhodnutelné — první věc k opravě.' } },
        { text: { en: 'Disable the unused Telnet service', cs: 'Vypnout nevyužívanou službu Telnet' },
          good: true, why: { en: 'An unused, unencrypted service is pure attack surface for no benefit.', cs: 'Nevyužívaná, nešifrovaná služba je čistě útočná plocha navíc bez jakéhokoli přínosu.' } },
        { text: { en: 'Restrict the firewall to only the ports the server actually needs', cs: 'Omezit firewall jen na porty, které server skutečně potřebuje' },
          good: true, why: { en: 'Default-deny; open only what’s required.', cs: 'Výchozí zákaz; otevřít jen to, co je potřeba.' } },
        { text: { en: 'Install the year’s worth of pending OS updates', cs: 'Nainstalovat rok nashromážděné aktualizace OS' },
          good: true, why: { en: 'A year of unpatched vulnerabilities is a serious exposure.', cs: 'Rok bez záplat znamená vážné vystavení riziku.' } },
        { text: { en: 'Turn on basic logging so activity on the server can be reviewed', cs: 'Zapnout základní logování, aby šla aktivita na serveru zpětně dohledat' },
          good: true, why: { en: 'Without any logs you can’t detect or investigate incidents at all.', cs: 'Bez jakýchkoli logů nelze incidenty vůbec detekovat ani vyšetřovat.' } },
        { text: { en: 'Require SSH key-based login instead of a password', cs: 'Vyžadovat přihlášení přes SSH klíč místo hesla' },
          good: true, why: { en: 'Passwords over SSH are a brute-force magnet — keys aren’t.', cs: 'Hesla přes SSH přímo lákají na brute-force útok — klíče ne.' } },
        { text: { en: 'Delete all existing log files to “start fresh” and save disk space', cs: 'Smazat všechny existující logy, aby se „začalo od nuly“ a ušetřilo místo na disku' },
          good: false, why: { en: 'That destroys the audit trail you’d need to investigate anything that already happened.', cs: 'Tím zničíš záznam, který bys potřeboval k vyšetření čehokoli, co se už stalo.' } },
        { text: { en: 'Give every new employee local admin rights on this server by default, to save help-desk time', cs: 'Dát každému novému zaměstnanci defaultně lokální administrátorská práva na tomto serveru, aby se ušetřil čas helpdesku' },
          good: false, why: { en: 'A blatant violation of least privilege — admin rights should be the exception, not the default.', cs: 'Zjevné porušení principu nejmenších oprávnění — administrátorská práva by měla být výjimkou, ne výchozím stavem.' } },
        { text: { en: 'Turn the firewall off completely, since “hardening is being handled elsewhere”', cs: 'Firewall úplně vypnout, protože „hardening se řeší jinde”' },
          good: false, why: { en: 'That removes a fundamental layer of defense for no real reason.', cs: 'Tím se odstraní základní vrstva ochrany bez jakéhokoli skutečného důvodu.' } }
      ]
    },
    medium: {
      desc: {
        en: 'Freshly deployed Ubuntu server. Admin account uses password <code>admin123</code>. ' +
          'FTP and Telnet services are running but unused. All 65535 ports open on the firewall. ' +
          'Last OS update: 8 months ago. No centralized logging configured. ' +
          'SSH allows root login with password.',
        cs: 'Čerstvě nasazený server Ubuntu. Administrátorský účet má heslo <code>admin123</code>. ' +
          'Běží nevyužívané služby FTP a Telnet. Na firewallu je otevřených všech 65535 portů. ' +
          'Poslední aktualizace OS: před 8 měsíci. Není nakonfigurováno centralizované logování. ' +
          'SSH umožňuje přihlášení roota heslem.'
      },
      items: [
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
      ]
    },
    hard: {
      desc: {
        en: 'A production database server subject to PCI DSS. It already has key-based SSH-only auth, a changed default password, unused services removed, and a restrictive firewall. ' +
          'Unattended automatic OS updates are enabled and apply immediately with no maintenance window. Logs are stored locally only and rotated after 7 days. ' +
          'A service account used solely by a nightly cron job has an interactive shell and a password set once at provisioning, never rotated since. ' +
          'The database listens only on <code>localhost</code>; app servers reach it over an SSH tunnel.',
        cs: 'Produkční databázový server podléhající PCI DSS. Už má přihlášení přes SSH jen na klíč, změněné výchozí heslo, odstraněné nevyužívané služby a restriktivní firewall. ' +
          'Jsou zapnuté neřízené automatické aktualizace OS, které se aplikují okamžitě bez servisního okna. Logy se ukládají jen lokálně a po 7 dnech se rotují. ' +
          'Servisní účet používaný výhradně nočním cron úkolem má interaktivní shell a heslo nastavené jednou při zřízení, od té doby nikdy neobměněné. ' +
          'Databáze naslouchá jen na <code>localhost</code>; aplikační servery se k ní připojují přes SSH tunel.'
      },
      items: [
        { text: { en: 'Keep unattended automatic updates enabled exactly as-is, including for the database engine itself', cs: 'Ponechat neřízené automatické aktualizace přesně tak, jak jsou, včetně samotného databázového enginu' },
          good: false, why: { en: 'Automatic updates are good for low-risk components, but a production PCI DSS database needs a controlled, tested patch window — unattended immediate updates risk untested breaking changes and outages.', cs: 'Automatické aktualizace jsou dobré u nízkorizikových komponent, ale produkční databáze podléhající PCI DSS potřebuje řízené a otestované servisní okno — neřízené okamžité aktualizace riskují netestované rozbíjející změny a výpadky.' } },
        { text: { en: 'Extend log retention to at least 90 days, or forward logs to a central store', cs: 'Prodloužit uchovávání logů alespoň na 90 dní, nebo je přeposílat do centrálního úložiště' },
          good: true, why: { en: 'Seven days is often too short — many incidents are discovered weeks after the initial compromise, and PCI DSS typically expects longer retention.', cs: 'Sedm dní bývá příliš málo — řada incidentů se odhalí až týdny po prvotním průniku a PCI DSS obvykle očekává delší uchovávání.' } },
        { text: { en: 'Rotate the cron job’s service-account password and replace its interactive shell with a no-login shell, keeping only the rights that job needs', cs: 'Obměnit heslo servisního účtu pro cron úkol a nahradit jeho interaktivní shell shellem bez přihlášení, s ponecháním jen práv, která úkol potřebuje' },
          good: true, why: { en: 'A never-rotated password and an unnecessary interactive shell on a service account are a real, easily-missed gap — service accounts shouldn’t be able to log in interactively at all.', cs: 'Nikdy neobměněné heslo a zbytečný interaktivní shell u servisního účtu je reálná a snadno přehlédnutelná mezera — servisní účty by se neměly moci přihlašovat interaktivně vůbec.' } },
        { text: { en: 'Since the database only listens on localhost via an SSH tunnel, skip applying host firewall rules to its port', cs: 'Protože databáze naslouchá jen na localhost přes SSH tunel, vynechat aplikaci pravidel firewallu na její port' },
          good: false, why: { en: 'Listening on localhost reduces one avenue of exposure, but it doesn’t replace firewall-based least-access rules — a compromised process on the same host, or a future misconfiguration, could still reach it. Defense in depth still applies.', cs: 'Naslouchání jen na localhost omezuje jednu cestu vystavení, ale nenahrazuje pravidla firewallu založená na principu nejmenšího přístupu — kompromitovaný proces na stejném hostiteli nebo budoucí chybná konfigurace by se k ní stále mohly dostat. Obrana do hloubky platí i tady.' } },
        { text: { en: 'Add a documented emergency “break-glass” local admin account, with its password stored in a sealed, access-logged vault, for when the identity provider is unreachable', cs: 'Přidat zdokumentovaný nouzový „break-glass“ lokální administrátorský účet, s heslem uloženým v zapečetěném trezoru s logováním přístupu, pro případ nedostupnosti identity providera' },
          good: true, why: { en: 'This is a legitimate, well-controlled exception — documented, sealed, and logged emergency access is standard practice, unlike casually handing out admin rights.', cs: 'Jde o legitimní a dobře kontrolovanou výjimku — zdokumentovaný, zapečetěný a logovaný nouzový přístup je standardní praxe, na rozdíl od nenuceného rozdávání administrátorských práv.' } },
        { text: { en: 'Skip this year’s PCI DSS-mandated penetration test for this server, since it already passes the internal hardening checklist', cs: 'Vynechat letošní penetrační test vyžadovaný PCI DSS pro tento server, protože už splňuje interní hardeningový checklist' },
          good: false, why: { en: 'Compliance requirements like mandated penetration testing are independent of internal checklist completion — one doesn’t substitute for the other.', cs: 'Požadavky na compliance jako povinný penetrační test jsou nezávislé na splnění interního checklistu — jedno nenahrazuje druhé.' } },
        { text: { en: 'Encrypt the database’s data files at rest, in addition to the existing network restriction', cs: 'Zašifrovat datové soubory databáze při klidu (at rest), navíc k existujícímu síťovému omezení' },
          good: true, why: { en: 'Encryption at rest protects against a different threat (stolen disks/backups, filesystem-level insider access) than network restriction does — they’re complementary, not redundant.', cs: 'Šifrování at rest chrání proti jiné hrozbě (odcizené disky/zálohy, přístup na úrovni souborového systému) než síťové omezení — jde o doplňující se, ne redundantní opatření.' } },
        { text: { en: 'Drop the SSH tunnel requirement and allow direct database connections from the app servers’ subnet, since it’s already an internal, trusted segment', cs: 'Zrušit požadavek na SSH tunel a povolit přímé připojení k databázi z podsítě aplikačních serverů, protože jde o interní, důvěryhodný segment' },
          good: false, why: { en: '“Internal” doesn’t mean “trusted” — removing the tunnel widens the attack surface to anything on that subnet, including a potentially compromised host.', cs: '„Interní” neznamená „důvěryhodné” — zrušení tunelu rozšíří útočnou plochu na cokoli v dané podsíti, včetně případně kompromitovaného hostitele.' } },
        { text: { en: 'Formally document and approve the current localhost + SSH-tunnel database access design via Change Management, so future changes require review', cs: 'Formálně zdokumentovat a schválit stávající návrh přístupu k databázi (localhost + SSH tunel) přes Change Management, aby budoucí změny vyžadovaly revizi' },
          good: true, why: { en: 'Turning a good architecture into a documented, approved baseline institutionalizes it — future changes then go through review instead of drifting unnoticed.', cs: 'Přeměna dobré architektury na zdokumentovanou schválenou baseline ji institucionalizuje — budoucí změny pak projdou revizí místo toho, aby si nepozorovaně „ujely“.' } }
      ]
    }
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Blatant issues on a test server — clear right and wrong calls to build the basics.',
      cs: 'Zjevné problémy na testovacím serveru — jasné správné a špatné kroky pro zvládnutí základů.'
    },
    medium: {
      en: 'The original server and checklist.',
      cs: 'Původní server a checklist.'
    },
    hard: {
      en: 'An already-hardened production database server with genuinely debatable remaining calls — patch windows, retention, defense in depth, compliance.',
      cs: 'Už zabezpečený produkční databázový server se skutečně diskutabilními zbývajícími rozhodnutími — servisní okna, retence, obrana do hloubky, compliance.'
    }
  };

  const POINTS_PER = 10;
  const MAX = LEVELS.medium.items.length * POINTS_PER; // 90

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
    const ITEMS = LEVELS[level].items;
    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'You’ve been handed this server to harden. Check every action you would take — but watch out, some of the proposed actions would do more harm than good.',
      cs: 'Máš za úkol zabezpečit (hardening) tento server. Zaškrtni každou akci, která by se měla provést — pozor, některé z navržených akcí by napáchaly víc škody než užitku.'
    });
    container.appendChild(intro);

    const desc = document.createElement('div');
    desc.className = 'callout warning';
    desc.innerHTML = '<strong>' + tr({ en: 'Server state:', cs: 'Stav serveru:' }) + '</strong> ' + tr(LEVELS[level].desc);
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
      ISMS.showResult(resultSlot, 'hardening', score, MAX, level);
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
