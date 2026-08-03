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

  const SCENARIOS = [
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
  ];

  const POINTS_PER = 10;
  const MAX = SCENARIOS.length * POINTS_PER; // 60

  function render(container) {
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
            ISMS.showResult(resultSlot, 'crypto', score, MAX);
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
