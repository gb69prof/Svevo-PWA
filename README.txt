# Svevo PWA

## Contenuto
PWA didattica multipagina dedicata a Italo Svevo e a *La coscienza di Zeno*.

## Avvio locale
1. Estrai lo ZIP.
2. Apri un terminale nella cartella `svevo-pwa`.
3. Avvia un server semplice, ad esempio:
   - `python3 -m http.server 8000`
4. Apri `http://localhost:8000`.
5. Verifica in Chrome DevTools:
   - Manifest caricato
   - Service worker attivo
   - installabilità
   - offline della shell UI

## Pubblicazione su GitHub Pages
1. Crea o apri il repository GitHub.
2. Carica l’intero contenuto della cartella `svevo-pwa` nella root del repo.
3. Attiva GitHub Pages dalla branch principale.
4. Apri l’URL pubblico del repo, ad esempio:
   `https://TUO-ACCOUNT.github.io/NOME-REPO/`
5. Verifica:
   - installazione da Chrome su Android
   - aggiunta alla Home da Safari su iPhone/iPad
   - funzionamento offline dopo il primo caricamento

## Struttura
- `index.html` home della PWA
- `*.html` lezioni multipagina
- `assets/css/styles.css` stile globale
- `assets/js/pwa.js` registrazione service worker + update banner
- `service-worker.js` cache shell + runtime caching + offline fallback
- `manifest.json` configurazione installazione
- `offline.html` fallback offline
- `assets/images/` immagini ottimizzate WebP
- `assets/icons/` icone PWA
