---
title: Impostare il sistema di coordinate del progetto
summary: Indicare in quale sistema di coordinate si trova il rilievo, così CivilCraft mostra latitudine e longitudine, colloca i file GIS e i livelli di mappa, e scrive i file .prj. Scegliere per codice, per nome, dalle coordinate stesse o da un file .prj.
keywords: sistema di coordinate, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, proiezione, prj, wkt, datum, latitudine, longitudine, lat long, geografico, griglia, georeferenziazione, georeferenziare, assegnare sistema di coordinate
from: 964250e2
---

Le coordinate di un progetto sono numeri semplici finché non si dice cosa significano. Impostare il sistema di coordinate **non sposta mai nulla**: dice a CivilCraft che, per esempio, E 6,150,000 N 2,080,000 sono coordinate state plane della zona 6 della California in piedi US survey. Una volta che lo sa:

- la barra di stato mostra la latitudine e la longitudine del puntatore,
- i file GIS in altri sistemi (shapefile, GeoJSON, GeoPackage, griglie di quote, LiDAR) vengono convertiti nel progetto mentre si aprono,
- i livelli di mappa possono essere disegnati sotto la pianta ([Mostrare i livelli di mappa sotto la pianta](topic:map-layers)),
- le esportazioni in formati GIS portano con sé il sistema (un `.prj` per gli shapefile, il codice EPSG per GeoPackage e GeoTIFF).

## Scegliere il sistema

1. Scegliere {{ui:Coordinates}} nel gruppo {{ui:GIS}} della barra degli strumenti. Si apre la finestra di dialogo **Sistema di coordinate**. In alto indica in quale sistema si trova ora il progetto, oppure **Nessuno — le coordinate sono solo numeri**.
2. Trovare il sistema in uno di questi modi:
   - **Cerca**: digitare il codice EPSG (`2277`, `EPSG:2277`) o parole del nome (`texas central`, `utm 14n`, `lambert-93`). I codici sono elencati a partire da quello digitato; le parole elencano i sistemi il cui nome contiene tutte le parole.
   - {{ui:Systems these coordinates fit}} (quando il progetto ha punti o una superficie): CivilCraft legge il centro del progetto in ogni sistema della famiglia di unità del progetto ed elenca quelli la cui area di utilizzo lo contiene. Le coordinate state plane di solito si adattano solo a poche zone: un progetto in Texas a E 3,115,000 N 10,070,000 piedi US survey si adatta alle quattro varianti Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Ogni voce mostra dove cadrebbe il centro del progetto.
   - **Vicino a (lat, long)** e {{ui:Suggest}}: digitare dove si trova il sito, per esempio `30.27, -97.74` o `30°16′N 97°44′W`, e CivilCraft elenca i sistemi proiettati la cui area lo contiene, prima le griglie nazionali e statali.
   - {{ui:Read a .prj file…}}: aprire il `.prj` che accompagna uno shapefile o un disegno. CivilCraft lo confronta con il suo elenco tramite i calcoli di proiezione (quindi un `.prj` che dà al datum un nome diverso trova comunque il sistema giusto) e indica quale sia; quando nulla corrisponde esattamente, si usa la descrizione del file stesso. Si può anche trascinare un `.prj` sulla finestra di dialogo, oppure aprirlo o trascinarlo sulla pianta da solo.
3. Fare clic su un sistema nell'elenco. Sotto **Scelto** mostra il nome, il codice EPSG, l'unità, quanto bene il suo datum è legato a WGS 84, la sua area di utilizzo in latitudine e longitudine, e dove cade il centro del progetto.
4. Lasciare selezionato **Griglia** (per la maggior parte dei progetti; vedi [Coordinate del terreno e locali](topic:ground-and-local-coordinates) per gli altri) e scegliere {{ui:Apply}}.

La barra di stato ora mostra la latitudine e la longitudine del puntatore accanto a E e N. Impostare il sistema è un solo passo di annullamento: {{key:Mod+Z}} lo annulla.

:::note
Le unità devono coincidere: un progetto in piedi accetta sistemi in piedi US survey o piedi internazionali, un progetto in metri accetta sistemi in metri. CivilCraft spiega un rifiuto ("Il progetto è in piedi ma questo sistema è in metri…"). Un progetto in piedi con un sistema in piedi US survey usa i piedi survey: la "ft" del progetto significa il piede del sistema. I sistemi geografici (latitudine e longitudine, come lo stesso WGS 84) non possono essere il sistema di un progetto: i disegni richiedono Est e Nord.
:::

## Cambiare o rimuovere il sistema

Riaprire {{ui:Coordinates}}, scegliere un altro sistema e scegliere {{ui:Apply}}. Quando il progetto ha punti o un progetto, CivilCraft chiede **Le coordinate sono già in … ?**

