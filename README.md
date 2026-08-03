# ISMS Hands-On Lab

Interaktivní cvičení doplňující kurz Czechitas Kyberbezpečnost — moduly
Secure Configuration, Systems & Network Security a Threat Intelligence /
Physical Security. Vyzkoušej si koncepty z přednášek na zjednodušené hands-on
simulaci: skórování CVSS, hledání slabin fyzické bezpečnosti, klasifikaci
konfiguračních změn, výběr kryptografických nástrojů, hardening serveru,
schvalování žádostí o instalaci privilegovaného softwaru, uplatnění
nejmenších oprávnění a návrh síťové segmentace.

## Vyzkoušet

https://srameko.github.io/isms-hands-on-lab/

## Moduly

| # | Modul | Co si procvičíš |
|---|--------|-------------------|
| 1 | 🎯 Zranitelnosti | Odhad závažnosti podle CVSS 4.0, stavba vektorů v živé kalkulačce |
| 2 | 🏢 Fyzická bezpečnost | Hledání slabin na půdorysu kanceláře |
| 3 | ⚖️ CM vs. CHM | Klasifikace konfiguračních změn: rutinní baseline, nebo schválení přes Change Management? |
| 4 | 🔐 Kryptografie | Výběr správného kryptografického nástroje pro každý scénář |
| 5 | 🛡️ Hardening | Sestavení plánu zabezpečení výchozího serveru |
| 6 | 📋 Privilegované nástroje | Schvalování nebo zamítání žádostí o instalaci softwaru |
| 7 | 🔑 PAM | Přidělení přístupu podle principu nejmenších oprávnění |
| 8 | 🕸️ Segmentace | Umístění systémů do správných síťových zón |

Postup a nejlepší skóre se ukládají jen lokálně v prohlížeči (`localStorage`)
— nikam se neodesílají. Jméno zadané na začátku slouží jen k personalizaci,
nejde o autentizaci.

K dispozici v češtině i angličtině (výchozí je čeština, kdykoliv lze
přepnout přepínačem CZ/EN), a přizpůsobuje se světlému/tmavému motivu
systému s možností ručního přepnutí (🖥️/☀️/🌙), pokud chceš jinak.

## Credits

Skórování CVSS 4.0 využívá oficiální [referenční implementaci FIRST](https://github.com/FIRSTdotorg/cvss-v4-calculator)
(BSD-2-Clause, viz `LICENSE-CVSS`), zabalenou v `cvss40.js`.

## Lokální vývoj

Stačí otevřít `index.html` v prohlížeči — žádný build krok, žádné závislosti.

## Nasazení

GitHub Pages: Settings → Pages → Deploy from branch → `main`, root folder.
Není potřeba žádný GitHub Actions workflow.
