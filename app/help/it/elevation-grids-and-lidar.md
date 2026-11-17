---
title: Griglie di quota e LiDAR
summary: Costruire il terreno esistente da un DEM (GeoTIFF o griglia ASCII) o da punti LiDAR (LAS, LAZ) — scegliere l'area, diradare i dati, scegliere le classi e verificare le unità di quota — e restituire una superficie come griglia di quote GeoTIFF.
keywords: dem, dtm, griglia di quote, geotiff, tif, griglia ascii, asc, lidar, las, laz, nuvola di punti, classi, terreno, diradamento, nodata, raster, esporta geotiff, gis
from: c8b2d18a
---

I dati pubblici di quota arrivano in due modi: **griglie di quota** (un DEM: una quota per cella quadrata, di solito un GeoTIFF `.tif` o una griglia ASCII `.asc`) e **punti LiDAR** (milioni di ritorni laser in un file `.las`, o `.laz` se compresso). CivilCraft trasforma l'uno o l'altro in punti di rilievo o in una superficie, all'interno del browser: nulla viene caricato.

## Aprire il file

1. Fare clic su {{ui:Apri}} (oppure {{ui:Importa}} nel gruppo GIS) e scegliere il file, oppure trascinarlo sulla pianta. Per una griglia ASCII, scegliere anche il suo file `.prj`, così CivilCraft conosce il suo sistema di coordinate.
2. La finestra di importazione mostra ciò che il file dichiara di sé: dimensione, celle o punti, sistema di coordinate, posizione in latitudine e longitudine e intervallo di quota. Per il LiDAR legge prima ogni punto una volta per contare le **classi** (una barra di avanzamento indica lo stato; {{ui:Annulla}} la interrompe).

Un GeoTIFF con tre o quattro bande (rosso, verde, blu) è un'immagine, non quote: va invece nei layer cartografici.

## Scegliere cosa importare

