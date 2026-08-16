/* Module 4 — Cryptography: pick the right tool for the scenario */
(function () {
  'use strict';

  const tr = ISMS.tr;

  const TOOLS = [
    { key: 'hash', text: { en: 'Hashing (salted)', cs: 'Hashování (se solí)' } },
    { key: 'sym', text: { en: 'Symmetric encryption', cs: 'Symetrické šifrování' } },
    { key: 'asym', text: { en: 'Asymmetric encryption', cs: 'Asymetrické šifrování' } },
    { key: 'sig', text: { en: 'Digital signature', cs: 'Digitální podpis' } },
    { key: 'hmac', text: { en: 'HMAC', cs: 'HMAC' } },
    { key: 'exch', text: { en: 'Asymmetric key exchange', cs: 'Asymetrická výměna klíčů' } }
  ];

  const LEVELS = {
    easy: [
      {
        text: { en: 'Store a new user’s password when they sign up.', cs: 'Uložit heslo nového uživatele při registraci.' },
        answer: 'hash',
        why: {
          en: 'Passwords must be one-way — use salted hashing (e.g. bcrypt/Argon2), never encryption you could reverse.',
          cs: 'Hesla musí být jednosměrná — použij hashování se solí (např. bcrypt/Argon2), nikdy ne šifrování, které by šlo dešifrovat.'
        }
      },
      {
        text: { en: 'Encrypt a folder of files on your own laptop with a passphrase only you know, so nobody else can read them if it’s stolen.', cs: 'Zašifrovat složku souborů na vlastním notebooku heslem, které znáš jen ty, aby je nikdo nepřečetl v případě krádeže.' },
        answer: 'sym',
        why: {
          en: 'A single party protecting their own data with one secret they control — the textbook case for symmetric encryption.',
          cs: 'Jedna strana chrání vlastní data jedním tajemstvím, které sama spravuje — učebnicový případ pro symetrické šifrování.'
        }
      },
      {
        text: { en: 'Let anyone on the internet send you an encrypted message without ever having met you or shared a secret first.', cs: 'Umožnit komukoli na internetu poslat ti zašifrovanou zprávu, aniž by tě kdy potkal nebo si s tebou předem sdílel tajemství.' },
        answer: 'asym',
        why: {
          en: 'Asymmetric encryption — the sender only needs your published public key, no prior shared secret required.',
          cs: 'Asymetrické šifrování — odesílatel potřebuje jen tvůj zveřejněný veřejný klíč, žádné předem sdílené tajemství není potřeba.'
        }
      },
      {
        text: { en: 'Prove that a software update file was really published by the vendor and hasn’t been swapped for a malicious one.', cs: 'Dokázat, že soubor s aktualizací softwaru skutečně vydal výrobce a nebyl vyměněn za škodlivý.' },
        answer: 'sig',
        why: {
          en: 'Digital signature = hash + asymmetric signing — proves both integrity and the publisher’s identity.',
          cs: 'Digitální podpis = hash + asymetrické podepsání — dokazuje jak integritu, tak identitu vydavatele.'
        }
      },
      {
        text: { en: 'Confirm an API request really came from a partner system that shares a secret key with you — the request body doesn’t need to stay confidential.', cs: 'Potvrdit, že API požadavek skutečně přišel od partnerského systému, se kterým sdílíš tajný klíč — tělo požadavku nemusí zůstat důvěrné.' },
        answer: 'hmac',
        why: {
          en: 'HMAC / message authentication code — integrity and authenticity with a shared key, no encryption of the content needed.',
          cs: 'HMAC / kód pro autentizaci zprávy — integrita a autenticita se sdíleným klíčem, bez nutnosti šifrovat obsah.'
        }
      },
      {
        text: { en: 'Let a customer’s browser and your web server agree on a session key right at the start of an HTTPS connection.', cs: 'Umožnit prohlížeči zákazníka a tvému webovému serveru dohodnout se na klíči relace hned na začátku HTTPS spojení.' },
        answer: 'exch',
        why: {
          en: 'Key exchange (e.g. Diffie-Hellman/ECDHE) lets both sides derive a shared secret without ever transmitting it — this is exactly the TLS handshake.',
          cs: 'Výměna klíčů (např. Diffie-Hellman/ECDHE) umožní oběma stranám odvodit sdílené tajemství, aniž by se kdy přenášelo — přesně tohle dělá TLS handshake.'
        }
      }
    ],
    medium: [
      {
        text: { en: 'Store user passwords in the database.', cs: 'Uložit hesla uživatelů do databáze.' },
        answer: 'hash',
        why: {
          en: 'Passwords must be one-way — use salted hashing (e.g. bcrypt/Argon2), never encryption you could reverse.',
          cs: 'Hesla musí být jednosměrná — použij hashování se solí (např. bcrypt/Argon2), nikdy ne šifrování, které by šlo dešifrovat.'
        }
      },
      {
        text: { en: 'Send a confidential contract to a client by email.', cs: 'Poslat klientovi důvěrnou smlouvu e-mailem.' },
        answer: 'asym',
        why: {
          en: 'Asymmetric (or hybrid: symmetric content + asymmetric key exchange) — you don’t share a secret key with the client in advance.',
          cs: 'Asymetrické (nebo hybridní: symetrický obsah + asymetrická výměna klíčů) — s klientem si předem nesdílíš tajný klíč.'
        }
      },
      {
        text: { en: 'Verify a downloaded software update hasn’t been tampered with.', cs: 'Ověřit, že stažená aktualizace softwaru nebyla pozměněna.' },
        answer: 'sig',
        why: {
          en: 'Digital signature = hash + asymmetric signing — proves both integrity and the publisher’s identity.',
          cs: 'Digitální podpis = hash + asymetrické podepsání — dokazuje jak integritu, tak identitu vydavatele.'
        }
      },
      {
        text: { en: 'Encrypt a database at rest on a server.', cs: 'Zašifrovat databázi uloženou na serveru (data at rest).' },
        answer: 'sym',
        why: {
          en: 'Symmetric (e.g. AES-256) — speed matters and a single system controls the key.',
          cs: 'Symetrické (např. AES-256) — záleží na rychlosti a klíč spravuje jediný systém.'
        }
      },
      {
        text: { en: 'Two systems need to agree on a shared secret over an untrusted network.', cs: 'Dva systémy se potřebují shodnout na sdíleném tajemství přes nedůvěryhodnou síť.' },
        answer: 'exch',
        why: {
          en: 'Key exchange (e.g. Diffie-Hellman) lets both sides derive a shared secret without ever transmitting it.',
          cs: 'Výměna klíčů (např. Diffie-Hellman) umožní oběma stranám odvodit sdílené tajemství, aniž by se kdy přenášelo.'
        }
      },
      {
        text: { en: 'Confirm a message wasn’t altered in transit, without needing confidentiality.', cs: 'Potvrdit, že zpráva nebyla při přenosu změněna, aniž je potřeba důvěrnost.' },
        answer: 'hmac',
        why: {
          en: 'HMAC / message authentication code — integrity and authenticity with a shared key, no encryption of content.',
          cs: 'HMAC / kód pro autentizaci zprávy — integrita a autenticita se sdíleným klíčem, bez šifrování obsahu.'
        }
      }
    ],
    hard: [
      {
        text: { en: 'An internal build pipeline caches compiled artifacts by content, purely to decide whether an expensive rebuild can be skipped. It’s a private, non-networked tool with no attacker in the picture.', cs: 'Interní build pipeline si podle obsahu ukládá zkompilované artefakty do cache, čistě aby rozhodla, jestli lze přeskočit nákladné sestavení. Jde o soukromý nástroj bez síťového přístupu a bez útočníka ve hře.' },
        answer: 'hash',
        why: {
          en: 'No adversary and no shared secret are involved — a plain hash is the simplest correct tool. Reaching for HMAC or a signature here would just be unneeded complexity.',
          cs: 'Není zde žádný útočník ani sdílené tajemství — obyčejný hash je nejjednodušší správný nástroj. Sáhnout po HMAC nebo podpisu by tu byla zbytečná komplikace navíc.'
        }
      },
      {
        text: { en: 'A backend service must store third-party API keys so it can present them in full, in plaintext, to authenticate its own outbound calls.', cs: 'Backendová služba musí ukládat klíče k API třetích stran, aby je mohla v plném znění, v čistém textu, předkládat k autentizaci svých odchozích volání.' },
        answer: 'sym',
        why: {
          en: 'The key must be recoverable in its original form to be reused — unlike a password, you cannot hash it. Reversible symmetric encryption, with tightly controlled key management, is the right tool, not hashing.',
          cs: 'Klíč musí být opětovně získatelný ve svém původním tvaru, aby šel znovu použít — na rozdíl od hesla ho nelze hashovat. Správný nástroj je reverzibilní symetrické šifrování s přísně řízenou správou klíčů, ne hashování.'
        }
      },
      {
        text: { en: 'A whistleblower tip portal must let anonymous submitters — who have no account and share no prior secret with the newsroom — upload documents that only the newsroom’s editors can ever decrypt.', cs: 'Portál pro anonymní oznámení musí umožnit odesílatelům bez účtu a bez jakéhokoli předem sdíleného tajemství s redakcí nahrát dokumenty, které dokážou dešifrovat jen redakční editoři.' },
        answer: 'asym',
        why: {
          en: 'No pre-shared secret exists and the sender is anonymous and one-off — classic asymmetric encryption using the editors’ published public key.',
          cs: 'Neexistuje žádné předem sdílené tajemství a odesílatel je anonymní a jednorázový — klasické asymetrické šifrování pomocí zveřejněného veřejného klíče editorů.'
        }
      },
      {
        text: { en: 'Customers need to verify a downloadable PDF invoice really came from the company and wasn’t altered, but they have no account or shared secret with the company.', cs: 'Zákazníci potřebují ověřit, že stažená PDF faktura skutečně pochází od firmy a nebyla pozměněna, ale nemají s firmou účet ani sdílené tajemství.' },
        answer: 'sig',
        why: {
          en: 'Same shape as verifying a software update: proving both integrity and origin to a party you share no secret with needs a signature, not just a hash or HMAC.',
          cs: 'Stejný princip jako ověřování aktualizace softwaru: prokázat integritu i původ straně, se kterou nesdílíš žádné tajemství, vyžaduje podpis, ne jen hash nebo HMAC.'
        }
      },
      {
        text: { en: 'A backup service wants to detect whether an archived log file was tampered with after being written to cold storage. Both the writer and any future verifier are the same internal system, holding one shared secret — no outside party ever checks it.', cs: 'Zálohovací služba chce zjistit, zda byl archivovaný log soubor pozměněn po zápisu do studeného úložiště. Zapisovatel i budoucí ověřovatel je stále stejný interní systém, který drží jedno sdílené tajemství — žádná vnější strana ho nikdy neověřuje.' },
        answer: 'hmac',
        why: {
          en: 'A plain hash alone doesn’t protect against tampering, since anyone editing the file could just recompute a fresh hash to match. HMAC’s shared secret means only holders of that secret can produce a valid check value.',
          cs: 'Samotný hash proti pozměnění nechrání, protože kdokoli soubor upraví, si může prostě dopočítat nový odpovídající hash. Sdílené tajemství u HMAC znamená, že platnou kontrolní hodnotu dokáže vytvořit jen ten, kdo tajemství zná.'
        }
      },
      {
        text: { en: 'Two low-power IoT sensors need to agree on a one-time session key over an insecure radio link, with no secret shared in advance, before switching to fast symmetric encryption for the actual sensor data.', cs: 'Dva IoT senzory s nízkým výkonem se potřebují domluvit na jednorázovém klíči relace přes nezabezpečené rádiové spojení, bez jakéhokoli předem sdíleného tajemství, než přejdou na rychlé symetrické šifrování samotných senzorových dat.' },
        answer: 'exch',
        why: {
          en: 'This is exactly what key exchange (e.g. ECDH) is for — deriving a shared secret over an insecure channel without ever transmitting it, then handing off to symmetric crypto for the bulk data.',
          cs: 'Přesně na tohle je výměna klíčů (např. ECDH) — odvození sdíleného tajemství přes nezabezpečený kanál, aniž by se kdy přenášelo, a následné předání symetrické kryptografii pro objemná data.'
        }
      }
    ]
  };

  const DESCRIPTIONS = {
    easy: {
      en: 'Textbook cases, one obvious right answer each — a good place to build intuition.',
      cs: 'Učebnicové případy s jednou jasně správnou odpovědí — dobré na vybudování základní intuice.'
    },
    medium: {
      en: 'The original six scenarios.',
      cs: 'Původních šest scénářů.'
    },
    hard: {
      en: 'Tricky edge cases — reversibility, threat models, and who needs to trust whom. Tests whether you understand why, not just the label.',
      cs: 'Zapeklité hraniční případy — reverzibilita, model hrozeb a kdo komu musí věřit. Ověří, jestli rozumíš proč, ne jen nálepce.'
    }
  };

  const POINTS_PER = 10;
  const MAX = LEVELS.medium.length * POINTS_PER; // 60

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
    const SCENARIOS = LEVELS[level];
    let score = 0;
    let answered = 0;

    const intro = document.createElement('p');
    intro.className = 'module-intro';
    intro.textContent = tr({
      en: 'For each situation, pick the right cryptographic approach. Only one answer is correct per scenario.',
      cs: 'Pro každou situaci vyber správný kryptografický přístup. U každého scénáře je správná jen jedna odpověď.'
    });
    container.appendChild(intro);

    const resultSlot = document.createElement('div');

    SCENARIOS.forEach((sc, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h3>' + tr({ en: 'Scenario', cs: 'Scénář' }) + ' ' + (idx + 1) + '</h3>' +
        '<p>' + tr(sc.text) + '</p>' +
        '<div class="choice-row" data-row></div>' +
        '<div data-feedback></div>';
      const row = card.querySelector('[data-row]');
      TOOLS.forEach(tool => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.textContent = tr(tool.text);
        b.dataset.key = tool.key;
        b.addEventListener('click', () => {
          if (row.dataset.done) return;
          row.dataset.done = '1';
          answered++;
          const correct = tool.key === sc.answer;
          if (correct) score += POINTS_PER;
          row.querySelectorAll('.choice').forEach(x => {
            x.disabled = true;
            if (x.dataset.key === sc.answer) x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
          });
          card.querySelector('[data-feedback]').innerHTML =
            '<div class="feedback-line ' + (correct ? 'ok' : 'bad') + '">' +
            (correct ? '✓ ' : '✗ ') + tr(sc.why) + '</div>';
          if (answered === SCENARIOS.length) {
            ISMS.showResult(resultSlot, 'crypto', score, MAX, level);
          }
        });
        row.appendChild(b);
      });
      container.appendChild(card);
    });

    container.appendChild(resultSlot);
  }

  ISMS.registerModule({
    id: 'crypto',
    title: { en: 'Cryptography', cs: 'Kryptografie' },
    icon: '🔐',
    maxScore: MAX,
    render
  });
})();
