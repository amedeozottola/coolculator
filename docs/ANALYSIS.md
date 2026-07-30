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
- **Stima indicativa grammi da aggiungere/togliere**: regola empirica basata sullo scostamento dal target (es. proporzionale ai °C fuori range), con disclaimer chiaro che è una stima orientativa e non un valore di precisione — va sempre verificata con step incrementali e ricalcolo.

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

### 4.5 Storico misurazioni
- Ogni misurazione salvata localmente con data/ora, dati inseriti e risultato.
- Possibilità di raggruppare misurazioni per "impianto" (nome libero, es. "Split camera - dual split esterno"), utile a chi segue più macchine.
- Vista storico con possibilità di rivedere una misurazione precedente (utile per confrontare prima/dopo una ricarica a step).

### 4.6 Step-by-step ricarica guidata
Modalità opzionale che replica il flusso "misura → aggiungi piccolo step → aspetta → rimisura" con:
- Timer di stabilizzazione integrato (2-3 minuti, con notifica sonora/vibrazione a fine countdown)
- Log automatico di ogni step (misura prima/dopo) nello storico
- Indicazione "continua" / "fermati, sei nel target" ad ogni step

## 5. Funzionalità — possibili v2 (solo elencate, non progettare ora)
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

- Caso reale di validazione (corretto dopo verifica incrociata dei dati P/T, luglio 2026 — vedi anche §3): pressione bassa **8,5 bar gauge**, temperatura tubo gas 6°C → temperatura di evaporazione teorica a 8,5 bar gauge ≈ **2°C** → superheat calcolato ≈ **4°C**.
  - Nota: la versione precedente di questo caso (7,5 bar → -3°C → superheat 9°C) usava una lettura di pressione non coerente con la convenzione gauge confermata per l'app (vedi §3) ed è stata corretta. Da riverificare comunque con una misura reale sul campo prima di usarla come test automatico definitivo.
- Range target indicativi usati come riferimento iniziale (da validare/raffinare in fase di sviluppo, eventualmente rendendoli configurabili):
  - Superheat: 5-10°C
  - Subcooling: 8-12°C
  - Pressione bassa tipica estiva: 9-12 bar
  - Pressione alta tipica estiva: 25-30 bar (dipende molto da temperatura esterna)
  - Delta T aria mandata/ripresa: 8-10°C