- {{ui:Yes — nothing moves}}: i numeri restano come sono e cambia solo il loro significato. Usarlo quando il vecchio sistema era stato scelto per errore.
- {{ui:No — convert them}}: ogni punto di rilievo, linea di discontinuità, confine, PI di tracciato, angolo di piazzale e manufatto viene convertito dal vecchio sistema al nuovo, in un unico passo di annullamento. Una superficie letta da LandXML come triangoli non può essere convertita; ricostruirla prima dai punti.

{{ui:Remove the system}} toglie il sistema (nulla si sposta). I livelli GIS già nel progetto restano dove sono.

## Latitudine e longitudine nella barra di stato

Finché il progetto ha un sistema, la barra di stato mostra la latitudine e la longitudine del puntatore in WGS 84, per esempio `30°18′00.00″ N  97°42′00.00″ W`. Per scegliere invece i gradi decimali, andare su {{ui:Settings}}, {{ui:CivilCraft}}, **Latitudine e longitudine** ([Impostazioni di CivilCraft](topic:settings)). Con coordinate del terreno o locali la lettura passa prima da quel passaggio, così è corretta per il punto sotto il puntatore.

## Quanto è buono lo spostamento del datum

Latitudine, longitudine, GeoJSON e livelli di mappa sono tutti in WGS 84. Il legame di ogni sistema con WGS 84 è mostrato nella finestra di dialogo:

| Cosa dice la finestra | Cosa significa |
|---|---|
| WGS 84 stesso | Nessuno spostamento. |
| NAD83 è trattato come WGS 84 | I due differiscono di un metro o due nella maggior parte del Nord America, al massimo di pochi metri. Va bene per i livelli di mappa e il contesto del sito; non per la rete di rilievo. |
| Noto a circa *n* m (cifra EPSG) | Uno spostamento pubblicato; livelli di mappa e GeoJSON possono discostarsi di circa tanto. |
| Non noto per questo datum | Non esiste uno spostamento pubblicato senza un file a griglia: livelli di mappa e GeoJSON possono discostarsi di centinaia di metri. |
| Dal file di spostamento a griglia … | Un file di spostamento a griglia è in uso (vedi sotto): entro circa 10 cm da NAD83 dentro la griglia. |

Le coordinate del progetto non passano mai per uno spostamento di datum: solo ciò che viene convertito da o verso latitudine e longitudine. I datum verticali e i modelli di geoide non sono gestiti (le quote non vengono mai convertite). Dove il miglior spostamento richiede un file a griglia, l'elenco riporta uno spostamento pubblicato più grossolano e la finestra mostra la sua precisione (per i sistemi NAD27, per esempio circa 20 m), finché non si aggiunge la griglia.

## File di spostamento a griglia

Per un sistema NAD27, **File di spostamento a griglia** nella finestra del sistema di coordinate porta latitudine e longitudine, file GIS e livelli di mappa entro circa 10 cm da NAD83 invece che entro circa 20 m:

- **Scarica** la griglia suggerita per l'area del sistema (NADCON5 per gli Stati Uniti continentali, NADCON per l'Alaska, NTv2 per il Canada) da cdn.proj.org, il server pubblico di griglie di PROJ. Viene inviato solo il nome del file della griglia.
- Oppure **Aggiungi un file di griglia…** che si possiede già: NTv2 (`.gsb`) o una griglia PROJ GeoTIFF (`.tif`), fino a 20 MB.

La griglia viene salvata nel file di progetto, quindi viaggia con il progetto. La sezione indica se il centro del progetto è dentro la griglia: fuori, non viene applicato alcuno spostamento, quindi usare una griglia che copra il sito. **Interrompi l'uso della griglia** torna allo spostamento grossolano. Ogni modifica è un passo: {{key:Mod+Z}} lo annulla.

I livelli GIS già nel progetto restano dove sono quando la griglia cambia; importarli di nuovo per collocarli tramite la griglia. Le coordinate del progetto non si spostano mai.

## Cosa è stato verificato

- Ogni conversione è stata confrontata con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la libreria di coordinate usata dalla maggior parte dei programmi GIS, su oltre 330 sistemi: state plane in piedi US survey e in piedi, UTM nord e sud, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator e Mercatore web, tra gli altri. Est e Nord concordano entro 1 cm con lo stesso spostamento di datum (per la maggior parte ben al di sotto di 1 mm), e i calcoli di proiezione concordano con le definizioni di PROJ entro 1 cm.
- I file `.prj` scritti da PROJ nelle due forme più comuni (ESRI e OGC) sono stati riletti per 105 sistemi: 208 dei 210 corrispondevano al loro esatto codice EPSG e gli altri due a un sistema con gli stessi calcoli sullo stesso ellissoide. I file `.prj` scritti da CivilCraft vengono letti da PROJ come lo stesso sistema. I file `.prj` ESRI per i sistemi stereografici polari (UPS, polare Alaska) non possono essere letti; scegliere quei sistemi per codice.
- La latitudine e la longitudine nella barra di stato corrispondevano a PROJ entro 0.01″ nel browser.
