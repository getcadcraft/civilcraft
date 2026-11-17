---
title: Disposizione del parcheggio
summary: Disporre stalli, corsie, posti per disabili e per furgoni e isole all'interno di un contorno, dare pendenza al parcheggio verso le caditoie rispetto al terreno esistente, poi pavimentarlo e piantumarlo. Disponibile anche per un assistente.
keywords: parcheggio, stallo, corsia, disabili, ada, furgone, isola, caditoia, pendenza, sterro, riporto, pavimentazione, masselli, piantumazione, alberi, terreno, nuvola di punti, mcp, assistente
from: 06c14da9
---

Inserire un parcheggio in una particella, un piazzale o una linea caratteristica chiusa, e ottenere in un unico passo i conteggi, il livellamento e la pavimentazione.

## Disporre il parcheggio

1. Selezionare una particella, un piazzale o una linea caratteristica chiusa sulla pianta.
2. Aprire **Superficie, Altro, Parcheggio...**
3. Scegliere le regole, l'angolo degli stalli (90, 75, 60, 45, 30 gradi oppure paralleli) e corsie a senso unico o a doppio senso. Le dimensioni di stalli, corsie e isole partono dalla tabella e ciascuna può essere digitata sopra.
4. Scegliere **Disponi**.

Le file corrono lungo il lato del contorno che dà il maggior numero di stalli (oppure all'angolo digitato). Uno stallo conta solo se si trova interamente dentro il contorno. Dove c'è spazio per una fila e una corsia, si aggiunge una fascia a fila singola. La finestra elenca gli spazi, gli spazi per disabili e per furgoni, le isole, le caditoie e la superficie per spazio, e la pianta mostra stalli, spazi per disabili con le loro corsie di accesso tratteggiate, isole, linee di mezzeria delle corsie e caditoie sui propri layer (C-PARK-...), così passano in PDF, DXF e DWG.

## Posti per disabili

Con le regole degli Stati Uniti il numero segue la tabella 208.2 degli ADA Standards 2010 per i posti previsti (uno ogni sei, arrotondato per eccesso, è un posto per furgone), collocati vicino al primo angolo del contorno (l'ingresso), ciascuno con una corsia di accesso; due ne condividono una. Uno stallo più stretto della larghezza per disabili, o una pendenza più ripida di 1:48 sui posti per disabili, compare come problema. **Questi numeri sono stati digitati dallo standard come ricordato e non sono stati verificati con lo standard stampato.** Anche le dimensioni tipiche di stalli e corsie provengono dalle guide di progettazione dei parcheggi e non sono verificate. Verificare entrambe, e il codice locale, prima di farvi affidamento. Scegliere **Personalizzato** per inserire il proprio numero di posti per disabili.

## Pendenze verso le caditoie, sterro e riporto

Salvo che lo si disattivi, il parcheggio diventa un'area di movimento terra nell'area di lavoro Paesaggio. Le caditoie sono messe sulle linee di mezzeria delle corsie circa ogni 100 feet (30 m); la superficie sale da ciascuna caditoia con la pendenza indicata (1.5 per cento all'inizio), così ogni punto scende verso la caditoia più vicina. Il livello è scelto in modo che sterro e riporto del parcheggio si bilancino sul terreno esistente. Il terreno esistente è la superficie esistente del progetto, che può derivare da punti di rilievo, da LandXML, da una nuvola di punti lidar o da scansione trasformata in superficie, oppure da curve di livello. La finestra mostra la stima di sterro e riporto; i volumi del progetto mostrano poi la cifra esatta. L'area di movimento terra mantiene il suo bordo sul terreno esistente, quindi dove la nuova superficie differisce dal terreno al bordo si ottiene un gradino, e la finestra dice di quanto.

## Pavimentazione e piantumazione

L'intero contorno riceve una pavimentazione in masselli (un motivo a correnti che si può cambiare in Paesaggio, Hardscape) e ogni isola riceve un'aiuola di arbusti e, dove è abbastanza larga, un albero, scelti dall'elenco delle piante. Dopo, tutto è un normale oggetto Paesaggio: modificarlo, oppure scegliere **Disponi di nuovo** per sostituire ciò che il parcheggio ha creato. Rimuovere il parcheggio rimuove ciò che ha creato.

## Dall'assistente

Lo stesso parcheggio può essere richiesto tramite MCP: `parking_layout` mostra l'anteprima, `parking_build` scrive e `parking_remove` rimuove un parcheggio. Richiederlo per nome della particella oppure inviare il contorno.

## Cosa non è ancora implementato

Non si verifica se le corsie raggiungono una strada. La pavimentazione copre l'intero contorno, quindi la sua superficie comprende le isole. I materiali di pavimentazione dalla Libreria e un tipo di Libreria per gli stalli non sono ancora implementati; il motivo di pavimentazione è quello di Hardscape. Le regole di altri paesi non sono ancora implementate.
