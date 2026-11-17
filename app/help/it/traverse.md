---
title: Inserire una poligonale e compensarla con la regola di Bowditch
summary: Digitare gli angoli di direzione o le direzioni e le distanze, verificare la chiusura angolare e lineare e la precisione, compensare con la regola di Bowditch e aggiungere le stazioni come punti di rilievo o la poligonale chiusa come particella.
keywords: poligonale, poligonale chiusa, anello, angoli a destra, battuta indietro, direzioni, distanze, chiusura, errore di chiusura, precisione, regola di Bowditch, bowditch, compensazione, rilievo
from: 56ce5a8c
---

Una poligonale è una serie di tratti misurati: in ogni stazione un angolo (o una direzione) e una distanza fino alla stazione successiva. Fare clic su **Inserisci una poligonale** sotto **Poligonale** nel pannello destro quando non è selezionato nulla.

## Dove inizia e dove finisce

1. **Inizio al punto di rilievo**: il suo numero. Oppure digitare una coordinata Nord e una Est.
2. **Tratti come**: **Angoli a destra e distanze**, oppure **Direzioni e distanze**.
3. Con gli angoli, indicare da dove partono: un **Punto di rilievo di battuta indietro**, oppure **il suo azimut** (dalla prima stazione verso la battuta indietro, in senso orario da Nord).
4. **Fine**: **di nuovo al punto di partenza (poligonale chiusa)**, oppure **su punto di rilievo** e il suo numero (poligonale aperta tra punti noti).

## Digitare i tratti

Un tratto per riga, poi la distanza, poi un nome per la stazione raggiunta, se si desidera:

- Angoli a destra, misurati in senso orario nella stazione da cui parte il tratto, dalla stazione precedente alla successiva: `270°00'10" 125.50 B`. Funzionano anche `270-00-10`, `270 00 10` e `270.0028`.
- Direzioni: `N 45°30'15" E 125.50 B`, oppure un azimut in una sola parola: `AZ 45-30-15 125.50 B`.
- In una poligonale chiusa con angoli, terminare con `close` e di nuovo l'angolo nel punto di partenza, misurato dall'ultima stazione alla seconda: `close 270°00'05"`. È questo che verifica gli angoli.

Le righe che non possono essere lette sono elencate con i rispettivi numeri di riga. Sono accettati «feet», virgole e righe di commento che iniziano con `#`.

## Leggere la chiusura

Mentre si digita, la finestra mostra:

- **Errore angolare di chiusura**: di quanto gli angoli si discostano dalla chiusura e la quota che ciascun angolo assorbe. Senza un angolo di chiusura gli angoli non vengono verificati, e un eventuale errore in essi compare nell'errore lineare di chiusura.
- **Errore lineare di chiusura**: di quanto la poligonale termina lontano dal punto in cui dovrebbe terminare, e in quale direzione.
- **Precisione**: la lunghezza della poligonale divisa per l'errore lineare di chiusura: 1 : 10,000 significa 1 ft su 10,000 ft.
- Le stazioni dopo la compensazione, e di quanto si è spostata ciascuna.

## La compensazione

Prima l'errore angolare di chiusura viene ripartito in parti uguali tra gli angoli. Poi l'errore lineare di chiusura viene ripartito sui tratti con la regola di Bowditch: ogni stazione si sposta in senso contrario all'errore in proporzione alla lunghezza percorsa per raggiungerla, così la poligonale termina esattamente nel punto previsto.

:::note
La regola di Bowditch è una compensazione standard, non ai minimi quadrati, e non pesa gli angoli rispetto alle distanze. Se la precisione sia sufficiente spetta ai propri standard e alle norme della propria giurisdizione stabilirlo.
:::

## Usare il risultato

- **Aggiungi come punti di rilievo**: le stazioni compensate diventano punti di rilievo con i nomi assegnati (altrimenti i numeri liberi successivi), descrizione `TRAV`, senza quota. L'ultima stazione di una poligonale chiusa coincide con il punto di partenza, quindi non viene aggiunta due volte. Si annulla con {{key:Mod+Z}} in un solo passaggio.
- **Aggiungi come particella** (poligonali chiuse): le stazioni compensate diventano una [particella](topic:parcels), con le sue etichette e la descrizione dei confini.
- **Rapporto (CSV)**: le righe di chiusura, poi per ogni stazione direzione, distanza, coordinate prima e dopo la compensazione, e correzioni.