- **Area**: {{ui:L'estensione del progetto e un margine}} (digitare il margine), {{ui:Ciò che mostra ora la pianta}}, oppure {{ui:L'intero file}}. Viene letta solo quella parte del file.
- **Dirada a**: la spaziatura tra i punti ottenuti, nelle unità del progetto. La riga sotto le impostazioni mostra quanti punti si ottengono mentre si digita. Per una griglia, CivilCraft mantiene ogni seconda, terza … cella, così le quote restano esattamente quelle del file; non calcola mai medie tra celle. Per il LiDAR, l'area viene suddivisa in quadrati di quella dimensione e si mantiene un punto per quadrato: {{ui:Il punto più vicino al centro di ogni cella}} (predefinito), {{ui:Il punto più basso di ogni cella}} (utile quando il file non ha la classe terreno: il terreno è sotto gli alberi) oppure {{ui:La media dei punti di ogni cella}}.
- **Classi** (LiDAR): il terreno (classe 2) è selezionato quando il file lo contiene; edifici, alberi e rumore sono esclusi. Quando non c'è la classe terreno, tutte le classi sono selezionate, e la finestra di dialogo lo indica.
- **Terreno** (LiDAR, 0.8): una nuvola da drone non ha la classe terreno. Quando il file non ne ha, la finestra di dialogo si apre su {{ui:Trova il terreno da solo (nuvole da drone, senza classe terreno)}}: vengono letti tutti i punti tranne il rumore, si mantiene il punto più basso di ogni cella, e poi CivilCraft elimina edifici, alberi e punti bassi isolati con un filtro morfologico progressivo (Zhang e altri, 2003) regolabile: **Oggetto più grande da eliminare** (la larghezza dell'edificio più grande; le finestre crescono finché non lo coprono; 0 significa 20 celle) e **Pendenza massima del terreno**. Il lavoro si svolge sulla griglia dei punti più bassi, quindi una nuvola di decine di milioni di punti costa non più del suo numero di celle (il diradamento è un unico passaggio in streaming). La spaziatura è la cella: una più grande è più veloce e manca piccoli oggetti meno di quanto ci si possa aspettare, una più fine mantiene più dettaglio del terreno. Il rapporto indica quanti punti sono stati mantenuti come terreno, quante celle sono state eliminate come oggetti e quanti punti bassi isolati sono stati scartati. Su un rilievo da drone simulato di 300 m con cinque edifici, 70 alberi e 200 valori anomali bassi, i punti mantenuti erano entro 3 cm dal terreno reale e nessun tetto o chioma è stato mantenuto.
- **Quote nel file**: metri, piedi o piedi US survey. Quando il file lo dichiara, l'unità è già scelta. Quando non lo dichiara, bisogna scegliere: la finestra di dialogo mostra l'intervallo di quote in entrambi i modi, così si può capire quale abbia senso per il sito.
- **Importa come** (solo griglie): {{ui:Punti di rilievo (descrizione DEM)}}, oppure {{ui:La superficie stessa (una griglia di triangoli)}}.

Un'importazione contiene al massimo 500,000 punti. Quando una scelta ne darebbe di più, la finestra di dialogo indica di quanto e quale spaziatura sarebbe adatta, e {{ui:Importa}} resta disattivato.

Fare clic su {{ui:Importa}}. Una barra di avanzamento mostra la lettura; {{ui:Annulla}} la interrompe e non cambia nulla.

:::warning
Le unità verticali sono un errore frequente. Molti DEM state plane hanno est e nord in piedi ma quote in metri. Verificare l'intervallo mostrato dalla finestra di dialogo con quanto si conosce del sito.
:::

## Cosa si ottiene

- **Punti di rilievo**: numerati dopo il numero più alto di punto, con la descrizione `DEM` (griglie) o `LIDAR`, così formano un unico gruppo di punti sotto **Punti** e costruiscono la superficie come qualsiasi altro punto. L'importazione è un'unica operazione: {{key:Mod+Z}} li rimuove di nuovo.
- **La superficie stessa**: un TIN a griglia, due triangoli per cella, divisi sulla diagonale sud-ovest nord-est. Un triangolo con un angolo privo di dati viene escluso, quindi i vuoti nei dati restano vuoti. La superficie coincide con la griglia in ogni punto della griglia ed è un piano piatto all'interno di ciascun triangolo. Sostituisce la superficie del progetto (la finestra di dialogo chiede prima conferma); {{key:Mod+Z}} ripristina la superficie precedente. L'intestazione del pannello di sinistra indica **Superficie (da una griglia di quote)**.

## Sistemi di coordinate

- Se il progetto ha un sistema di coordinate e il file ne indica un altro, ogni punto viene convertito nel sistema del progetto (e nelle sue coordinate di terreno o locali quando le ha).
- Se il progetto non ne ha e il sistema del file è nelle unità del progetto (piedi o metri), la finestra di dialogo propone di renderlo il sistema di coordinate del progetto, nella stessa operazione di annullamento dei punti.
- Se il file è in latitudine e longitudine, oppure in metri per un progetto in piedi, la finestra di dialogo chiede di scegliere prima il sistema di coordinate del progetto.
- Se il file non lo indica, i suoi valori vengono presi come coordinate del progetto. È possibile scegliere invece il sistema del file.

## Esportare una superficie come GeoTIFF

1. Fare clic su {{ui:Esporta}} nel gruppo GIS.
2. Nella parte GeoTIFF scegliere la superficie (terreno esistente o superficie di progetto) e la dimensione della cella. Il valore predefinito deriva dalla lunghezza media dei lati dei triangoli della superficie. La finestra di dialogo mostra la dimensione della griglia che verrà scritta.
3. Fare clic su {{ui:Scarica il GeoTIFF}}.

Il file è una banda di quote in virgola mobile a 32 bit nelle unità del progetto, sull'estensione della superficie; le celle al di fuori della superficie sono "nessun dato" (−3.4028235e38). Il valore di ogni cella è la quota della superficie nel centro della cella. Le coordinate sono coordinate **di griglia**: un progetto in coordinate di terreno o locali viene riconvertito nella griglia. Il file indica il sistema di coordinate del progetto con il suo codice EPSG; un sistema senza codice EPSG non viene scritto, e la finestra di dialogo avvisa di indicare al reparto GIS quale sistema è.

## Cosa è stato verificato

- I lettori di GeoTIFF e di griglie ASCII sono stati verificati con GDAL (tramite rasterio), la libreria che la maggior parte dei programmi GIS usa per leggere questi file: griglie float a 32 bit e intere a 16 bit, a riquadri e a strisce, DEFLATE e LZW, nodata, scala e offset, pixel-is-point, una griglia UTM, una griglia state plane in piedi US survey e una griglia latitudine/longitudine — ogni valore uguale.
- I lettori LAS e LAZ sono stati verificati con laspy: LAS 1.2 e 1.4, formati di punto 0, 1, 3, 6, 7 e 8, con e senza sistema di coordinate, e LAZ scritto dal suo backend compatibile con LASzip — ogni punto uguale.
- Le coordinate convertite sono state verificate con PROJ a 1 mm.
- I GeoTIFF esportati sono stati riletti con GDAL: sistema di coordinate, posizioni delle celle, nodata, unità e valori uguali alla superficie entro 0.0001.
- Nulla di questo è stato aperto in altri programmi GIS o CAD.

## Non ancora implementato

- Cambi di datum verticale (modelli di geoide): le quote vengono usate così come sono nel file.
- Dati di forma d'onda, ritorni LiDAR diversi dalla classe, colori e intensità.
- Più bande, overview, o file oltre 200 MB.
- Scrittura di LAS o LAZ da una superficie o da questo strumento (l'add-on [Nuvole di punti](topic:point-clouds) scrive una nuvola ripulita come LAS 1.4 o LAZ).
