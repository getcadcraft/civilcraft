---
title: Esporta i dati come costruito per il GIS
summary: Consegnare punti di rilievo, curve di livello, tracciati, piazzole, tubazioni e manufatti a un ufficio GIS comunale o provinciale come shapefile, GeoPackage, GeoJSON o KML, in coordinate di griglia del sistema di coordinate del progetto.
keywords: gis, esportazione, kml, kmz, google earth, come costruito, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tubazioni, manufatti, utenze, comune, provincia, griglia, terreno, epsg, prj
from: bba4fea5
---

Molti comuni e province chiedono dati come costruito in formato GIS alla chiusura di un progetto: dove sono finite le tubazioni e i manufatti, le quote finali, l'asse della strada. **GIS › Esporta** scrive ciò che CivilCraft contiene come layer GIS, uno per tipo di oggetto.

## Prima di esportare

1. Impostare il sistema di coordinate del progetto in {{ui:Coordinate}}. Un ufficio GIS deve sapere dove sono i numeri; senza un sistema i file contengono i numeri propri del progetto e non ne indicano alcuno.
2. Controllare la superficie, i tracciati, le piazzole e la rete di tubazioni nel modo in cui si vuole consegnarli.
3. Chiedere all'ufficio quale formato e quale sistema di coordinate desidera. Molti chiedono ancora shapefile nella zona state plane locale; i sistemi più recenti accettano GeoPackage.

## Esporta

1. Fare clic su {{ui:Esporta}} nel gruppo **GIS**.
2. In **Cosa**, selezionare i tipi da inviare. Ognuno mostra quanti elementi contiene; i tipi senza nulla sono disattivati.
3. In **Come**, scegliere il formato.
4. Leggere le note su coordinate e unità, poi fare clic sul pulsante di download. La riga di stato indica cosa è stato inserito e gli eventuali nomi di campo abbreviati.

Il dialogo contiene anche l'esportazione della griglia di quote ({{ui:Superficie come griglia di quote GeoTIFF}}); vedere [Griglie di quote e LiDAR](topic:elevation-grids-and-lidar).

## Cosa contiene ciascun tipo

| Tipo | Forma | Campi |
|---|---|---|
| Punti di rilievo | Punti con quota | `P` numero del punto, `N` nord, `E` est, `Z` quota, `D` descrizione |
| Curve di livello del terreno esistente, della superficie di progetto | Linee alla loro quota | `ELEV` |
| Linee di discontinuità | Linee con quote | `NAME` |
| Contorno della superficie | Poligono (il contorno disegnato, altrimenti il bordo della superficie) | `NAME` |
| Tracciati | Assi | `NAME`, `LENGTH`, `STA_START`, `STA_END` (progressive come numeri semplici) |
| Piazzole | Poligoni alla quota della piazzola | `NAME`, `ELEV`, `AREA` |
| Linee di intersezione con il terreno | Linee con quote (piazzole e corridoi) | `NAME` |
| Linee caratteristiche del corridoio | Linee con quote: asse, margini della carreggiata, banchine | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tubazioni | Linee dal fondo superiore a quello inferiore | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percento), `LENGTH`, `NETWORK` |
| Manufatti | Punti sul chiusino | `NAME`, `RIM`, `INVERT` (il fondo più basso della tubazione lì), `SUMP`, `DIA`, `DIA_UNIT` |
| Ogni layer GIS | Come importato | I propri campi |

Lunghezze, progressive e quote sono nelle unità del progetto (piedi US survey o metri). I diametri di tubazioni e manufatti sono in pollici per i progetti in piedi e in millimetri per quelli in metri; `DIA_UNIT` indica quale.

## I formati

- **Shapefile**: un `.zip` con uno shapefile per tipo (`.shp`, `.shx`, `.dbf`), un `.cpg` che indica che il testo è UTF-8, e un `.prj` che indica il sistema di coordinate. Le forme con quote vengono scritte come tipi Z dello shapefile. I nomi di campo più lunghi di 10 caratteri vengono abbreviati, come richiede il formato, e la riga di stato li elenca.
- **GeoPackage**: un file `.gpkg` con una tabella per tipo, il sistema di coordinate memorizzato con il suo codice EPSG. Un solo file invece di molti, con nomi di campo lunghi mantenuti.
- **KML** o **KMZ** (KML compresso): un file con latitudine e longitudine per Google Earth e le mappe web, una cartella per tipo, ogni elemento un segnaposto denominato dal campo NAME con tutti i campi come dati estesi; altezze in metri (modalità altitudine assoluta). Come GeoJSON, richiede il sistema di coordinate del progetto.
- **GeoJSON**: un file con latitudine e longitudine (lo standard GeoJSON non ammette altro), con ogni elemento che porta una proprietà `kind` (`pipes`, `structures`, …) perché il destinatario possa separarli. Le altezze sono convertite in metri, come richiede lo standard; restano sul datum verticale del progetto (CivilCraft non ha un modello di geoide). Un progetto senza sistema di coordinate non può esportare GeoJSON, e il dialogo lo spiega.

## Griglia, non terreno

Gli uffici GIS conservano i dati in coordinate **di griglia** di un sistema di coordinate. Se il progetto usa coordinate di terreno o locali (impostate in {{ui:Coordinate}}), ogni coordinata viene riportata alla griglia in uscita: i numeri nei file differiscono da quelli della pianta per il fattore di scala (e per la rotazione, per un sistema locale). I campi punto `N` ed `E` contengono anche i valori di griglia. Il dialogo lo ricorda.

:::tip
Inviare una breve nota con i file: il sistema di coordinate e il suo codice EPSG, il datum verticale delle quote, le unità e cosa contiene ogni file.
:::

## Cosa è stato verificato

- Ogni file scritto è stato riletto con GDAL, la libreria usata dalla maggior parte dei programmi GIS per leggere questi file: ogni forma, quota e attributo, i numeri di elementi, e il sistema di coordinate come codice EPSG (`.prj` e GeoPackage). I nostri lettori li rileggono allo stesso modo.
- I file GeoJSON seguono RFC 7946: longitudine prima della latitudine, nessun membro `crs`, anelli esterni in senso antiorario e fori in senso orario; le posizioni corrispondono a PROJ entro 2 mm.
- È stato esportato un progetto con coordinate di terreno e ogni punto è stato verificato rispetto alle sue coordinate di griglia.
- Nulla di questo è ancora stato aperto in altri programmi GIS. Verificare la prima consegna con l'ufficio prima di farvi affidamento.
