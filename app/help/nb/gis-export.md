---
title: Eksporter as-built-data for GIS
summary: Lever oppmålingspunkter, koter, linjeføringer, byggeplater, rør og konstruksjoner til en kommunes eller fylkes GIS-avdeling som shapefiler, GeoPackage, GeoJSON eller KML, i rutenettkoordinater for prosjektets koordinatsystem.
keywords: gis, eksport, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, rør, konstruksjoner, ledninger, kommune, fylke, rutenett, terreng, epsg, prj
from: bba4fea5
---

Mange kommuner og fylker ber om as-built-data i et GIS-format når et prosjekt avsluttes: hvor rørene og konstruksjonene ble lagt, endelige høyder, og veglinjen. **GIS › Eksporter** skriver det CivilCraft har som GIS-layere, ett for hver type objekt.

## Før du eksporterer

1. Sett prosjektets koordinatsystem i {{ui:Koordinater}}. En GIS-avdeling må vite hvor tallene er; uten et system bærer filene prosjektets egne tall og nevner ingen.
2. Kontroller terrengmodellen, linjeføringene, byggeplatene og rørnettet slik du vil levere dem.
3. Spør avdelingen hvilket format og hvilket koordinatsystem de vil ha. Mange ber fortsatt om shapefiler i den lokale state plane-sonen; nyere systemer tar GeoPackage.

## Eksporter

1. Klikk {{ui:Eksporter}} i **GIS**-gruppen.
2. Under **Hva**, kryss av typene som skal sendes. Hver viser hvor mange objekter den har; typer uten noe ennå er nedtonet.
3. Under **Som**, velg formatet.
4. Les notatene om koordinater og enheter, og klikk nedlastingsknappen. Statuslinjen sier hva som ble tatt med, og eventuelle feltnavn som ble forkortet.

Dialogen har også eksporten av høyderutenett ({{ui:Terrengmodell som GeoTIFF-høyderutenett}}); se [Høyderutenett og LiDAR](topic:elevation-grids-and-lidar).

## Hva hver type inneholder

| Type | Form | Felt |
|---|---|---|
| Oppmålingspunkter | Punkter med høyde | `P` punktnummer, `N` nord, `E` øst, `Z` høyde, `D` beskrivelse |
| Koter for eksisterende terreng og for formet terreng | Linjer i sin høyde | `ELEV` |
| Bruddlinjer | Linjer med høyder | `NAME` |
| Terrengmodellens grense | Polygon (den tegnede grensen, ellers terrengmodellens kant) | `NAME` |
| Linjeføringer | Senterlinjer | `NAME`, `LENGTH`, `STA_START`, `STA_END` (profilnummer som vanlige tall) |
| Byggeplater | Polygoner i byggeplatens høyde | `NAME`, `ELEV`, `AREA` |
| Dagslinjer | Linjer med høyder (byggeplater og korridorer) | `NAME` |
| Korridorens formlinjer | Linjer med høyder: senter, kanter av kjørebane, skuldre | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Rør | Linjer fra øvre til nedre bunn | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (prosent), `LENGTH`, `NETWORK` |
| Konstruksjoner | Punkter ved kumkanten | `NAME`, `RIM`, `INVERT` (den laveste rørbunnen der), `SUMP`, `DIA`, `DIA_UNIT` |
| Hvert GIS-layer | Som importert | Egne felt |

Lengder, profilnummer og høyder er i prosjektets enheter (US survey feet eller meter). Rør- og konstruksjonsdiametre er i tommer for fotprosjekter og i millimeter for meterprosjekter; `DIA_UNIT` sier hvilken.

## Formatene

- **Shapefile**: én `.zip` med en shapefil per type (`.shp`, `.shx`, `.dbf`), en `.cpg` som sier at teksten er UTF-8, og en `.prj` som navngir koordinatsystemet. Former med høyder skrives som shapefilens Z-typer. Feltnavn lenger enn 10 tegn forkortes, som formatet krever, og statuslinjen lister dem.
- **GeoPackage**: én `.gpkg`-fil med en tabell per type, og koordinatsystemet lagret med sin EPSG-kode. Én fil i stedet for mange, med lange feltnavn beholdt.
- **KML** eller **KMZ** (KML zippet): én fil med breddegrad og lengdegrad for Google Earth og nettkart, en mappe per type, og hvert objekt er en markør navngitt etter NAME-feltet med alle felt som utvidede data. Høyder er i meter (høydemodus absolutt). Som GeoJSON trenger den prosjektets koordinatsystem.
- **GeoJSON**: én fil med breddegrad og lengdegrad (GeoJSON-standarden tillater ikke noe annet), og hvert objekt har en `kind`-egenskap (`pipes`, `structures`, …) slik at mottakeren kan skille dem. Høyder regnes om til meter, som standarden krever; de blir stående på prosjektets vertikale datum (CivilCraft har ingen geoidmodell). Et prosjekt uten koordinatsystem kan ikke eksportere GeoJSON, og dialogen sier hvorfor.

## Rutenett, ikke terreng

GIS-avdelinger lagrer dataene sine i **rutenett**-koordinater for et koordinatsystem. Hvis prosjektet bruker terreng- eller lokale koordinater (satt i {{ui:Koordinater}}), konverteres hver koordinat tilbake til rutenett på vei ut: tallene i filene skiller seg fra planens med skalafaktoren din (og rotasjon, for et lokalt system). Punktfeltene `N` og `E` har også rutenettverdiene. Dialogen minner deg om det.

:::tip
Send et kort notat sammen med filene: koordinatsystemet og EPSG-koden, det vertikale datumet for høydene, enhetene, og hva hver fil er.
:::

## Hva som er kontrollert

- Hver fil som ble skrevet, ble lest tilbake med GDAL, biblioteket de fleste GIS-programmer bruker til å lese disse filene: hver form, høyde og attributt, antall objekter, og koordinatsystemet som EPSG-kode (`.prj` og GeoPackage). Våre egne lesere leser dem tilbake på samme måte.
- GeoJSON-filer følger RFC 7946: lengdegrad før breddegrad, ingen `crs`-medlem, ytre ringer mot klokken og hull med klokken; posisjoner stemte med PROJ innen 2 mm.
- Et prosjekt med terrengkoordinater ble eksportert, og hvert punkt ble kontrollert mot sine rutenettkoordinater.
- Ingenting her er åpnet i andre GIS-programmer ennå. Kontroller første leveranse med avdelingen før du stoler på den.
