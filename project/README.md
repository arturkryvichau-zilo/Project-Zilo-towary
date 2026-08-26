# Magazyn części / Towary — prototyp Zilo

Katalog serwowany przez Vercel (Root Directory = `project`).

## Adresy

| Ścieżka | Plik |
|---|---|
| `/` | `Magazyn czesci - High Fidelity.dc.html` — plansza główna |
| `/wycena` | `konfigurator-wycen-2/v2.html` |
| `/oferta` | `konfigurator-ofert/v1.html` |

Przekierowania definiuje `vercel.json`. Bez nich plansza główna jest praktycznie
nieosiągalna — jej nazwa zawiera spacje i polskie znaki.

## Wdrożenie

`git push origin main` — Vercel buduje sam. Statyczne pliki, bez kroku budowania.
