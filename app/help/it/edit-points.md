---
title: Modifica un punto di rilievo
summary: Modificare il numero, le coordinate, la quota o la descrizione di un punto, oppure trascinarlo in una nuova posizione sulla pianta.
keywords: modifica punto, sposta punto, cambia quota, rinumera, numero punto, descrizione, trascina, nord, est, fissa un punto, battuta errata
from: 375ae2e9
---

Una battuta errata, un'altezza dell'asta sbagliata, una descrizione digitata male: correggere il singolo punto, e la superficie si aggiorna di conseguenza.

## Modificare i valori di un punto

1. Con {{ui:Seleziona}}, fare clic sul punto nella pianta. **Proprietà** mostra il numero, l'est, il nord, la quota e la descrizione nei campi.
2. Digitare il nuovo valore e premere {{key:Enter}} (oppure fare clic altrove). Lasciare vuoto il campo **Quota** per un punto senza quota.
3. La superficie, le curve di livello e tutto ciò che ne deriva si aggiornano subito.

Ogni modifica è un'unica operazione: {{key:Mod+Z}} la annulla e {{key:Mod+Y}} la ripristina. Un valore che CivilCraft non può usare (un numero già assegnato a un altro punto, lettere in una coordinata) viene rifiutato: il campo viene evidenziato con un contorno e la barra di stato indica il motivo.

Un nuovo codice di descrizione crea un nuovo gruppo di punti, come accade con un'importazione (vedi [Costruisci una superficie](topic:build-surface)).

## Spostare un punto sulla pianta

1. Selezionare il punto (compare un anello).
2. Trascinare l'anello. La barra di stato mostra l'est e il nord della nuova posizione.
3. Rilasciare per spostarlo; la quota resta invariata. Premere {{key:Esc}} prima di rilasciare per riportarlo indietro.

## Le linee di discontinuità seguono il punto

Una linea di discontinuità disegnata con lo strumento {{ui:Linea di discontinuità}} copia i punti che attraversa. Quando si sposta un punto o se ne cambia la quota, i vertici della linea di discontinuità su di esso si spostano insieme, nella stessa operazione. I gruppi di linee di discontinuità creati dalle descrizioni vengono sempre ricostruiti dai punti.

:::note
Una superficie letta da un file LandXML mantiene i propri triangoli: le modifiche ai punti la cambiano solo dopo {{ui:Ricostruisci la superficie dai punti}}.
:::
