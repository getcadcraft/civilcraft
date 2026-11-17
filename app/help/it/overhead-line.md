---
title: Disegnare una linea aerea
summary: Posizionare i sostegni sulla pianta, far calcolare a CivilCraft il ruolo di ciascun sostegno e le sezioni tra i terminali, e spostare i sostegni sulla pianta o sul profilo della linea.
keywords: linea aerea, sostegno, palo, campata, sezione, terminale, angolo, sospensione, profilo, altezza, mensola, tirante, strallo, ancoraggio
from: b8e5e272
---

## Disegnarla

1. Avere una superficie: il terreno sotto la linea proviene da essa ([Costruire una superficie](topic:build-surface)). Un sostegno senza terreno sotto è elencato in **Verifiche**; digitare invece il suo **Livello del terreno** nelle Proprietà.
2. Cliccare {{ui:Linea}} nel gruppo Linee elettriche e cliccare ogni sostegno sulla pianta.
3. Fare doppio clic sull'ultimo, oppure premere {{key:Enter}}.

La linea riceve il conduttore, il sostegno e l'attrezzatura usati per ultimi su questo computer (la prima volta: esempi dalla libreria). Modificarli nelle Proprietà.

## La linea nelle Proprietà

Selezionare la linea (cliccare una campata) per impostare il suo **Conduttore**, i **Conduttori per circuito**, i **Circuiti**, la **Tensione**, la **Regola di distanza** che deve mantenere sopra il terreno, e l'attrezzatura **Su ogni sostegno** (una mensola, isolatori, accessori). La tabella elenca le sue **sezioni** con la campata di calcolo di ciascuna, la tensione d'esercizio e l'ipotesi di carico che la governa.

## Sostegni

Cliccare un sostegno per selezionarlo. Nelle Proprietà:

- **Sostegno**: il suo elemento di libreria. Quando è troppo debole, {{ui:Usa …}} inserisce il sostegno più piccolo dello stesso materiale nella propria libreria che regge il carico.
- **Ruolo**: Automatico, Sospensione, Angolo o Terminale. Automatico significa: il primo e l'ultimo sostegno sono terminali; una deviazione oltre l'angolo della regola impostata rende un sostegno d'angolo; una deviazione maggiore rende un terminale.
- **Altezza sopra il terreno**: vuoto la prende dall'elemento di libreria (la sua lunghezza meno la profondità nel terreno).
- **Anche su questo sostegno**: attrezzatura extra, come un **tirante** (strallo). Un sostegno con tiranti passa la trazione della linea al suo tirante.
- **Sostegno esistente**: viene verificato come gli altri, ma escluso dalle quantità.

{{ui:Sostegno}} aggiunge un sostegno sulla campata più vicina al clic. Trascinare un sostegno sulla pianta per spostarlo. Elimina lo rimuove (una linea mantiene almeno due sostegni).

Le sezioni vanno tra i terminali: all'interno di una sezione il conduttore scorre liberamente attraverso i morsetti di sospensione, quindi una sola tensione vale per l'intera sezione.

## Il profilo della linea

Cliccare {{ui:Profilo}} (oppure **Profilo** nelle Proprietà della linea). Il pannello sotto la pianta mostra il terreno lungo la linea, ciascun sostegno dal terreno alla sua sommità, la fase più bassa del conduttore all'**Ipotesi di carico** scelta, e la distanza che la linea deve mantenere come linea tratteggiata. Una campata che non supera la verifica è rossa; il numero sotto ciascuna campata è la sua distanza minima.

- **Linea** sceglie la linea aerea da mostrare. Selezionare un'altra linea, o uno dei suoi sostegni, sulla pianta fa passare il profilo a essa.
- Spostare il puntatore sul profilo: una linea guida lo segue, e l'etichetta riporta la distanza lungo la linea, il terreno, il conduttore e la distanza in quel punto (e indica quando la distanza è sotto la regola della linea).
- {{ui:Misura}} nella barra del profilo: cliccare due punti per ottenere la distanza in orizzontale, la differenza di altezza, la distanza in linea retta e la pendenza tra di essi. Un clic vicino al terreno, al conduttore o alla sommità di un sostegno vi si aggancia. Cliccare di nuovo {{ui:Misura}} per fermarsi.
- Gli ostacoli attraversati dalla linea sorgono dal terreno: quelli disegnati come barre, le piante del Paesaggio come la loro chioma, i muri come barre (vedere [Verifiche della linea elettrica](topic:power-line-checks#clearances)). I percorsi di cavi e le tubazioni attraversati dalla linea sono segnati sotto il terreno alla loro sommità, con il loro nome.

- Trascinare un sostegno lateralmente per spostarlo lungo la linea.
- Trascinare la sua sommità verso l'alto o verso il basso per impostarne l'altezza sopra il terreno.
