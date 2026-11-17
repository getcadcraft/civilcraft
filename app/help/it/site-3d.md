---
title: Visualizzare il sito in 3D
summary: Aprire la vista 3D, orbitare, fare Pan e zoom, impostare l'esagerazione verticale e i colori, scegliere cosa mostrare, e fare clic su tracciati, piazzali, linee caratteristiche, linee di discontinuità, tubazioni, manufatti e punti per selezionarli.
keywords: etichette, etichette 3D, etichette rivolte alla camera, etichette delle progressive, etichette delle curve di livello, etichette dei punti, sovrapposizione, aerea, layer cartografici sulla superficie, 3D, tre D, vista 3D, cubo di navigazione, bussola, orbita, prospettiva, parallela, isometrica, iso, esagerazione verticale, terreno, modello, modello del sito, volo intorno, visualizzare, render, tubazioni in 3D, manufatti, pozzetti, corridoio in 3D, strada in 3D, superficie stradale, corsie, cordoli, marciapiedi, piante in 3D, alberi in 3D, arbusti, siepi, paesaggio 3D, rampe in 3D, gradini, muri, pavimentazione, opere in 3D
from: a16bafe1
---

La vista 3D mostra il sito come un unico modello: il terreno esistente e la superficie sistemata, le curve di livello sovrapposte, le linee di discontinuità e il bordo della superficie, ogni tracciato sul suo profilo di progetto con i segni delle progressive, le linee caratteristiche del corridoio e la strada stessa (corsie, banchine, cunette, cordoli, fasce e marciapiedi, ciascuno nel proprio colore), i piazzali con le loro linee di intersezione con il terreno, la rete delle tubazioni con tubazioni e manufatti alle loro quote reali, e dall'area di lavoro Paesaggio le piante, le pavimentazioni, i percorsi, i muri, i cordoli, le rampe e i gradini. Legge lo stesso progetto della pianta, quindi ogni modifica appare in entrambe.

## Aprire la vista 3D

1. Aprire i punti di rilievo (o un file LandXML o di progetto) così che ci sia una superficie. Anche solo piante, pavimentazioni o rampe bastano per aprirla.
2. Premere {{key:D}}, oppure fare clic su {{ui:3D}} nel gruppo {{ui:Vista}} della barra degli strumenti.
   La vista 3D si apre sopra la pianta, guardando l'intero sito da sud-est. La prima volta impiega un momento a caricarsi.
3. Premere di nuovo {{key:D}}, oppure fare di nuovo clic su {{ui:3D}}, per tornare alla pianta. Scegliere uno strumento di disegno come {{ui:Tracciato}} o {{ui:Piazzale}} riporta anch'esso alla pianta, poiché il disegno avviene lì.

## Muoversi

