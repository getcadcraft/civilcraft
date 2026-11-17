---
title: Sistemazione di un piazzale per edificio
summary: Disegnare un piazzale piano, impostarne la quota e le scarpate di scavo e di riporto, e far sì che CivilCraft lo raccordi al terreno esistente e lo aggiunga alla superficie di progetto.
keywords: muro di sostegno, muri di sostegno, lato verticale, muro invece di scarpata, scarpata per lato, rilevato, sistemazione, piazzale, piazzale per edificio, intersezione con il terreno, linea caratteristica, gruppo sistemazione, scarpata di scavo, scarpata di riporto, quota finita, superficie di progetto, sistemazione del sito
from: 482319a6
---

Un piazzale è un'area piana a una quota. Dal suo bordo, CivilCraft sistema verso l'esterno con la scarpata di scavo dove il terreno è più alto del piazzale e con la scarpata di riporto dove è più basso, fino a quando la scarpata incontra il terreno esistente. Quella linea d'incontro è la linea di intersezione con il terreno. Il piazzale e le sue scarpate sostituiscono il terreno esistente all'interno della linea di intersezione per creare la superficie di progetto.

## Disegnare il piazzale

Serve prima una superficie di terreno esistente.

1. Premere {{key:G}}, oppure fare clic su {{ui:Piazzale}} nel gruppo **Progetto**.
   Il suggerimento dice "Piazzale: fare clic sugli angoli. Invio o doppio clic termina, Backspace elimina l'ultimo, Esc annulla."
2. Fare clic sugli angoli del piazzale in ordine, in un senso o nell'altro. Un contorno blu segue il puntatore.
3. Premere {{key:Enter}} dopo l'ultimo angolo (almeno tre).
   Il piazzale viene disegnato e selezionato. Parte dalla quota del terreno nel suo centro, arrotondata a 0.1, con una scarpata di scavo 2 : 1 e una di riporto 3 : 1. La barra di stato dice, per esempio, "Piazzale 1 alla quota 254.3 (il terreno al suo centro), scavo 2:1, riporto 3:1. Modificare i valori in Proprietà."

:::warning
Terminare con {{key:Enter}}. Il doppio clic termina anche, ma in questa versione elimina l'angolo su cui si è fatto doppio clic. Fare clic una volta sull'ultimo angolo, poi premere {{key:Enter}}.
:::

Il contorno del piazzale non deve intersecarsi con sé stesso ("Il contorno del piazzale si interseca con sé stesso.").

## Impostare quota e scarpate

Con il piazzale selezionato, il pannello a destra mostra **Piazzale**:

1. **Nome**.
2. **Quota**: la quota piana del piazzale.
3. **Scarpata di scavo** e **Scarpata di riporto**, come H:V (2 significa 2 : 1). Entrambe devono essere maggiori di 0.
4. **Area del piazzale** e **Angoli** sono mostrati come riferimento.

Premere {{key:Enter}} dopo ogni valore. La linea di intersezione con il terreno, la superficie di progetto e i volumi si aggiornano subito.

Sotto i campi compare una riga, per esempio "Linea di intersezione: 48 linee di scarpata (20 in scavo, 28 in riporto), la più lontana a 31.20 ft." La pianta mostra la linea di intersezione e le linee di scarpata in magenta.

## Come viene trovata l'intersezione

- Le linee di scarpata partono da ogni bordo perpendicolarmente, circa ogni ventesimo della dimensione del piazzale.
- Agli angoli esterni si aprono a ventaglio ogni 10°, così la scarpata gira intorno all'angolo.
- Agli angoli interni una linea corre lungo la bisettrice, dove si incontrano le scarpate dei due bordi.
- Ogni linea sale con la scarpata di scavo o scende con quella di riporto finché non raggiunge il terreno.

## Scarpate per lato e muri di sostegno

Sotto **Lati e muri di sostegno** nelle Proprietà di un piazzale, di una piattaforma o di un rilevato, ogni lato può essere sistemato in modo proprio. Il lato 1 va dal primo angolo su cui si è fatto clic al secondo, il lato 2 dal secondo al terzo, e così via.

