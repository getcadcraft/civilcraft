---
title: Piattaforme per abitazioni su terreni in pendenza
summary: Sistemare un piazzale su un versante: muri di sostegno come bordi del piazzale, la mappa di sterro e riporto ombreggiata per profondità con quote puntuali (pianta e 3D), una sezione tracciata ovunque attraverso il terreno e il progetto, e rampe o piazzali inclinati per gli accessi carrabili.
keywords: piattaforma, piazzale, piazzale della casa, terreno in pendenza, versante, muro di sostegno, sterro e riporto, mappa di sterro e riporto, quote puntuali, sezione libera, linea di sezione, elaborati per il comune, accesso carrabile, rampa, piazzale inclinato, sistemazione, fattore di rigonfiamento, movimenti di terra
from: daa08a3f
---

Una piattaforma per abitazione è un **piazzale** (**Progetto** › {{ui:Pad}}): un poligono piatto a una quota, sistemato nel terreno. Quattro strumenti aiutano su un pendio.

## Muri di sostegno come bordi del piazzale

Selezionare il piazzale e impostare un lato su {{ui:Vertical (retaining wall)}} invece di una scarpata (**Proprietà** › {{ui:Sides and retaining walls}}, oppure {{ui:Vertical: retaining walls}} per tutti i lati in una volta). L'altezza del muro è letta dal terreno lungo di esso: sommità al terreno, base al piazzale, indicata a entrambe le estremità e nel punto più alto sulla pianta, con un avviso quando supera il limite impostato. Muri e scarpate possono essere combinati fianco a fianco.

## La mappa di sterro e riporto

Spuntare {{ui:Cut and fill map}} sotto **Mostra**. La pianta è ombreggiata in base alla profondità di sterro o riporto, a intervalli uguali (sterro caldo, riporto blu, quasi piano chiaro) con una legenda, e le **quote puntuali** sono stampate sul piazzale: la variazione di quota nei punti di una griglia, e lo sterro più profondo e il riporto più alto contrassegnati con ▲. Le celle sono le stesse usate per i volumi di movimento terra, quindi la mappa e i numeri concordano sempre.

Nella vista 3D, scegliere **Sterro e riporto** dall'elenco dei colori per sovrapporre gli stessi colori al terreno e al progetto.

Un fattore di rigonfiamento o di ritiro si trova nello strumento del diagramma delle masse (**Progetto** › {{ui:Mass haul}}); non viene applicato ai volumi di un piazzale.

## Una sezione libera

Sotto **Superficie** › {{ui:More}}, scegliere {{ui:Free section}}, fare clic sui punti della linea di sezione ovunque (può piegare) e premere {{key:Enter}}. Una finestra di dialogo disegna la sezione: il terreno esistente, il progetto sistemato (tratteggiato) e lo sterro e riporto tra di essi, ombreggiati, con le relative aree (il progetto conta solo dentro i piazzali e le strade). {{ui:Vertical exaggeration}} è impostata per default per adattare il disegno; {{ui:Save as SVG}} e {{ui:Save as CSV}} forniscono un disegno per il comune e i numeri.

## Rampe e piazzali inclinati

Sotto **Superficie** › {{ui:More}}, scegliere {{ui:Ramp or sloped pad}}, fare clic sull'estremità bassa e poi su quella alta, premere {{key:Enter}}, e indicare la larghezza, la quota all'estremità bassa e la pendenza. Il piazzale è una striscia i cui vertici portano quelle quote (il bordo tra due vertici corre a pendenza costante), e si raccorda al terreno come qualsiasi piazzale. Anche i vertici di qualsiasi piazzale possono avere una propria quota, quindi un accesso carrabile, una rampa o una terrazza inclinata è un piazzale con una quota su ciascun vertice.
