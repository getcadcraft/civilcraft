---
title: Disegnare volumi edilizi su un sito
summary: Disegna un volume edilizio su una particella, assegnagli piani e altezza di piano, vedi la sua superficie lorda di pavimento, scegli come si posa su un terreno in pendenza, spingi e tira la sua altezza in 3D, e invialo a BimCraft o salvalo come file IFC.
keywords: volume, massing, volume edilizio, ingombro, piani, altezza di piano, superficie lorda di pavimento, SLP, pendenza, basamento, sterro e riporto, spingi tira, 3D, studio del sito, progettazione preliminare, IFC, sviluppa, BimCraft, A-MASS
from: e5a67c16
---

Un volume edilizio è un ingombro, un numero di piani e un'altezza di piano: la domanda iniziale "quanto edificio entra qui, e che cosa fa al terreno". I volumi stanno sulla pianta con il loro nome, il numero di piani e la superficie lorda di pavimento, confluiscono nella stampa PDF e nelle esportazioni DWG e DXF sui layer `A-MASS` e `A-MASS-TEXT`, e sono salvati nel file di progetto.

## Disegnare un volume

1. In **Proprietà**, sotto **Volumi edilizi**, fare clic su **Disegna un volume**. (È anche nel menu **Altro** della barra degli strumenti, accanto a **Superficie**.)
2. Fare clic sugli angoli dell'ingombro. Un clic vicino a un angolo di particella o a un punto di rilievo prende la posizione esatta di quel punto.
3. Fare clic di nuovo sul primo angolo, oppure premere {{key:Enter}}, per terminare. {{key:Backspace}} elimina l'ultimo angolo; {{key:Esc}} si ferma.

Un nuovo volume ha tre piani e un'altezza di piano di 12 ft (3.6 m), e appartiene alla particella in cui cade il suo centro.

## Piani, altezza e superficie

Fare clic su un volume per cambiarne **Nome**, **Uso**, **Piani**, **Altezza di piano** e **Particella**. **Altezza** è i piani per l'altezza di piano: digitare un'altezza e il numero di piani diventa il numero intero più vicino (mai meno di uno). **Ingombro** e **Superficie lorda di pavimento** (ingombro per piani) sono calcolati automaticamente.

## Su terreno in pendenza

Il terreno sotto un volume è letto dalla superficie: terreno esistente, oppure il terreno sistemato dove si è scelto **Terreno di progetto (sistemato)**. **Su terreno in pendenza** indica dove va il piano terra:

- **A gradoni**: alla media del terreno sotto l'ingombro. Il lato basso viene riempito fino a quel livello e il lato alto viene scavato, e i due si avvicinano a un equilibrio.
- **Basamento**: al terreno più alto. Una base piena riempie il lato basso.
- **Sterro**: al terreno più basso. Il lato alto viene scavato nella collina.

Le Proprietà mostrano l'intervallo di terreno sotto il volume, il **Livello del piano terra** e il volume di riporto e di sterro tra il terreno e quel livello. Un punto dell'ingombro che è fuori dalla superficie viene escluso, e le Proprietà indicano quanti sono.

## Nella vista 3D

I volumi sono disegnati nella vista 3D del sito, con una linea intorno a ogni piano e i loro nomi sopra il tetto. **Mostra** ha una casella per **Volumi edilizi**. Fare clic su uno per selezionarlo. Con un volume selezionato:

- trascinare il suo tetto su o giù per spingere o tirare un piano alla volta, oppure premere {{key:PageUp}} e {{key:PageDown}};
- l'intero spostamento è un solo passo di annullamento.

La vista di strada di **Percorri** vede anche i volumi, e **Sole** ne proietta le ombre sul terreno.

## Inviarlo oltre

- **Volumi come IFC** salva ogni volume come file IFC4: un sito, un edificio con i suoi piani, e il volume come elemento edilizio con i suoi numeri nel set di proprietà `CadCraft_SiteMass`. Con un sistema di coordinate impostato sul progetto, il file è posizionato sulla mappa e riporta latitudine e longitudine del sito; senza, non dice nulla sulla sua posizione.
- **Sviluppa in BimCraft** apre BimCraft in una nuova scheda con i volumi. Lì, selezionando un volume se ne mostrano i numeri e **Sviluppa questo volume**, che costruisce le pareti su ogni livello e un solaio sotto l'edificio a partire dall'ingombro, in un solo passo di annullamento. Nulla viene caricato: il file passa tra le due schede di questo browser.

Vedi anche **Limiti di zonizzazione** e **Ore di sole**.
