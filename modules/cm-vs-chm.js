/* Module 3 — CM vs. CHM: classify each config change */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const LEVELS = {
    easy: {
      before: ['X11Forwarding yes', 'PermitEmptyPasswords yes', 'ListenAddress 0.0.0.0', 'LogLevel INFO'],
      after:  ['X11Forwarding no', 'PermitEmptyPasswords no', 'ListenAddress 10.50.0.10', 'LogLevel INFO'],
      changes: [
        {
          id: 'x11',
          label: 'X11Forwarding yes → no',
          answer: 'CM',
          why: {
            en: 'Disabling an unused legacy feature is routine hardening baseline practice with negligible risk.',
            cs: 'Vypnutí nevyužívané zastaralé funkce je rutinní praxe v rámci hardeningové baseline s nepatrným rizikem.'
          }
        },
        {
          id: 'emptypw',
          label: 'PermitEmptyPasswords yes → no',
          answer: 'CM',
          why: {
            en: 'Removing a dangerous default (accounts with blank passwords could log in) is an unambiguous, pre-approved baseline improvement.',
            cs: 'Odstranění nebezpečného výchozího nastavení (účty s prázdným heslem by se mohly přihlásit) je jednoznačné, předem schválené zlepšení baseline.'
          }
        },
        {
          id: 'listen',
          label: 'ListenAddress 0.0.0.0 → 10.50.0.10',
          answer: 'CHM',
          why: {
            en: 'Moves SSH onto a brand-new management network — needs new firewall rules, coordination with the network team, and advance warning so admins aren’t locked out. That’s a Change Management call, not routine config.',
            cs: 'Přesouvá SSH do nové management sítě — je potřeba upravit firewall, koordinovat se síťovým týmem a předem upozornit adminy, aby se sami nezamkli venku. To je záležitost pro Change Management, ne rutinní konfigurace.'
          }
        }
      ]
    },
    medium: {
      before: ['PermitRootLogin no', 'PasswordAuthentication yes', 'Port 22', 'MaxAuthTries 6'],
      after:  ['PermitRootLogin yes', 'PasswordAuthentication yes', 'Port 2222', 'MaxAuthTries 3'],
      changes: [
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
      ]
    },
    hard: {
      before: ['Ciphers aes256-gcm,chacha20-poly1305,aes128-cbc', 'PermitRootLogin without-password', 'Subsystem sftp /usr/lib/openssh/sftp-server', 'LogLevel INFO'],
      after:  ['Ciphers aes256-gcm,chacha20-poly1305', 'PermitRootLogin prohibit-password', 'Subsystem sftp internal-sftp', 'LogLevel INFO'],
      changes: [
        {
          id: 'ciphers',
          label: 'Ciphers …,aes128-cbc → Ciphers … (aes128-cbc removed)',
          answer: 'CHM',
          why: {
            en: 'Looks like routine crypto hardening, but a known legacy backup appliance still depends on aes128-cbc and isn’t on the baseline’s exception list. Applying this blindly could break nightly backups — the undocumented dependency means it needs a risk assessment and Change Management approval, not silent baseline application.',
            cs: 'Vypadá to jako rutinní zpřísnění šifrování, ale na aes128-cbc je stále závislé jedno starší záložní zařízení, které není na seznamu výjimek baseline. Slepé nasazení by mohlo rozbít noční zálohy — nezdokumentovaná závislost znamená, že je potřeba posouzení rizika a schválení přes Change Management, ne tiché nasazení baseline.'
          }
        },
        {
          id: 'rootlogin',
          label: 'PermitRootLogin without-password → prohibit-password',
          answer: 'CM',
          why: {
            en: 'These are just two names for the exact same OpenSSH setting — a purely cosmetic syntax update with zero behavioral change. Don’t let the words "root login" trigger an automatic CHM reflex; nothing about access actually changes.',
            cs: 'Jde jen o dva názvy pro naprosto stejné nastavení OpenSSH — čistě kosmetická úprava syntaxe bez jakékoli změny chování. Nenech se spustit automatickým reflexem "root login = CHM" — na přístupu se ve skutečnosti nic nemění.'
          }
        },
        {
          id: 'sftp',
          label: 'Subsystem sftp /usr/lib/openssh/sftp-server → internal-sftp',
          answer: 'CM',
          why: {
            en: 'Sounds like a significant behavior change, but switching to the chroot-capable internal-sftp subsystem is part of the company’s already-approved, company-wide SFTP hardening baseline — this server is simply catching up to a standard that already went through Change Management once, company-wide.',
            cs: 'Zní to jako významná změna chování, ale přechod na chroot schopný subsystém internal-sftp je součástí už schválené, celofiremní baseline pro zabezpečení SFTP — tento server jen dohání standard, který už jednou prošel Change Managementem pro celou firmu.'
          }
        }
      ]
    }
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Clear, low-ambiguity changes — good for building a feel for the CM vs CHM boundary.',
      cs: 'Jasné změny s nízkou nejednoznačností — dobré na vybudování citu pro hranici mezi CM a CHM.'
    },
    medium: {
      en: 'The original three sshd_config changes.',
      cs: 'Původní tři změny konfigurace sshd_config.'
    },
    hard: {
      en: 'Deceptive cases — some that look routine actually need approval, and vice versa. Read the details, not just the keyword.',
      cs: 'Zavádějící případy — některé vypadají rutinně, ale potřebují schválení, a naopak. Čti detaily, ne jen klíčové slovo.'
    }
  };

  const POINTS_PER = 10;
  const MAX = LEVELS.medium.changes.length * POINTS_PER; // 30

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
    const BEFORE = LEVELS[level].before;
    const AFTER = LEVELS[level].after;
    const CHANGES = LEVELS[level].changes;
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
            ISMS.showResult(resultSlot, 'cm-vs-chm', score, MAX, level);
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
