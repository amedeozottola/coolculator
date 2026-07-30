<p align="center">
  <img src="assets/logo/logo-wordmark-preview.png" alt="Coolculator" width="480"/>
</p>

# Coolculator

PWA per la diagnosi della carica di refrigerante (superheat/subcooling) su impianti split, a partire da pressioni e temperature misurate sul campo con gruppo manometrico e termocamera/sonda.

Refrigerante supportato in v1: **R410A**. Architettura pensata per estendere ad altri refrigeranti in futuro.

## Stato del progetto

🚧 Scaffold iniziale pronto (Vite + React + TS + Tailwind + PWA). Logica applicativa non ancora implementata.

## Sviluppo locale

```bash
npm install
npm run dev      # dev server
npm run build    # build di produzione in dist/
npm run preview  # serve la build di produzione in locale
```

Il deploy su GitHub Pages è automatico via GitHub Actions ad ogni push su `main` (vedi `.github/workflows/deploy.yml`).

## Documentazione

- [`docs/ANALYSIS.md`](docs/ANALYSIS.md) — documento di analisi completo: obiettivo, requisiti, funzionalità v1/v2, stack tecnico, curva P/T R410A.
- [`CLAUDE.md`](CLAUDE.md) — punto di partenza per lo sviluppo guidato con Claude Code.

## Stack previsto

React + Vite + Tailwind CSS, PWA installabile (manifest + service worker), 100% client-side, storico misurazioni in IndexedDB. Vedi `docs/ANALYSIS.md` §6 per i dettagli.

## Licenza

Da definire.