- **Tutti i lati**: **Inclinato** usa le scarpate di scavo e di riporto sopra su ogni lato; **Verticale: muri di sostegno** mette un muro su ogni lato.
- Per lato: **Scarpate sopra**, **Scarpate proprie** (digitare una scarpata di scavo e una di riporto per quel lato) oppure **Verticale (muro di sostegno)**.
- Digitare una scarpata come `3` o `3:1` (orizzontale su 1 verticale), `33%` o `18.4°`; viene mostrata come H:1. La **Scarpata di scavo** e la **Scarpata di riporto** del piazzale accettano lo stesso formato.
- Un lato verticale non ha rilevato: un muro di sostegno corre lungo il bordo, dal piazzale in giù fino al terreno esistente (in riporto) oppure dal terreno in giù fino al piazzale (in scavo). **Spessore del muro** (0.3 m o 1 ft all'inizio) è quanto il terreno si sposta dal bordo del piazzale al terreno esistente. I volumi di scavo e di riporto escludono il rilevato che quel lato non ha più.
- Dove un muro incontra un lato inclinato, la scarpata gira intorno all'estremità del muro; due muri si incontrano con un giunto a 45°.
- Sotto i campi: la lunghezza dei muri, la faccia esposta (altezza × lunghezza), l'altezza massima e media.

La pianta disegna la faccia esterna di ogni muro con brevi tacche trasversali e la sua altezza alle due estremità e nel punto più alto (sul layer dei muri di sostegno, che va anche in DXF e DWG). La vista 3D mostra i muri come solidi (Mostra › Muri di sostegno), e le esportazioni GLB, OBJ e USD li includono. Le sezioni attraverso il bordo mostrano il gradino.

**Avvisi** (in Proprietà e nel pannello Problemi): un muro più alto di **Avvisa sopra un'altezza di muro di** (1.0 m o 3.3 ft all'inizio) "può richiedere un muro progettato da un tecnico o un permesso; verificare le norme locali", e, quando si digita la **Pendenza massima che il terreno sostiene**, qualsiasi lato la cui scarpata di scavo o di riporto è più ripida di quella. Sono avvisi: la sistemazione viene comunque costruita. Ogni modifica è un passo per {{key:Mod+Z}}.

## Spostare gli angoli

Selezionare il piazzale, poi trascinare una maniglia quadrata su un angolo. Ogni trascinamento è un passo di annullamento. Aggiungere o rimuovere un angolo non è ancora implementato: eliminare il piazzale e disegnarlo di nuovo.

## Quando non sistema

Una casella rossa sotto **Movimenti di terra** indica il piazzale e il problema:

| Messaggio | Cosa fare |
|---|---|
| "3 linee di scarpata escono dalla superficie prima di incontrarla: il piazzale è troppo vicino al bordo della superficie oppure troppo alto/basso." | Spostare il piazzale verso l'interno dal bordo della superficie, oppure avvicinare la sua quota al terreno. |
| "La linea di intersezione si interseca con sé stessa (le scarpate di lati diversi del piazzale si incrociano). Rimodellare il piazzale o cambiare le scarpate." | Tipico di piazzali stretti o a L in scavo profondo o riporto alto. Allargare il piazzale, ridurre la differenza o rendere più ripide le scarpate. |
| "Il contorno del piazzale si interseca con sé stesso." | Ridisegnare gli angoli in ordine attorno al piazzale. |

Un piazzale con un problema viene escluso dalla superficie di progetto e dai volumi finché non viene corretto.

## Vedere il risultato

1. In **Visualizzazione** impostare **Superficie** su {{ui:Di progetto (sistemato)}}.
   Le curve di livello ora attraversano piatte il piazzale e seguono le scarpate fino alla linea di intersezione.
2. Muovere il puntatore sopra il piazzale: la barra di stato mostra le quote **Terreno** e **Sistemato**.
3. Leggere scavo e riporto sotto **Movimenti di terra**; vedere [Volumi di movimento terra](topic:volumes).

I piazzali vengono sistemati dopo i corridoi, nell'ordine in cui sono stati disegnati. Un piazzale successivo sostituisce tutto ciò che è più vicino dentro la propria linea di intersezione.

## Eliminare un piazzale

Selezionarlo e premere {{key:Delete}} (su Mac, Fn e Delete), oppure fare clic su {{ui:Elimina}}.

## Non ancora implementato

I piazzali sono piani: piazzali inclinati, linee caratteristiche con pendenza variabile, banchine e sistemazione verso una distanza o una quota obiettivo non sono ancora disponibili. Vedere [Non ancora implementato](topic:not-built-yet).
