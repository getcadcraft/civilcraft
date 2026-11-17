---
title: Importa dati GIS
summary: Portare shapefile, GeoJSON e GeoPackage in un progetto come layer GIS, collocarli tramite il sistema di coordinate corretto, consultarne gli attributi e usarli per la superficie.
keywords: gis, etichette, etichettare elementi, attributi sulla pianta, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importa, layer, attributi, sistema di coordinate, epsg, latitudine, longitudine, curve di livello, particelle, linee di discontinuità, confine
from: f6b235cc
---

Gli uffici GIS di comuni e province forniscono il contesto del sito come file GIS: particelle, servitù, curve di livello, utenze, punti di controllo. CivilCraft apre tre tipi di questi come **layer GIS** che si collocano sotto il progetto sulla pianta.

| File | Cosa aprire |
|---|---|
| Shapefile | Il `.shp` insieme al suo `.shx`, `.dbf`, `.prj` e `.cpg` (selezionarli tutti), oppure lo `.zip` in cui sono arrivati. Uno zip con più shapefile dà più layer. |
| GeoJSON | Il file `.geojson` (anche un file `.json` le cui prime righe indicano `FeatureCollection` o `Feature` funziona). |
| GeoPackage | Il file `.gpkg`. Ogni tabella di elementi al suo interno viene elencata. |
| KML o KMZ | Il file `.kml` (da Google Earth o da una mappa web), oppure il `.kmz` compresso. Ogni cartella diventa un layer (suddiviso in punti, linee e poligoni quando ne contiene più tipi); il nome, la descrizione e i dati estesi di un segnaposto diventano i suoi attributi. Le altezze sono in metri e in latitudine e longitudine, come per GeoJSON. |

Vengono letti punti, multipunti, linee, poligoni con fori e forme a più parti, con le loro quote (z) quando il file le contiene. I valori di misura (M) vengono esclusi. Le griglie di quote e i LiDAR si aprono allo stesso modo: vedere [Griglie di quote e LiDAR](topic:elevation-grids-and-lidar).

## Aprire i file

1. Fare clic su {{ui:Importa}} nel gruppo **GIS** (oppure {{ui:Apri}}), scegliere i file, o trascinarli sulla pianta. I file vengono letti su questo computer; nulla viene caricato.
2. Il dialogo **Importa dati GIS** elenca ogni layer trovato: il suo tipo, quanti elementi (e quanti senza geometria), quanti campi di attributo, e il sistema di coordinate indicato dal file. Deselezionare i layer che non si vogliono.
3. Leggere la parte **Sistema di coordinate** (sotto) e la riga **Cosa accadrà**, poi fare clic su {{ui:Importa}}.
4. I layer compaiono sulla pianta e sotto **Layer GIS** nel pannello di sinistra. L'importazione è un unico passo: {{key:Mod+Z}} la annulla.

Un file grande mostra una riga di avanzamento sulla pianta con un pulsante {{ui:Annulla}}.

## Il sistema di coordinate

I file GIS indicano dove si trovano tramite un sistema di coordinate (il `.prj` di uno shapefile, la tabella dei sistemi di riferimento di un GeoPackage; GeoJSON è sempre in latitudine e longitudine). CivilCraft converte ogni layer dal proprio sistema in quello del progetto. Non indovina mai:

- **Il progetto ha un sistema di coordinate** (impostato in {{ui:Coordinate}}): ogni layer con un proprio sistema viene convertito in esso, compreso un adattamento di terreno o locale. Un file senza `.prj` offre due scelte: **Uguale al progetto** (i suoi numeri vengono caricati così come sono) oppure **Scegli il sistema del file**.
- **Il progetto non ne ha, e il file è in un sistema proiettato nelle unità del progetto** (per esempio una zona state plane in piedi US survey per un progetto in piedi): il dialogo offre **Usa quel sistema come sistema di coordinate del progetto**. Viene impostato nello stesso passo di annullamento dell'importazione. Nulla nel progetto si sposta; il sistema indica solo il significato dei numeri. È possibile scegliere invece un altro sistema per il progetto, e i layer vengono convertiti in esso.
- **Il progetto non ne ha, e il file è in latitudine e longitudine** (ogni GeoJSON) **oppure in altre unità**: {{ui:Importa}} resta disattivato finché non si sceglie il sistema di coordinate del progetto. Il selettore parte vicino ai dati.
- **Né il progetto né i file indicano un sistema**: i numeri vengono caricati così come sono, e il dialogo lo dichiara.

Anche le quote vengono convertite: le altezze GeoJSON sono in metri (lo dice lo standard GeoJSON); le altezze degli altri file sono prese nell'unità del proprio sistema.

:::warning
Le posizioni in un file GeoJSON fuori da ±180° di longitudine o ±90° di latitudine non sono latitudine e longitudine. Quegli elementi vengono esclusi e il dialogo indica quanti sono. Di solito è un file proiettato salvato senza il suo sistema: richiederlo di nuovo, oppure lo shapefile con il suo `.prj`.
:::

