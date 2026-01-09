# UmeChat Client

Questa è la parte client dell'applicazione UmeChat, costruita con React, Vite e Tailwind CSS.

## Caratteristiche

- **Chat in Tempo Reale**: Comunicazione istantanea tramite Socket.io.
- **Supporto PWA**: Installabile su dispositivi mobili e desktop.
- **Interfaccia Moderna**: Design reattivo e pulito con Tailwind CSS e Framer Motion.
- **Gestione Stanze**: Creazione e accesso a stanze di chat personalizzate.
- **Anteprima Media**: Visualizzazione di immagini e video nei messaggi.

## Tecnologie Utilizzate

- **React 19**
- **Vite 7**
- **Tailwind CSS 4**
- **Socket.io Client**
- **Framer Motion**
- **React Router 7**

## Sviluppo Locale

Per eseguire il progetto localmente:

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

3. Costruisci per la produzione:
   ```bash
   npm run build
   ```

## Struttura del Progetto

- `src/components`: Componenti riutilizzabili dell'interfaccia.
- `src/pages`: Pagine principali dell'applicazione (Home, Chat, etc.).
- `src/config`: Configurazioni API e server.
- `src/hooks`: Hook React personalizzati per logica condivisa.
- `public`: Asset statici e manifest PWA.
