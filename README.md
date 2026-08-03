# ISMS Hands-On Lab

Interactive practice exercises accompanying the Czechitas Cybersecurity
course — Secure Configuration, Systems & Network Security, and Threat
Intelligence / Physical Security modules. Try out the concepts from the
slides in a hands-on, simplified simulation: CVSS scoring, spotting physical
security weaknesses, classifying config changes, choosing cryptographic
tools, hardening a server, reviewing privileged install requests, applying
least privilege, and designing network segmentation.

## Try it

https://srameko.github.io/isms-hands-on-lab/

## Modules

| # | Module | What you practice |
|---|--------|-------------------|
| 1 | 🎯 Vulnerability | Estimate CVSS 4.0 severity, build vectors in a live calculator |
| 2 | 🏢 Physical Security | Find weaknesses on an office floor plan |
| 3 | ⚖️ CM vs. CHM | Classify config changes: routine baseline or change approval? |
| 4 | 🔐 Cryptography | Pick the right cryptographic tool for each scenario |
| 5 | 🛡️ Hardening | Build a hardening plan for a default server |
| 6 | 📋 Privileged Tools | Approve or reject software install requests |
| 7 | 🔑 PAM | Assign least-privilege access to roles |
| 8 | 🕸️ Segmentation | Place systems into the correct network zones |

Progress and best scores are stored locally in the browser (`localStorage`)
— nothing is sent anywhere. The name entered at start is for personalization
only, not authentication.

Available in Czech and English (defaults to Czech, switch anytime with the
CZ/EN toggle), and follows your system's light/dark theme with a manual
override (🖥️/☀️/🌙) if you'd rather it not.

## Credits

CVSS 4.0 scoring uses the official [FIRST reference implementation](https://github.com/FIRSTdotorg/cvss-v4-calculator)
(BSD-2-Clause, see `LICENSE-CVSS`), bundled in `cvss40.js`.

## Local development

Just open `index.html` in a browser — no build step, no dependencies.

## Deployment

GitHub Pages: Settings → Pages → Deploy from branch → `main`, root folder.
No GitHub Actions workflow needed.
