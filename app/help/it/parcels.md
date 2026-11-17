---
title: Disegnare le particelle e scrivere le loro descrizioni dei confini
summary: Disegnare una particella per i suoi vertici oppure inserire i tratti da un atto o da un tipo di frazionamento, verificare quanto i tratti si chiudono, indicare direzioni e distanze sulla pianta, rendere curvo un tratto qualsiasi e copiare una bozza della descrizione dei confini.
keywords: particelle, lotti, linee di proprietà, confine, atto, frazionamento, direzione, distanza, chiusura, errore di chiusura, precisione, descrizione dei confini, punto di inizio, curva, raggio, superficie, acri
from: 6793d6ce
---

Le particelle stanno sulla pianta con la direzione e la distanza lungo ciascun tratto rettilineo (una curva mostra il raggio, la lunghezza e l'angolo al centro) e il loro nome e la superficie al centro. Vanno nella stampa PDF e negli export DWG e DXF, sui layer `V-PROP` (linee) e `V-PROP-TEXT` (etichette). Tutto si trova sotto **Particelle** nel pannello di destra quando non c'è nulla di selezionato.

## Disegnare una particella

1. Fare clic su **Disegna una particella**.
2. Fare clic sui vertici, partendo dal punto di inizio. Un clic vicino a un punto di rilievo prende la posizione esatta di quel punto.
3. Fare clic di nuovo sul primo vertice, oppure premere {{key:Enter}}, per terminare. {{key:Backspace}} annulla l'ultimo vertice; {{key:Esc}} elimina i vertici inseriti finora; premerlo di nuovo per uscire dallo strumento.

## Inserire i tratti da un atto

1. Fare clic su **Inserisci i tratti da un atto**.
2. Indicare da dove partono i tratti: il numero di un punto di rilievo, oppure una coordinata nord ed est.
3. Digitare o incollare i tratti, uno per riga:
   - un tratto rettilineo: una direzione e una distanza, come `N 45°30'15" E 125.50`. Funzionano anche `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` e gli azimut (`AZ 45°30'15"`); le parole `thence`, le virgole e `feet` vengono ignorate.
   - una curva: `C R 300 L 52.36 right` (raggio e lunghezza dell'arco), oppure `C R 300 D 10°00'00" left` (raggio e angolo al centro). Una curva segue il tratto che la precede; quando non lo fa, aggiungere la sua direzione della corda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inizia una riga di commento.
4. Mentre si digita, la finestra mostra la lunghezza dei tratti, l'**errore di chiusura** (quanto distano dal punto di partenza in cui finiscono, e in quale direzione), la **precisione** (la lunghezza divisa per l'errore di chiusura, 1 : 10,000 e così via) e la superficie. Le righe che non riesce a leggere sono elencate con il loro numero di riga.
5. Fare clic su **Aggiungi la particella**. Quando i tratti non si chiudono, la particella si chiude con un tratto rettilineo che attraversa lo scarto: verificare i tratti sull'atto. Per distribuire l'errore di una poligonale di campagna sui suoi tratti, correggerla prima.

## Curve

Nelle **Proprietà** di una particella, ogni tratto ha un **Raggio**. Digitarne uno per rendere quel tratto una curva tra gli stessi due vertici (un raggio più piccolo della metà della distanza tra i vertici non può essere raggiunto, quindi viene rifiutato), e scegliere **Destra** o **Sinistra** in **Curve**: una curva a destra ha il centro a destra della direzione di percorrenza, come in un atto. Cancellare il raggio per renderlo di nuovo rettilineo. Ogni modifica è un passo: {{key:Mod+Z}} la annulla.

## La descrizione dei confini

Le **Proprietà** di una particella terminano con la sua descrizione dei confini, scritta a partire dal disegno:

- "Partendo da" il **Punto di inizio** che si digita (per esempio "l'angolo nord-est del lotto 4"), altrimenti la coordinata nord ed est del primo vertice, oppure il punto di rilievo da cui partono i tratti.
- "quindi" ogni tratto: una direzione e una distanza, oppure una curva con il suo raggio, la lunghezza dell'arco, l'angolo al centro, e la direzione e la distanza della corda.
- "Comprendente" la sua superficie in piedi quadrati e acri (metri quadrati ed ettari in un progetto metrico).

**Copia** la mette negli Appunti; **Scarica come testo** salva un file `.txt`.

:::warning
La descrizione dei confini è una bozza ricavata dal disegno, non un rilievo. Un geometra abilitato deve verificarla con il titolo e firmarla prima che qualcuno vi faccia affidamento.
:::

Fare clic dentro una particella sulla pianta per selezionarla; {{key:Delete}} la rimuove. Le particelle sono salvate nel file di progetto.
