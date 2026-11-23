---
title: Pavimentazioni, muri e gradini
summary: Pavimentazione con pendenze verso uno scarico o una pendenza trasversale, un disegno e la sua stratigrafia; percorsi che seguono il terreno; muri di sostegno e autoportanti con fondazioni a gradoni; cordoli; rampe e gradini verificati rispetto ai propri limiti; esportazione IFC.
keywords: superfici dure, pavimentazione, masselli, patio, terrazza, pendenze, scarico, pendenza trasversale, spina di pesce, correnti, percorso, camminamento, muro di sostegno, muro da giardino, plinto, coronamento, cordolo, bordatura, rampa, accessibilità, gradini, scale, alzate, pedate, pianerottolo
from: d34b4466
---

Le superfici dure vengono ricalcolate ogni volta dal terreno, quindi seguono il profilo del terreno e si rigenerano quando si sposta il terreno o la sua linea. Trascinare i suoi vertici in pianta come una qualsiasi linea. Si apre da {{ui:Superfici dure}} nel gruppo Paesaggio.

## Pavimentazione

Fare clic sugli angoli e premere {{key:Enter}}. Nelle Proprietà:

- **Quota**: vuoto = quota media del terreno sottostante.
- **Pendenze**: piane, una **pendenza trasversale** (una % verso una direzione) oppure **verso uno scarico**: CivilCraft chiede di fare clic dove si trova lo scarico, poi ogni angolo sale dallo scarico con la pendenza indicata. Le frecce in pianta mostrano le pendenze.
- **Disegno** (a griglia, a correnti, a spina di pesce) con la dimensione dell'elemento, la fuga e l'angolo; larghezza della **Bordatura**. Su una tavola, le fughe più strette di un millimetro vengono omesse.
- La pavimentazione fa parte della superficie di progetto. I suoi strati (masselli, allettamento, base) entrano nell'IFC e nelle quantità.

## Percorsi

Fare clic lungo il percorso e premere {{key:Enter}}. Segue il terreno, con la sua **Pendenza trasversale** verso il lato destro. Un percorso più ripido della **Pendenza massima consentita** è contrassegnato con `!` in pianta dove si trova, e le Proprietà indicano quanto diventa ripido.

Dove un percorso incontra una strada costruita da un corridoio, si ferma al bordo esterno della strada, alla quota del marciapiede o della banchina in quel punto, nella superficie di progetto e nella vista 3D. Un percorso che attraversa una strada viene sistemato e mostrato come due tratti, e una fine disegnata fino a due volte la larghezza del percorso prima della strada viene prolungata fino al suo bordo. La pianta mostra ancora il percorso come è stato disegnato, e la sua lunghezza e area contano l'intera linea. Vedi [Sweep di un corridoio stradale](topic:corridor).

## Muri

Fare clic lungo il muro e premere {{key:Enter}}. Un muro è **di sostegno** oppure **autoportante**. Senza una **Sommità**, si eleva della sua **Altezza** dal terreno per tutta la lunghezza; digitare una sommità per mantenerlo a quota costante. Il suo **plinto** si trova a una profondità fissa sotto il terreno e scende a gradoni interi, così resta a quota costante tra un gradone e l'altro. Le Proprietà indicano lunghezza, altezze, area della faccia e gradoni di fondazione; la pianta indica la sommità e la base del muro (TW / BW) a ciascuna estremità.

:::warning
Un muro di sostegno più alto di 1.2 m (4 ft) viene segnalato: lo progetta un ingegnere.
:::

## Cordoli

Fare clic lungo il cordolo e premere {{key:Enter}}; impostare la sua larghezza e l'altezza fuori terra.

## Rampe

Fare clic dal basso verso l'alto e premere {{key:Enter}}. Le quote provengono dal terreno a ciascuna estremità, a meno che non vengano digitate. Una rampa riceve un pianerottolo ogni dislivello di 750 mm (2.5 ft) ed è verificata rispetto alla **Pendenza massima consentita** (1:12 come punto di partenza) e a una larghezza minima; le Proprietà indicano quanto dovrebbe essere lunga.

## Gradini

Fare clic sul bordo anteriore del primo gradino, poi dove i gradini raggiungono la sommità, e premere {{key:Enter}}. Il numero di alzate deriva dall'altezza e dall'**Alzata massima**; la pedata dalla regola di comodità 2R + G ≈ 630 mm, mai inferiore alla **Pedata minima**; un pianerottolo ogni **Alzate per rampa al massimo**. Le Proprietà indicano se stanno tra i due punti o di quanto sono più lunghi.

:::note
I limiti per rampe e gradini sono valori predefiniti etichettati. Impostare quelli richiesti dal regolamento edilizio.
:::

## Fuori da CivilCraft

- Altro › {{ui:Esporta IFC del paesaggio}}: pavimentazioni e percorsi come `IfcPavement`, muri come `IfcWall` (i muri di sostegno come RETAININGWALL) con i loro strati, cordoli come `IfcKerb`, rampe come `IfcRamp`, gradini come `IfcStair` con le loro alzate e pedate.
- **Invia a TakeoffCraft** dell'abaco delle piante trasporta aree e volumi degli strati della pavimentazione, aree e lunghezze delle facce dei muri, lunghezze dei cordoli e numero dei gradini.
- La tavola dei dettagli disegna la sezione di ciascun muro, la stratigrafia di ogni pavimentazione e ogni rampa di gradini. Vedi [Tavole del paesaggio](topic:landscape-sheets).