NAD83 è trattato come WGS 84 (il sistema usato da GeoJSON); i due differiscono di qualche metro in Nord America, quindi i dati GeoJSON possono essere spostati di altrettanto. Quando lo spostamento migliore richiede un file di griglia (per esempio NADCON per NAD27), CivilCraft usa uno spostamento approssimato pubblicato e il dialogo del sistema di coordinate mostra quanto è approssimato (per NAD27, circa 20 m), finché non si aggiunge la griglia: vedere [File di spostamento della griglia](topic:coordinate-systems).

## Layer GIS

Ogni riga sotto **Layer GIS** ha:

- una casella per mostrare o nascondere il layer (i layer nascosti non vengono neppure selezionati);
- il suo colore, scelto dall'elenco;
- un menu (i tre puntini) con {{ui:Zoom su}}, {{ui:Usa per la superficie…}}, {{ui:Rinomina…}} e {{ui:Rimuovi}}.

Mostrare, nascondere, cambiare colore, rinominare e rimuovere sono passi di annullamento. I layer GIS vengono salvati nel file di progetto e tornano all'apertura. Vengono inclusi anche nel PDF della pianta e nelle esportazioni DXF e DWG, ciascuno su un layer denominato `GIS-` e il suo numero.

## Etichettare elementi con un attributo

Nel menu {{ui:Altro}} del layer (i tre puntini in **Layer GIS**), scegliere un campo sotto **Etichetta con**: ogni elemento mostra il suo valore sulla pianta, nel colore del layer. I punti sono etichettati accanto al punto, le linee lungo il centro della loro parte più lunga (orientate per essere lette da sinistra a destra), i poligoni al loro centro. I numeri mostrano fino a tre decimali. Le etichette sono alte 1.8 mm su carta a qualsiasi scala, e finiscono nel PDF, DXF e DWG. Scegliere **Nessuna etichetta** per toglierle; ogni modifica è un passo ({{key:Mod+Z}} la annulla). Un layer etichetta al massimo 5,000 elementi.

## Osservare un elemento

Con {{ui:Seleziona}} attivo, fare clic su un elemento. **Proprietà** mostra il suo layer, quale elemento è, la sua forma (parti, fori, vertici), le sue quote, il file da cui proviene e il sistema di coordinate di quel file, poi ogni attributo in una tabella. Gli attributi sono in sola lettura: CivilCraft mostra i dati GIS come sono, non li modifica.

I punti hanno precedenza sulle linee quando sono entrambi sotto il puntatore; dentro un poligono viene scelto il poligono più piccolo.

## Usare per la superficie

Aprire il menu di un layer e scegliere {{ui:Usa per la superficie…}} (oppure il pulsante in **Proprietà**). Ciò che viene offerto dipende dal layer:

| Layer | Può diventare |
|---|---|
| Linee con quote (linee 3D) | Linee di discontinuità alle loro quote |
| Linee senza quote ma con un campo numerico (curve di livello) | Linee di discontinuità alla quota del campo scelto |
| Poligoni | Il contorno della superficie (il poligono selezionato, altrimenti il più grande), oppure linee di discontinuità lungo i loro bordi |
| Punti con quote, o con un campo quota | Punti di rilievo, descritti con il nome del layer così da formare un gruppo di punti |

Ogni uso è un passo di annullamento che copia la geometria nel progetto; il layer stesso resta com'è. Le quote vengono prese nelle unità del progetto.

## File di punti con latitudine e longitudine

Un file di punti la cui intestazione indica colonne di **latitudine** e **longitudine** (`lat`, `latitude`, `lon`, `long`, `longitude`) viene letto come gradi, non come nord ed est. Il dialogo di importazione lo indica. Su {{ui:Importa}}, i punti vengono convertiti nel sistema di coordinate del progetto; un progetto senza uno chiede prima di sceglierlo. I gradi non vengono mai caricati come piedi. Le righe fuori da ±90° di latitudine o ±180° di longitudine vengono rifiutate con il motivo. La colonna delle quote viene presa così com'è, nelle unità del progetto.

## File LandXML che indicano un sistema di coordinate

Quando un file LandXML che si apre ha un elemento `CoordinateSystem` (un codice EPSG, una descrizione WKT o un nome di sistema), CivilCraft lo offre come sistema di coordinate del progetto. Se lo si accetta, nulla si sposta; il sistema indica solo il significato dei numeri.

## Cosa è stato verificato

- Ogni lettore è stato confrontato con GDAL, la libreria usata dalla maggior parte dei programmi GIS per leggere questi file, su file scritti da GDAL: shapefile di ogni tipo con e senza quote, linee a più parti, poligoni con fori, geometrie vuote, attributi di testo, numero, data e vero/falso, testo UTF-8 e Windows-1252 con e senza `.cpg`, uno zip di più shapefile, GeoJSON con ogni tipo di geometria, e un GeoPackage con quattro tabelle. Ogni geometria, quota e attributo corrisponde.
- Le posizioni convertite da latitudine e longitudine, e da UTM, corrispondono a PROJ (la libreria di proiezioni alla base di GDAL) entro 3 mm.
- I file danneggiati (troncati, con dimensioni dichiarate errate, zip o GeoPackage guasti) danno un unico messaggio semplice; nulla si blocca.
- Nulla di questo è ancora stato aperto in altri programmi GIS, e i file geodatabase, KML e KMZ non sono ancora letti (vedere [Non ancora implementato](topic:not-built-yet)).
