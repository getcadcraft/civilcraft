---
title: Eksportér as-built-data til GIS
summary: Overdrag opmålingspunkter, højdekurver, tracéer, byggeplateauer, rør og konstruktioner til en kommunes eller et amts GIS-afdeling som shapefiles, GeoPackage, GeoJSON eller KML, i gitterkoordinater for projektets koordinatsystem.
keywords: gis, eksport, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, rør, konstruktioner, forsyning, kommune, amt, gitter, terræn, epsg, prj
from: bba4fea5
---

Mange kommuner og amter beder om as-built-data i et GIS-format, når et projekt afsluttes: hvor rørene og konstruktionerne blev lagt, de endelige planerede koter og vejens midterlinje. **GIS › Eksportér** skriver det CivilCraft har som GIS-lag, ét for hver slags objekt.

## Før du eksporterer

1. Angiv projektets koordinatsystem i {{ui:Koordinater}}. En GIS-afdeling skal vide, hvor tallene er; uden et system bærer filerne projektets egne tal og nævner ingen.
2. Kontrollér overfladen, tracéerne, plateauerne og rørnettet, så du vil have dem leveret.
3. Spørg afdelingen hvilket format og hvilket koordinatsystem de vil have. Mange beder stadig om shapefiles i den lokale State Plane-zone; nyere systemer tager GeoPackage.

## Eksport

1. Klik på {{ui:Eksportér}} i **GIS**-gruppen.
2. Under **Hvad** sætter du flueben ved de slags, der skal sendes. Hver viser, hvor mange objekter den har; slags uden noget endnu er nedtonet.
3. Under **Som** vælger du formatet.
4. Læs noterne om koordinater og enheder, og klik så på downloadknappen. Statuslinjen siger, hvad der blev med, og hvilke feltnavne der blev forkortet.

Dialogen rummer også eksport af kotegitteret ({{ui:Overflade som GeoTIFF-kotegitter}}); se [Kotegitre og LiDAR](topic:elevation-grids-and-lidar).

## Hvad hver slags indeholder

| Slags | Form | Felter |
|---|---|---|
| Opmålingspunkter | Punkter med kote | `P` punktnummer, `N` nord, `E` øst, `Z` kote, `D` beskrivelse |
| Højdekurver for eksisterende terræn, for det planerede terræn | Linjer i deres kote | `ELEV` |
| Brudlinjer | Linjer med koter | `NAME` |
| Overfladegrænse | Polygon (den tegnede grænse, ellers overfladens kant) | `NAME` |
| Tracéer | Midterlinjer | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stationeringer som rene tal) |
| Byggeplateauer | Polygoner i plateauets kote | `NAME`, `ELEV`, `AREA` |
| Skæringslinjer i terræn | Linjer med koter (plateauer og korridorer) | `NAME` |
| Korridorens feature-linjer | Linjer med koter: midte, kanter af kørebanen, skuldre | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Rør | Linjer fra øvre til nedre bundkote | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procent), `LENGTH`, `NETWORK` |
| Konstruktioner | Punkter ved randen | `NAME`, `RIM`, `INVERT` (den laveste rørbundkote dér), `SUMP`, `DIA`, `DIA_UNIT` |
| Hvert GIS-lag | Som importeret | Dets egne felter |

Længder, stationeringer og koter er i projektets enheder (US survey-fod eller meter). Rør- og konstruktionsdiametre er i tommer for fodprojekter og i millimeter for meterprojekter; `DIA_UNIT` siger hvilken.

## Formaterne

- **Shapefile**: én `.zip` med en shapefile for hver slags (`.shp`, `.shx`, `.dbf`), en `.cpg`, der siger at teksten er UTF-8, og en `.prj`, der navngiver koordinatsystemet. Former med koter skrives som shapefilens Z-typer. Feltnavne længere end 10 tegn forkortes, som formatet kræver, og statuslinjen lister dem.
- **GeoPackage**: én `.gpkg`-fil med en tabel for hver slags, og koordinatsystemet gemt med dets EPSG-kode. Én fil i stedet for mange, og lange feltnavne bevares.
- **KML** eller **KMZ** (KML zippet): én fil med breddegrad og længdegrad til Google Earth og webkort, en mappe for hver slags, og hvert objekt som en placemark navngivet ud fra dets NAME-felt med alle felter som udvidede data; højder i meter (højdetilstand absolut). Ligesom GeoJSON kræver den projektets koordinatsystem.
- **GeoJSON**: én fil med breddegrad og længdegrad (GeoJSON-standarden tillader intet andet), hvor hvert objekt har en `kind`-egenskab (`pipes`, `structures`, …), så modtageren kan dele dem op. Højder omregnes til meter, som standarden kræver; de bliver på dit projekts vertikale datum (CivilCraft har ingen geoidemodel). Et projekt uden koordinatsystem kan ikke eksportere GeoJSON, og dialogen siger hvorfor.

## Gitter, ikke terræn

GIS-afdelinger gemmer deres data i **gitterkoordinater** for et koordinatsystem. Hvis dit projekt bruger terræn- eller lokale koordinater (sat i {{ui:Koordinater}}), omregnes hver koordinat tilbage til gitter på vej ud: tallene i filerne adskiller sig fra planens med din skalafaktor (og rotation, for et lokalt system). Punktfelterne `N` og `E` holder også gitterværdierne. Dialogen minder dig om det.

:::tip
Send en kort note med filerne: koordinatsystemet og dets EPSG-kode, det vertikale datum for dine koter, enhederne, og hvad hver fil er.
:::

## Hvad der er kontrolleret

- Hver skrevet fil blev læst tilbage af GDAL, biblioteket de fleste GIS-programmer bruger til at læse disse filer: hver form, kote og attribut, objekttallene og koordinatsystemet som dets EPSG-kode (`.prj` og GeoPackage). Vores egne læsere læste dem tilbage på samme måde.
- GeoJSON-filer følger RFC 7946: længdegrad før breddegrad, intet `crs`-medlem, ydre ringe mod uret og huller med uret; positioner matchede PROJ inden for 2 mm.
- Et projekt med terrænkoordinater blev eksporteret, og hvert punkt blev kontrolleret mod sine gitterkoordinater.
- Intet her er endnu åbnet i andre GIS-programmer. Kontrollér den første levering med afdelingen, før du stoler på den.
