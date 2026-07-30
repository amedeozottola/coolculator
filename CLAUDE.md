# Coolculator — Guida per Claude Code

Questo file è il punto di ingresso per lo sviluppo. Prima di scrivere codice, leggi `docs/ANALYSIS.md`, che contiene l'analisi completa (obiettivo, requisiti, funzionalità, curva P/T R410A, stack tecnico).

## Riepilogo rapido

- **App**: Coolculator — PWA installabile per calcolare superheat/subcooling di un impianto R410A e dare un giudizio visivo (gauge stile manometro) su carica insufficiente/corretta/eccessiva.
- **100% client-side**, nessun backend, deve funzionare offline dopo la prima installazione.
- **Lingua UI**: italiano. Codice, commenti, nomi di variabili/componenti: inglese (convenzione standard).
- **Logo**: già disponibile in `assets/logo/` (icona quadrata `icon-512.svg` per il manifest PWA, wordmark completo per README/landing).

## Setup iniziale

1. Scaffold progetto con Vite + React + TypeScript (se possibile, altrimenti JS puro va bene per la v1).
2. Aggiungi Tailwind CSS.
3. Aggiungi `vite-plugin-pwa` per manifest + service worker.
4. Usa `assets/logo/icon-512.svg` come sorgente per generare le icone PWA nelle dimensioni richieste (192, 512, maskable).
5. Imposta dark mode di base (l'app si userà spesso in esterno, sotto il sole).

## Ordine di sviluppo consigliato (vedi anche ANALYSIS.md §7)

- [x] 1. Scaffold progetto (Vite + React + Tailwind + plugin PWA) — fatto, `base: '/coolculator/'` impostato per GitHub Pages, icone generate da `assets/logo/icon-512.svg` in `public/icons/`, deploy automatico via `.github/workflows/deploy.yml`.
- [x] 2. Modulo dati curva di saturazione P/T per R410A — fatto: `src/lib/pt-curve.ts` (interpolazione generica, gauge) + `src/data/r410a.ts` (tabella da `docs/tabella_pt_gas.html`) + test in `src/lib/pt-curve.test.ts` (`npm run test`), validati sul caso 7,5 bar → ~2°C.
- [ ] 3. Form di input dati misurazione (vedi tabella campi in ANALYSIS.md §4.1), con conversione unità (bar/MPa/psi, °C/°F)
- [ ] 4. Logica di calcolo: superheat, subcooling, controlli di coerenza (ANALYSIS.md §4.2 e §4.3)
- [ ] 5. Componente gauge SVG (lancetta su arco con zone verde/giallo/rosso) — vedi ANALYSIS.md §4.4 per la logica delle zone
- [ ] 6. Storico misurazioni con IndexedDB (salvataggio locale, nessun account) — ANALYSIS.md §4.5
- [ ] 7. Modalità guidata "step-by-step ricarica" con timer di stabilizzazione — ANALYSIS.md §4.6
- [ ] 8. Rifinitura: manifest PWA completo, test installabilità, test offline, dark mode, touch target grandi

## Cosa NON fare nella v1

- Non implementare altri refrigeranti oltre R410A (ma strutturare il codice in modo che aggiungerli sia semplice — vedi ANALYSIS.md §3).
- Non aggiungere un backend o chiamate di rete per i calcoli: tutto deve girare offline nel browser.
- Non implementare le funzionalità elencate in ANALYSIS.md §5 (v2) — sono solo annotate per riferimento futuro.

## Convenzione pressione

Tutte le pressioni gestite dall'app (input utente, tabella P/T interna) sono **relative/gauge** (coerente con i gruppi manometrici da campo, che leggono 0 a pressione atmosferica). Non assolute. Vedi ANALYSIS.md §3.

## Dato di riferimento per validare i calcoli

Caso reale usato per validare la logica a mano (vedi ANALYSIS.md §8, corretto dopo verifica con tabella P/T ufficiale in `docs/tabella_pt_gas.html`):
pressione bassa 7,5 bar gauge + temperatura reale tubo gas 6°C → temperatura di evaporazione teorica ≈ 2°C → superheat ≈ 4°C. Usalo come test case per la funzione di calcolo del superheat.

La tabella P/T completa R410A (bar gauge, da -50°C a +64°C) è in ANALYSIS.md §8 ed è la fonte dati per il modulo `src/data/r410a.ts`.
