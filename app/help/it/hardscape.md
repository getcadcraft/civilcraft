---
title: Pavimentazioni, muri e gradini
summary: Pavimentazioni con pendenze verso un pozzetto o una pendenza trasversale, un disegno di posa e la sua stratigrafia; percorsi che seguono il terreno; muri di sostegno e isolati con plinti a gradoni; cordoli; rampe e gradini verificati rispetto ai loro limiti; esportazione IFC.
keywords: superfici dure, pavimentazione, autobloccanti, patio, terrazza, pendenze, caditoia, pendenza trasversale, a spina di pesce, a correre, percorso, vialetto, muro di sostegno, muro di giardino, plinto, cordolo di coronamento, cordolo, bordatura, rampa, accessibilità, gradini, scale, alzate, pedate, pianerottolo
from: 51475877
---

Le superfici dure vengono ricalcolate ogni volta a partire dal terreno, quindi seguono il terreno e si rigenerano quando il terreno o la sua linea si spostano. Trascinare i loro vertici sulla pianta come una qualsiasi linea. Aprirle da {{ui:Hardscape}} nel gruppo Paesaggio.

## Pavimentazioni

Fare clic sui vertici e premere {{key:Enter}}. In Proprietà:

- **Quota**: vuoto = la quota media del terreno sotto di essa.
- **Pendenze**: quota, una **pendenza trasversale** (una % in una direzione) oppure **verso un pozzetto**: CivilCraft chiede di fare clic dove si trova il pozzetto, poi ogni vertice sale dal pozzetto con la pendenza indicata. Le frecce sulla pianta mostrano le pendenze.
- **Disegno di posa** (a griglia, a correre, a spina di pesce) con la dimensione dell'elemento, il giunto e l'angolo; **Bordatura** di larghezza. Su una tavola, i giunti più stretti di un millimetro vengono esclusi.
- La pavimentazione fa parte della superficie di progetto. I suoi strati (autobloccanti, letto di posa, fondazione) entrano nell'IFC e nelle quantità.

## Percorsi

Fare clic lungo il percorso e premere {{key:Enter}}. Segue il terreno, con la sua **Pendenza trasversale** verso il lato destro. Un percorso più ripido di **Pendenza massima consentita** viene contrassegnato con `!` sulla pianta nel punto in cui si trova, e Proprietà indica quanto è ripido.

## Muri

Fare clic lungo il muro e premere {{key:Enter}}. Un muro è **di sostegno** oppure **isolato**. Senza una **Sommità**, si eleva per la sua **Altezza** sopra il terreno per tutta la sua lunghezza; inserire una sommità per mantenerlo a livello. Il suo **plinto** si trova a una profondità fissa sotto il terreno e scende a gradoni interi, quindi resta a livello tra un gradone e l'altro. Proprietà indica la sua lunghezza, le altezze, l'area della faccia e i gradoni del plinto; sulla pianta le etichette indicano la sommità e la base del muro (TW / BW) a ciascuna estremità.

:::warning
Un muro di sostegno più alto di 1,2 m (4 ft) viene segnalato: va progettato da un ingegnere.
:::

## Cordoli

Fare clic lungo il cordolo e premere {{key:Enter}}; impostare la larghezza e l'altezza fuori terra.

## Rampe

Fare clic dal basso verso l'alto e premere {{key:Enter}}. Le quote derivano dal terreno a ciascuna estremità, salvo che vengano inserite. Una rampa riceve un pianerottolo ogni dislivello di 750 mm (2,5 ft) e viene verificata rispetto a **Pendenza massima consentita** (1:12 come valore iniziale) e a una larghezza minima; Proprietà indica quanto dovrebbe essere lunga.

## Gradini

Fare clic sul bordo anteriore del primo gradino, poi dove i gradini arrivano in cima, e premere {{key:Enter}}. Il numero di alzate deriva dall'altezza e da **Alzata massima**; la pedata dalla regola di comfort 2A + P ≈ 630 mm, mai sotto la **Pedata minima**; un pianerottolo ogni **Alzate massime per rampa**. Proprietà indica se stanno tra i due punti o di quanto devono essere più lunghi.

:::note
I limiti per rampe e gradini sono valori predefiniti indicati come tali. Impostare quelli richiesti dal regolamento edilizio.
:::

## Fuori da CivilCraft

- Altro › {{ui:Export landscape IFC}}: pavimentazioni e percorsi come `IfcPavement`, muri come `IfcWall` (i muri di sostegno come RETAININGWALL) con i loro strati, cordoli come `IfcKerb`, rampe come `IfcRamp`, gradini come `IfcStair` con le loro alzate e pedate.
- **Invia a TakeoffCraft** dell'abaco delle piante trasporta le aree delle pavimentazioni e i volumi degli strati, le aree delle facce dei muri e le lunghezze, le lunghezze dei cordoli e il numero dei gradini.
- La tavola dei dettagli disegna la sezione di ciascun muro, la stratigrafia di ciascuna pavimentazione e ogni rampa di gradini. Vedere [Tavole del paesaggio](topic:landscape-sheets).