| Per | Fare questo |
|---|---|
| Orbitare | Trascinare con il pulsante sinistro o quello centrale |
| Pan | Trascinare con il pulsante destro, oppure tenere premuto {{key:Shift}} e trascinare |
| Zoom | Ruotare la rotella; fa zoom verso il puntatore |
| Orbitare su trackpad | Scorrere con due dita ({{key:Shift}} e scorrere fa Pan) |
| Zoom su trackpad | Pizzicare |
| Tocco | Un dito orbita; due dita pizzicano per zoom e si spostano per Pan |
| Tasti (la vista ha il fuoco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitano, con {{key:Shift}} fanno Pan; {{key:Plus}} e {{key:Minus}} fanno zoom |

La barra sopra la vista contiene il resto:

- L'elenco delle viste: **Iso**, **Superiore**, **Inferiore**, **Anteriore** (guardando a nord), **Posteriore**, **Sinistra**, **Destra**.
- {{ui:Prospettiva}}: premuto è una vista in prospettiva; farci clic per una proiezione parallela (senza scorci).
- {{ui:Estensione}}: mostra di nuovo tutto. {{key:F}} fa lo stesso mentre la vista 3D è aperta.

## Il cubo di navigazione

Il cubo di navigazione nell'angolo in alto a destra ruota con la vista. Fare clic su un lato, uno spigolo o un vertice per guardare il sito da lì (la camera ruota dolcemente, a meno che il sistema non chieda movimento ridotto). Trascinare il cubo per orbitare. L'anello della bussola sotto mostra il nord (nord della griglia, +Y): trascinare l'anello per ruotare il sito attorno alla verticale, oppure fare clic su N, E, S o O per guardare da quel lato. {{ui:Home}}, la piccola casa in alto a sinistra, riporta alla vista iso dell'intero sito. Con la tastiera: {{key:Tab}} fino al cubo, le frecce scelgono un lato, uno spigolo o un vertice, {{key:Enter}} guarda da lì.

Sul piano lo stesso cubo mostra la vista dall'alto. Fare clic su un altro lato, spigolo o vertice (o trascinarlo) per aprire la vista 3D guardando da lì: è il modo più rapido di passare al 3D da una data direzione. Per sostituire il cubo con una piccola icona degli assi, o nasconderlo, vedere **Indicatore d'angolo** in [Impostazioni di CivilCraft](topic:settings).

## Esagerare le quote

I siti sono di solito molto più larghi che alti, quindi le quote sono allungate di **2×** per iniziare. Scegliere **1×**, **2×**, **3×**, **5×** o **10×** nell'elenco della barra, oppure sotto **Esagerazione verticale 3D** in [Impostazioni di CivilCraft](topic:settings) (sono una sola impostazione). Cambia solo la vista: volumi, profili ed esportazioni restano in scala vera.

## Colorare le superfici

- **Fasce di quota**: le stesse fasce e gli stessi colori delle fasce di quota della pianta (il numero di fasce si imposta sotto **Visualizzazione** nel pannello sinistro). Ogni bordo di fascia è tagliato esattamente alla sua quota.
- **Un colore**: il terreno esistente e la superficie sistemata, ciascuno in un colore uniforme.
- **Layer cartografici**: i layer mostrati sotto la pianta (un'immagine georeferenziata, tessere cartografiche o un servizio cartografico; vedere [Layer cartografici](topic:map-layers)) stesi sulle superfici come un foglio, così una foto aerea appare sulle colline. Le immagini ancora in arrivo si riempiono man mano. Senza alcun layer cartografico visibile, le superfici mantengono le loro fasce di quota e la vista lo indica. L'immagine serve allo schermo: le esportazioni GLB e OBJ non la includono.

Quando sono mostrate entrambe le superfici, il terreno esistente è trasparente sulla superficie sistemata, così si vedono lo sterro (terreno sopra il progetto) e il riporto.

## Scegliere cosa mostrare

Fare clic su {{ui:Mostra}} nella barra e spuntare o deselezionare:

| Elemento | Che cos'è |
|---|---|
| Terreno esistente | La superficie costruita dai punti di rilievo (o letta da LandXML) |
| Superficie sistemata | Il terreno esistente con i corridoi e i piazzali sistemati (solo se ce ne sono) |
| Spigoli dei triangoli | Ogni spigolo del TIN, come linee |
| Curve di livello | Curve di livello principali e secondarie di ogni superficie mostrata, all'intervallo della pianta |
| Bordo della superficie | Il bordo esterno di ogni superficie mostrata, alle sue quote |
| Linee di discontinuità | Ogni linea di discontinuità, alle sue quote |
| Tracciati e progressive | Ogni tracciato sul suo profilo di progetto (sul terreno dove non c'è profilo), con segni ogni 50 ft o 20 m |
| Linee caratteristiche del corridoio | Margine della carreggiata, banchina e intersezione con il terreno su entrambi i lati |
| Superfici stradali | La strada che ogni corridoio costruisce dal suo assieme: corsie, banchine, cunette, cordoli, fasce e marciapiedi, ciascuno nel proprio colore, sulla superficie sistemata |
| Piante | Ogni pianta, e le piante in aiuole e siepi, come forme semplici dimensionate dall'elenco delle piante: un albero è un tronco e una chioma tonda (un cono per una conifera, un ciuffo su un tronco alto per una palma); arbusti, piante da siepe, perenni e coprisuolo sono cupole, le graminacee ciuffi, le rampicanti colonne sottili. Stanno sulla superficie sistemata (o sul terreno esistente) alla dimensione mostrata in pianta: adulta, oppure al momento dell'impianto |
| Pavimentazioni | Pavimentazioni e percorsi con le loro pendenze, muri, cordoli, gradini, e rampe che salgono a tratti con pianerottoli tra un tratto e l'altro |
| Piazzali e intersezioni | Il contorno di ogni piazzale alla sua quota e la sua linea di intersezione con il terreno |
| Tubazioni e manufatti | Tubazioni come tubi circolari tra le loro quote di fondo, manufatti dalla bocca fino al fondo del pozzetto |
| Punti di rilievo | Un punto a ogni punto con una quota (inizialmente disattivato) |
| Layer GIS | I layer GIS mostrati in pianta, nei loro colori: linee e contorni con le proprie quote alle loro quote, gli altri appoggiati sul terreno esistente (lo seguono esattamente); i punti come piccole croci. Le forme senza quota fuori dalla superficie sono omesse, e la vista ne indica il numero |
| Etichette | Nomi e valori sempre rivolti verso di sé: il nome di ogni tracciato al suo inizio e le sue progressive ogni 100 ft (o 100 m), la quota di ogni curva di livello principale, piazzali, linee caratteristiche e manufatti per nome, e con **Punti di rilievo** spuntato il numero e la quota di ogni punto |

Le etichette restano della stessa dimensione e dritte comunque si ruoti o si ingrandisca, e una collina davanti a un'etichetta la nasconde. Dove si affollano, si vedono le più importanti e le altre attendono l'ingrandimento: prima i tracciati, poi i manufatti, i piazzali, le linee caratteristiche, le progressive, le curve di livello e i punti, quelli più vicini per primi. Sono solo a schermo: esportazioni e stampe le escludono.

Le scelte, l'esagerazione e i colori sono ricordati in questo browser.

Una strada è costruita sul terreno esistente. Con un tracciato e un corridoio ma senza ancora punti di rilievo o superficie, la strada è disegnata su un terreno fittizio piatto: alla quota media del suo profilo di progetto, oppure a livello 0 se non c'è neanche un profilo. Un avviso in basso nella vista 3D e nelle proprietà del corridoio lo indica. È solo un'immagine: non ne derivano volumi né sezioni. Aprire i punti di rilievo o una superficie e la strada si sposta da sola sul terreno reale.

L'esagerazione verticale allunga il terreno, non le piante: le piante stanno sul terreno esagerato alla loro altezza e ampiezza reali, quindi un albero appare come un albero a qualsiasi impostazione. Le piante sono forme semplici, non modelli dettagliati: migliaia di esse restano rapide da ruotare e ingrandire.

## Tubazioni e manufatti

- Una tubazione è disegnata con il fondo interno alle quote di fondo impostate e la sommità interna (la generatrice superiore) un diametro interno più in alto. I diametri sono in pollici in un progetto in piedi e in millimetri in un progetto metrico, come nel pannello destro.
- Un manufatto va dalla sua bocca (digitata, oppure dalla superficie) giù al fondo (la quota di fondo più bassa meno la profondità del fondo). Senza alcuna quota di fondo, è disegnato profondo 5 ft (1.5 m).
- Tubazioni e manufatti con un problema (vedere il controllo di rete nel pannello destro) sono disegnati in rosso.
- Una tubazione senza quote di fondo non è disegnata; una nota in basso alla vista indica quante sono.

## Selezionare dalla vista 3D

Fare clic su un tracciato (o sulla sua strada), un piazzale, una linea caratteristica, una tubazione, un manufatto, un punto di rilievo, una pianta, una rampa o un altro elemento di pavimentazione. Si seleziona come se si fosse fatto clic in pianta: le sue proprietà si aprono nel pannello destro, dove si possono modificare, e viene disegnato nel colore di selezione sopra tutto in 3D. Ciò che si seleziona in pianta è evidenziato anche in 3D. Un suggerimento accanto al puntatore indica che cosa si è cliccato con la sua est, nord e quota. Tubazioni e manufatti si possono cliccare anche dove sono sotto terra; una linea nascosta da una collina non si può cliccare attraverso di essa.

Fare clic su una linea di discontinuità per vedere quale è: viene evidenziata e la barra di stato ne indica il nome (le linee di discontinuità non hanno proprietà proprie).

Fare clic sul terreno per leggere est, nord e quota in quel punto nel suggerimento.

## Percorrere un tracciato

Fare clic su **Percorri** nella barra 3D e scegliere un tracciato. La vista si sposta sul posto di guida: 3.5 ft (1.07 m) sopra la strada, sul suo profilo di progetto (sul terreno esistente lungo la mezzeria quando non ne ha ancora uno), guardando avanti lungo di esso.

- **Riproduci** oppure {{key:Space}} guida alla velocità scelta (da 10 a 65 mph, o da 15 a 100 km/h); {{key:Space}} di nuovo mette in pausa. Si ferma alla fine; **Riproduci** riparte poi dall'inizio.
- Il cursore salta a qualsiasi progressiva; {{key:Left}} e {{key:Right}} avanzano o indietreggiano di 10 ft (5 m).
- Trascinare nella vista mette in pausa e permette di guardarsi intorno.
- **Ferma** oppure {{key:Esc}} riporta la vista dov'era.

L'esagerazione verticale vale anche durante la guida: impostarla a 1× per vedere la strada come sarà.

## Luce dal sole

Aprire **Sole** nella barra 3D e spuntare **Luce dal sole**. Inserire una data, un orario e il suo fuso (lo scostamento da UTC: in estate, quello dell'ora legale), e la latitudine e longitudine del sito. Quando il progetto ha un sistema di coordinate, sono compilate da esso.

Il sito è poi illuminato da dove si trova il sole, con **Ombre** su terreno, corridoio e piazzali; il menu indica l'azimut del sole e la sua altezza, oppure che è sotto l'orizzonte. Le posizioni derivano dalle equazioni solari della NOAA. Le ombre cadono nel verso giusto a qualsiasi esagerazione, ma si fermano al bordo del sito: colline ed edifici oltre di esso non ne proiettano.

## Esportare la vista 3D

Fare clic su {{ui:GLB}} o {{ui:OBJ}} nella barra. Quanto la vista mostra è salvato in scala vera (senza esagerazione), in metri, con Y verso l'alto. Dettagli: [Esportare il sito in 3D](topic:export-3d).
