---
title: Layer della planimetria
summary: I nomi fissi dei layer, i colori e gli spessori di linea che CivilCraft usa a schermo, in DXF e in PDF, e l'impostazione di visualizzazione che controlla ciascuno.
keywords: layer, nomi dei layer, ncs, colori, aci, spessori di linea, layer dxf, pdf, impostazioni di visualizzazione, linee del disegno
from: c2aa8475
---

Ogni elemento della planimetria appartiene a un layer. I nomi seguono il consueto schema dei layer civili (disciplina, gruppo principale, gruppo secondario). I layer sono fissi in questa versione: non è possibile rinominarli, cambiarne i colori o aggiungerne di propri. In DXF, ogni layer ha il numero di colore indicato; in PDF con {{ui:Colori dei layer}} si usano gli stessi colori, e con {{ui:Nero}} tutto viene stampato in nero.

| Layer | Contiene | Colore (numero DXF) | Visibile quando |
|---|---|---|---|
| C-TOPO-MINR | Curve di livello secondarie | Grigio (8) | {{ui:Curve di livello}} |
| C-TOPO-MAJR | Curve di livello principali | Bianco o nero (7) | {{ui:Curve di livello}} |
| C-TOPO-TEXT | Etichette delle curve di livello | Bianco o nero (7) | {{ui:Curve di livello}} e {{ui:Etichette delle curve di livello}} |
| C-TOPO-TINN | Spigoli dei triangoli | Grigio (8) | {{ui:Triangoli}} |
| C-TOPO-BRKL | Linee di discontinuità e contorno | Arancione (30) | {{ui:Linee di discontinuità}} |
| C-TOPO-BNDY | Bordo della superficie | Bianco o nero (7) | {{ui:Bordo della superficie}} |
| C-TOPO-SLOP | Frecce di pendenza | Ciano (4) | {{ui:Frecce di pendenza}} |
| V-NODE | Punti di rilievo | Verde (3) | {{ui:Punti}} |
| V-NODE-TEXT | Etichette dei punti: numero, quota, descrizione | Verde (3) | {{ui:Punti}} e {{ui:Etichette dei punti}} |
| V-NODE-LINE | Linee dai codici linea (gruppi che non sono linee di discontinuità) | Verde (3) | {{ui:Punti}} |
| C-ROAD-CNTR | Assi dei tracciati | Rosso (1) | Sempre |
| C-ROAD-STAN | Segni ed etichette delle progressive, PC e PT | Rosso (1) | Sempre |
| C-ROAD-CORR | Bordi dei corridoi | Giallo (2) | Sempre |
| C-ROAD-SCTN | Linee di campionamento (dove sono tagliate le sezioni) | Grigio (8) | Quando il tracciato ha linee di campionamento |
| C-GRAD-PADS | Contorni dei piazzali | Blu (5) | Sempre |
| C-GRAD-DAYL | Linee di intersezione con il terreno | Magenta (6) | Sempre |
| C-GRAD-SLOP | Linee di scarpata della sistemazione | Magenta (6) | Sempre |
| C-GRAD-FEAT | Linee caratteristiche (3D) | Verde (3) | Sempre |
| C-ROAD-SWPT | Percorsi di sweep: contorno, tracce delle ruote più esterne, nome | Arancione (30) | Sempre |
| C-STRM-PIPE | Tubazioni | Blu (5) | {{ui:Tubazioni}} |
| C-STRM-STRC | Manufatti | Blu (5) | {{ui:Tubazioni}} |
| C-STRM-TEXT | Etichette di tubazioni e manufatti | Blu (5) | {{ui:Tubazioni}} |
| C-STRM-PROB | Tubazioni e manufatti con problemi | Rosso (1) | {{ui:Tubazioni}} |

Le linee di discontinuità vengono disegnate solo quando **Superficie** in **Visualizza** è {{ui:Terreno esistente}}; il contorno viene disegnato con entrambe le superfici.

## Spessori di linea in PDF

| Spessore | Layer |
|---|---|
| 0.50 mm | Assi dei tracciati, piazzali, tubazioni, tubazioni con problemi |
| 0.35 mm | Curve di livello principali, linee di intersezione con il terreno, manufatti |
| 0.25 mm | Linee di discontinuità |
| 0.13 mm | Curve di livello secondarie |
| 0.09 mm | Spigoli dei triangoli, linee di scarpata della sistemazione |
| 0.18 mm | Tutto il resto |

I file DXF non contengono spessori di linea; impostarli per layer nel programma CAD.

## Dimensioni delle etichette

Le etichette sono dimensionate sulla carta: etichette delle curve di livello 2.0 mm, etichette delle progressive 1.8 mm, etichette di PC e PT e di tubazioni e manufatti 1.6 mm, etichette dei punti 1.5 mm. Le etichette delle tubazioni riportano nome, diametro e pendenza; quelle dei manufatti riportano nome e chiusino. A schermo restano della stessa dimensione quando si fa zoom. In DXF sono scalate per la scala indicata nel messaggio di esportazione; vedi [Esporta la planimetria in DXF](topic:dxf-export).

## Non visualizzato su nessun layer

Le fasce altimetriche sono disegnate sotto le linee solo a schermo. La vista del profilo non fa parte della planimetria.
