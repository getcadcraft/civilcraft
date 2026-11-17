---
title: Calcolare le ore di sole su un sito
summary: Scegliere un giorno (o una stagione) e un fuso orario, e vedere le ore di sole diretto su ogni parete di ogni massa e sul terreno intorno, con il terreno disegnato in pianta e i valori in CSV.
keywords: sole, ore di sole, ombra, ombreggiatura, accesso al sole, ore di luce diurna, facciata, parete, stagione, solstizio, equinozio, fuso orario, ora legale, latitudine, longitudine, CSV, raster
from: 4e32a314
---

**Ore di sole** conta le ore di sole diretto che raggiungono ogni parete di ogni massa edilizia e il terreno intorno, in un giorno scelto o mediato su una stagione. Le masse e il terreno stesso proiettano ombra; nient'altro lo fa (né alberi né vicini non disegnati). La luce del cielo che non è sole diretto non viene conteggiata.

## Prima di iniziare

La posizione del sole deriva da latitudine e longitudine del sito, che provengono dal **sistema di coordinate** del progetto. Un progetto senza sistema viene rifiutato con un messaggio: impostarlo prima (**Coordinate** nel gruppo GIS). Una latitudine e una longitudine digitate a mano sarebbero una stima, quindi non c'è una casella per esse.

## Calcolare

In **Proprietà**, sotto **Masse edilizie**, **Ore di sole**:

1. Scegliere il **Giorno**. Parte dal giorno in cui il sole è più basso nella propria posizione (21 dicembre, oppure 21 giugno nell'emisfero australe). Per una stagione, spuntare **Su una stagione**, scegliere l'**Ultimo giorno** e quanti giorni di distanza campionare.
2. Digitare il **Fuso orario**: un nome come `America/Mexico_City`, oppure uno scostamento da UTC come `-6`. Un nome segue le regole dell'ora legale di quel fuso per il giorno; uno scostamento digitato viene usato esattamente com'è, quindi usare quello in vigore in quel giorno. La riga sotto la casella indica quale scostamento è stato trovato.
3. Scegliere ogni quanto posizionare il sole (ogni 5, 10, 15 o 30 minuti), poi premere **Calcola le ore di sole**. Una stagione viene eseguita in processi in background; **Interrompi** la annulla.

## Cosa si ottiene

- Una tabella per massa: la **parete peggiore**, la **media** e la **parete migliore**, in ore al giorno, e una tabella di ogni parete con l'orientamento e le sue ore piano per piano.
- Il terreno intorno alle masse, disegnato in pianta dal buio (nessun sole) al giallo (il massimo che ogni cella riceve), con una legenda. Le celle sotto una massa sono lasciate vuote. **Mostra il terreno in pianta** lo disattiva.
- **Pareti come CSV** e **Terreno come CSV** salvano i valori.

Per una stagione i valori sono la media giornaliera sui giorni campionati. Nulla viene salvato nel progetto: il risultato serve alla consultazione, e rieseguire il calcolo lo rigenera.

## Utile sapere

- Una parete conta un momento come soleggiato solo quando è rivolta al sole e nulla si frappone. Una parete rivolta altrove non riceve nulla.
- Il terreno è campionato su una griglia che dipende dalla dimensione del sito, e la posizione del sole è calcolata al centro di ogni passo temporale, quindi le ore sono corrette entro il passo scelto.
- La posizione del sole è una formula astronomica pubblicata, accurata a circa un minuto d'arco.
