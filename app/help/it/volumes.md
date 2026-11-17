---
title: Volumi di movimento terra
summary: Leggere sterro, riporto e volumi netti tra il terreno esistente e la superficie di progetto, per piazzola e corridoio e in totale, e capire il metodo a griglia che sta alla base.
keywords: volumi, movimento terra, sterro, riporto, netto, sterro e riporto, quantità, metodo a griglia, confronto di superfici, superficie dei volumi, yard cubi, metri cubi
from: 299d7bc7
---

Appena una piazzola o un corridoio viene sistemato senza problemi, CivilCraft confronta la superficie di progetto con il terreno esistente e riporta sterro e riporto. I numeri si aggiornano a ogni modifica.

## Dove leggerli

- **Movimenti di terra** nel pannello destro senza nulla selezionato (la vista **Progetto**), quando c'è almeno una piazzola o un corridoio.
- **Movimenti di terra** nel pannello destro quando una piazzola è selezionata (gli stessi totali per l'intero progetto).
- La riga sotto le impostazioni di un corridoio, con sterro e riporto propri di quel corridoio.

Il blocco **Movimenti di terra** mostra:

- **Sterro**, **Riporto** e **Netto** (con "riporto" o "sterro" dopo, a seconda di quale sia maggiore)
- una riga per ogni voce quando ce n'è più di una, ad esempio "Piazzola 1: sterro 120.4 cu yd, riporto 310.2 cu yd"
- la riga del metodo: "Metodo a griglia: terreno esistente e superficie sistemata campionati ogni 0.5 ft all'interno delle linee di intersezione con il terreno (92,891 celle). Nessun coefficiente di rigonfiamento o di ritiro applicato."

I volumi sono in yard cubi in un progetto in piedi e in metri cubi in un progetto in metri.

## Inviarli a TakeoffCraft

Per valutare il movimento terra, scegliere {{ui:Invia a TakeoffCraft}} in fondo al blocco **Movimenti di terra**. CivilCraft salva un file di quantità (`<sito>.quantities.json`) con due quantità: sterro e riporto, in yard cubi (progetto in piedi) oppure in metri cubi (progetto in metri), gli stessi numeri del blocco, arrotondati al centesimo. Aprirlo in TakeoffCraft con {{ui:Apri computo}}, oppure trascinarlo lì: diventano due voci che si possono valutare ([Sterro e riporto da CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Inviare di nuovo dopo una modifica e aprire il nuovo file: le stesse voci assumono i nuovi valori.

Vengono inviati solo i totali, quindi niente viene contato due volte; la nota del file elenca lo sterro e il riporto di ogni piazzola e corridoio.

## Come vengono calcolati

CivilCraft usa il **metodo a griglia**:

1. Sull'area all'interno di ogni linea di intersezione con il terreno viene disposta una griglia di celle quadrate.
2. Al centro di ogni cella vengono campionate entrambe le superfici.
3. Ogni cella conta come un prisma: la differenza di quota per l'area della cella. Dove la superficie di progetto è più bassa, c'è sterro; dove è più alta, c'è riporto.
4. Le celle vengono sommate.

La dimensione della cella viene scelta automaticamente in modo che il rettangolo attorno alle aree sistemate contenga circa 250,000 celle, arrotondata a un valore pulito (1, 2 o 5 volte una potenza di dieci). Non è ancora possibile impostarla direttamente. La riga del metodo indica la dimensione e il numero di celle. Celle più piccole sono più accurate lungo i bordi; su celle intere tra piani orizzontali il risultato è esatto.

## Cose da sapere

- Viene contata solo l'area all'interno delle linee di intersezione con il terreno. Il terreno fuori da esse non cambia.
- Una piazzola o un corridoio con un problema non viene sistemato e non aggiunge nulla. Se il blocco dice "Nessun volume ancora: una piazzola deve essere sistemata senza problemi.", cercare un riquadro rosso sopra di esso.
- Dove le voci si sovrappongono, quella successiva ha sostituito la precedente all'interno della sua linea di intersezione, e la sovrapposizione viene contata una volta.
- Non viene applicato alcun coefficiente di rigonfiamento o di ritiro. Moltiplicare i risultati a mano se servono volumi in banco, sciolti o costipati.
- Lo scotico del terreno vegetale, gli spessori di pavimentazione e di sottofondo, e i volumi a prisma TIN-TIN non sono ancora disponibili.

## Verificare un risultato

- Attivare {{ui:Di progetto (sistemato)}} in **Visualizzazione** e osservare le curve di livello all'interno delle linee di intersezione con il terreno.
- Spostare il puntatore sull'area sistemata: la barra di stato mostra **Terreno** e **Sistemato**. La differenza è la profondità di sterro o di riporto in quel punto.
- Per un corridoio, la lettura nella vista del profilo mostra sterro o riporto sull'asse a ogni progressiva.
