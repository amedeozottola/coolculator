# Coolculator — Documento di Analisi (App PWA Diagnosi Carica Refrigerante)

## 0. Branding

- **Nome app**: Coolculator
- **Repo GitHub suggerito**: `coolculator` (minuscolo, coerente con convenzioni GitHub)
- **Logo**: quadrante stile manometro (zone rosso/giallo/verde con lancetta) + accento a fiocco di neve, palette blu petrolio (#0B3D5C / #0E5C82) con accento arancio/rosso (#E8432A) per la lancetta e verde (#3FA65B) per la zona target. File sorgente SVG forniti separatamente (icona quadrata per manifest PWA + versione con wordmark per README).
- **Tono**: tecnico ma con un pizzico di ironia — il nome stesso è un gioco di parole (cool + calculator), va mantenuto nei microtesti dell'app (es. messaggi di stato, empty state) senza scadere nell'infantile: restano strumenti di lavoro usati sul campo.
- **App icon PWA**: usare `icon-512.svg` (o export raster 512x512/192x192/maskable) come sorgente per `manifest.json`.

## 1. Obiettivo

Realizzare **Coolculator**, una **Progressive Web App (PWA)** installabile su smartphone, che assista un tecnico/hobbista durante la diagnosi e l'eventuale ricarica di refrigerante su impianti di climatizzazione split. L'app calcola surriscaldamento (superheat) e sottoraffreddamento (subcooling) a partire da pressioni e temperature misurate sul campo, confronta i valori con i range target del refrigerante selezionato, e restituisce un giudizio visivo immediato (carica corretta / insufficiente / eccessiva) tramite un quadrante grafico stile manometro analogico.

Utilizzo tipico: tecnico sul tetto/balcone accanto all'unità esterna, con gruppo manometrico e termocamera/sonda in mano, cellulare per inserire i dati e leggere subito l'esito — spesso con connettività scarsa o assente.

## 2. Requisiti non funzionali

- **PWA installabile**: `manifest.json` + `service worker` per funzionamento offline completo e icona in home screen.
- **100% client-side**: nessun dato inviato a server esterni. Tutti i calcoli (curve P/T, formule) devono girare nel browser/dispositivo, sia per privacy sia per garantire funzionamento senza connessione.
- **Mobile-first**: UI pensata per uno schermo di smartphone tenuto con una mano, font e touch target grandi (si usa spesso con guanti o mani sporche/bagnate).
- **Persistenza locale**: storico misurazioni salvato sul dispositivo (localStorage/IndexedDB), nessun account richiesto.
- **Leggibilità in esterno**: contrasto elevato, dark/light mode, testo grande — va usata anche in pieno sole.

## 3. Refrigeranti supportati

- **R410A** — refrigerante primario, da implementare per primo con la curva P/T completa.
- Architettura dati pensata per estendere facilmente in futuro: R32, R22, R134a, R290. Ogni refrigerante è un modulo dati indipendente (curva di saturazione + range target consigliati), selezionabile da un menu a tendina. Non implementare gli altri nella v1, ma non hardcodare R410A in modo che aggiungerne altri richieda di riscrivere la logica.

### Dati necessari per la curva P/T dell'R410A
Tabella di saturazione pressione↔temperatura, copertura indicativa da -40°C a +60°C, con interpolazione lineare tra i punti tabulati per pressioni intermedie. La tabella va incorporata come dato statico nell'app (JSON o array), non recuperata da API esterne.

**Convenzione pressione: relativa/gauge**, coerente con i gruppi manometrici usati sul campo (letture a 0 bar/psi ad atmosfera, es. Testo, Refco, Yellow Jacket, Fieldpiece — verificato con test pratico: manometro scollegato e aperto all'aria legge 0). La tabella P/T incorporata nel codice deve quindi contenere valori di pressione **gauge**, non assoluti. Se in futuro serve un valore assoluto per calcoli intermedi, sottrarre/aggiungere 1,013 bar in un punto unico e documentato del codice, non sparso nella logica.

Valori di riferimento verificati (fonte: tabelle di saturazione R410A incrociate da due fonti indipendenti, luglio 2026):

| °C | bar gauge |
|---|---|
| -4 | ~6.02 |
| -3 | ~6.26 |
| -2 | ~6.50 |
| 0 | ~7.00 |
| 2 | ~7.52 |
| 6 | ~8.63 |

La tabella completa da -40°C a +60°C va ricostruita/verificata in fase di implementazione da una fonte tecnica completa (es. datasheet produttore refrigerante, norma EN, o PT chart HVAC affidabile), usando questi punti come cross-check di coerenza.

## 4. Funzionalità — v1 (MVP)

### 4.1 Input dati misurazione
Form con i seguenti campi (tutti con unità selezionabile dove ha senso):

| Campo | Obbligatorio | Unità selezionabili | Note |
|---|---|---|---|
| Refrigerante | Sì | — | Default R410A |
| Pressione bassa (linea gas) | Sì | bar / MPa / psi | |
| Temperatura reale tubo gas | Sì | °C / °F | |
| Pressione alta (linea liquido) | No | bar / MPa / psi | Se assente, calcola solo superheat |
| Temperatura reale tubo liquido | No | °C / °F | |
| Temperatura aria esterna | No | °C / °F | Usata per controlli di coerenza |
| Temperatura aria interna / set termostato | No | °C / °F | |
| Temperatura aria in mandata (unità interna) | No | °C / °F | Per calcolo Delta T aria |
| Temperatura aria in ripresa (unità interna) | No | °C / °F | Per calcolo Delta T aria |

### 4.2 Calcoli

- **Temperatura di evaporazione teorica** = lookup/interpolazione sulla curva P/T da pressione bassa.
- **Superheat** = temperatura reale tubo gas − temperatura di evaporazione teorica.
- **Temperatura di condensazione teorica** (se pressione alta presente) = lookup/interpolazione sulla curva P/T da pressione alta.
- **Subcooling** (se dati disponibili) = temperatura di condensazione teorica − temperatura reale tubo liquido.
- **Delta T aria** (se dati disponibili) = temperatura ripresa − temperatura mandata. Target indicativo 8-10°C, mostrato come dato di supporto, non nel gauge principale.
- **Stima indicativa grammi da aggiungere/togliere**: regola empirica basata sullo scostamento dal target (proporzionale ai °C fuori range), con disclaimer chiaro che è una stima orientativa e non un valore di precisione — va sempre verificata con step incrementali e ricalcolo. Implementata in `src/lib/charge-estimate.ts` (luglio 2026) con un fattore g/°C dichiarato esplicitamente come placeholder non validato su impianti reali, da tarare con l'uso sul campo. Aggiunto anche un target di pressione bassa/alta (bar) corrispondente al range target, più pratico da seguire sul manometro durante una ricarica incrementale rispetto a un target in °C.
  - Nota di scope (luglio 2026): valutata e scartata per ora una regola alternativa basata sulla differenza tra temperatura tubo gas e tubo liquido, letta dall'utente da una fonte non specificata — non essendo chiaro se generalizzabile a qualsiasi impianto R410A o specifica di un produttore, si è preferito riusare lo scostamento superheat/subcooling già validato. Da rivalutare se emerge una fonte tecnica verificabile.

### 4.3 Controlli di coerenza automatici (avvisi, non blocchi)
L'app deve segnalare — senza bloccare l'inserimento — pattern di dati sospetti, ad esempio:
- Temperatura tubo liquido troppo distante (in basso) dalla temperatura esterna.
- Differenza tra temperatura tubo gas e tubo liquido troppo piccola.
- Superheat o subcooling negativi oltre una soglia plausibile.
- Valori di pressione fuori dal range fisico plausibile per il refrigerante selezionato.

Messaggio tipo: "Dato sospetto: la temperatura del tubo liquido sembra troppo bassa rispetto all'esterno. Verifica di aver misurato a contatto diretto sul rame, non sopra la guaina isolante."

### 4.4 Output grafico — il "manometro" di giudizio
Componente principale della UI: quadrante analogico (lancetta su arco, non barra lineare) che rappresenta lo scostamento dal target.

- **Zona verde centrale**: valore nel range target → "Carica corretta"
- **Zone gialle/arancio**: leggero scostamento → "Leggermente scarico" / "Leggermente sovraccarico"
- **Zone rosse agli estremi**: scostamento marcato → "Carica insufficiente" / "Carica eccessiva"
- Numero grande sotto il gauge con lo scostamento in °C dal centro del range target
- Se disponibili sia superheat che subcooling, mostrare due gauge affiancati (o selezionabili a tab), non mescolare i due giudizi in un solo numero

### 4.5 Storico misurazioni — RIMANDATO (decisione luglio 2026)
Spostato fuori dalla v1: verrà implementato insieme a un'anagrafica impianti vera e propria (multi-impianto, storico misurazioni per impianto) quando l'app avrà un backend — l'attuale scope 100% client-side/IndexedDB non è più ritenuto il punto di arrivo per questa funzionalità. Restano valide le note originali come riferimento per quando si riprenderà il lavoro:
- Ogni misurazione salvata con data/ora, dati inseriti e risultato.
- Raggruppamento misurazioni per "impianto" (nome libero, es. "Split camera - dual split esterno").
- Vista storico con possibilità di rivedere una misurazione precedente (utile per confrontare prima/dopo una ricarica a step).

### 4.6 Step-by-step ricarica guidata
Modalità opzionale che replica il flusso "misura → aggiungi piccolo step → aspetta → rimisura" con:
- Timer di stabilizzazione integrato (2-3 minuti, con notifica sonora/vibrazione a fine countdown)
- Log automatico di ogni step (misura prima/dopo) nello storico
- Indicazione "continua" / "fermati, sei nel target" ad ogni step

## 5. Funzionalità — possibili v2 (solo elencate, non progettare ora)
- Guida consultabile in-app con immagini esplicative dei punti di misura (dove mettere la sonda su tubo gas/liquido, differenza aria in mandata/ripresa, ecc.), richiamabile da tooltip/icona "?" accanto ai campi del form. Nata da un'esigenza di chiarezza discussa durante lo sviluppo del form input (luglio 2026): la v1 avrà comunque etichette e micro-copy chiari nel form, le immagini sono un arricchimento rimandato.
- Tabella P/T consultabile manualmente come fallback offline.
- Checklist di sicurezza pre-intervento (verifica perdite, patentino F-Gas, DPI).
- Esportazione/condivisione di un report PDF della misurazione.
- Supporto multi-refrigerante attivo (R32, R22, R134a, R290).
- Calcolo peso di carica da targa dati impianto (metodo a peso, alternativo al superheat/subcooling).

## 6. Stack tecnico suggerito

- **Framework**: React (o vanilla JS se si vuole minimizzare il peso) con build tramite Vite — buon supporto PWA nativo (`vite-plugin-pwa`).
- **Grafica gauge**: componente SVG custom (per controllo preciso su zone colorate e lancetta) piuttosto che una libreria di charting generica.
- **Storage**: IndexedDB (via una libreria leggera tipo `idb`) per lo storico misurazioni, più robusto di localStorage per dataset che cresce nel tempo.
- **Styling**: Tailwind CSS, con attenzione a dark mode e contrasto per uso in esterno.
- **Nessun backend**: tutto client-side, deploy come sito statico (anche solo per hosting, es. GitHub Pages, Netlify, o semplicemente file locali).

## 7. Punto di partenza per lo sviluppo

Suggerimento di ordine di lavoro per Claude Code:
1. Scaffold del progetto (Vite + React + Tailwind + plugin PWA).
2. Modulo dati curva P/T R410A (struttura dati + funzione di interpolazione, testata con qualche valore noto).
3. Form di input con validazione base e conversione unità.
4. Logica di calcolo (superheat, subcooling, controlli di coerenza).
5. Componente gauge SVG con le zone colorate.
6. Storico misurazioni (IndexedDB) + vista lista/dettaglio.
7. Manifest PWA + service worker + test di installabilità e funzionamento offline.
8. Rifinitura UI (dark mode, dimensioni touch target, test su schermo piccolo).

## 8. Riferimenti di dominio (contesto raccolto durante l'analisi)

- Caso reale di validazione (corretto dopo verifica con tabella P/T ufficiale, luglio 2026 — vedi anche §3): pressione bassa **7,5 bar gauge**, temperatura tubo gas 6°C → temperatura di evaporazione teorica a 7,5 bar gauge ≈ **2°C** (interpolando tra +2°C/7,49 bar e +3°C/7,76 bar sulla tabella di `tabella_pt_gas.html`) → superheat calcolato ≈ **4°C**.
  - Nota: le versioni precedenti di questo caso (prima "7,5 bar → -3°C → superheat 9°C", poi corretta erroneamente in "8,5 bar → 2°C") sono state entrambe superate: il valore di pressione corretto è 7,5 bar (quello originale misurato sul campo), l'errore era solo nel calcolo della temperatura di evaporazione teorica associata.

### Tabella P/T di riferimento (fonte: `tabella_pt_gas.html`, luglio 2026)

Tabella ritenuta affidabile: incrociata con una fonte indipendente sui punti -4/0/+2/+6°C, scarto ≤0,05 bar. Valori in **bar gauge**. Copre R410A (usato per la tabella dati statica dell'app, v1) e R32 (tenuto come riferimento per un'eventuale v2, non implementato ora — vedi §5).

| °C | R410A (bar) | R32 (bar) |
|---|---|---|
| -50 | 0,11 | 0,11 |
| -45 | 0,42 | 0,41 |
| -40 | 0,78 | 0,78 |
| -36 | 1,09 | 1,10 |
| -35 | 1,22 | 1,22 |
| -32 | 1,46 | 1,50 |
| -30 | 1,74 | 1,74 |
| -28 | 1,92 | 2,00 |
| -25 | 2,34 | 2,35 |
| -24 | 2,42 | 2,50 |
| -20 | 3,05 | 3,06 |
| -16 | 3,62 | 3,80 |
| -15 | 3,83 | 3,88 |
| -12 | 4,33 | 4,40 |
| -10 | 4,79 | 4,83 |
| -8 | 5,12 | 5,15 |
| -5 | 5,86 | 5,91 |
| -4 | 5,99 | 6,06 |
| 0 | 7,06 | 7,14 |
| +1 | 7,23 | 7,38 |
| +2 | 7,49 | 7,65 |
| +3 | 7,76 | 7,93 |
| +4 | 8,02 | 8,15 |
| +5 | 8,42 | 8,52 |
| +6 | 8,61 | 8,80 |
| +7 | 8,90 | 9,10 |
| +8 | 9,19 | 9,30 |
| +9 | 9,52 | 9,73 |
| +10 | 9,95 | 10,08 |
| +12 | 10,46 | 10,80 |
| +15 | 11,65 | 11,82 |
| +16 | 11,86 | 12,10 |
| +20 | 13,55 | 13,76 |
| +24 | 15,02 | 15,30 |
| +25 | 15,65 | 15,91 |
| +28 | 16,81 | 17,15 |
| +30 | 17,98 | 18,28 |
| +32 | 18,75 | 19,20 |
| +35 | 20,54 | 20,90 |
| +36 | 20,84 | 21,50 |
| +40 | 23,36 | 23,78 |
| +41 | 23,77 | 24,38 |
| +42 | 24,37 | 25,00 |
| +43 | 24,98 | 25,63 |
| +44 | 25,52 | 26,20 |
| +45 | 26,45 | 26,94 |
| +46 | 26,90 | 27,60 |
| +47 | 27,56 | 28,28 |
| +48 | 28,14 | 29,00 |
| +49 | 28,92 | 29,68 |
| +50 | 29,84 | 30,40 |
| +52 | 30,96 | 31,90 |
| +56 | 33,99 | 35,00 |
| +60 | 37,24 | 38,40 |
| +64 | 40,75 | 42,00 |
- Range target indicativi usati come riferimento iniziale (da validare/raffinare in fase di sviluppo, eventualmente rendendoli configurabili):
  - Superheat: 5-10°C
  - Subcooling: 8-12°C
  - Pressione bassa tipica estiva: 9-12 bar
  - Pressione alta tipica estiva: 25-30 bar (dipende molto da temperatura esterna)
  - Delta T aria mandata/ripresa: 8-10°C
