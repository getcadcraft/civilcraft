---
title: Importer GIS-data
summary: Hent shapefiler, GeoJSON og GeoPackage-filer inn i et prosjekt som GIS-layere, plasser dem gjennom riktig koordinatsystem, se på attributtene og bruk dem til terrengmodellen.
keywords: gis, etiketter, merk objekter, attributter på planen, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, layere, attributter, koordinatsystem, epsg, breddegrad, lengdegrad, koter, eiendommer, bruddlinjer, avgrensning
from: f6b235cc
---

Kommuner og fylker deler ut stedsdata som GIS-filer: eiendommer, servitutter, koter, ledninger og oppmålingsstøtte. CivilCraft åpner tre typer av dem som **GIS-layere** som ligger under designet ditt på planen.

| Fil | Hva du åpner |
|---|---|
| Shapefile | `.shp`-filen sammen med `.shx`, `.dbf`, `.prj` og `.cpg` (velg alle), eller `.zip`-filen de kom i. En zip med flere shapefiler gir flere layere. |
| GeoJSON | `.geojson`-filen (en `.json`-fil der de første linjene sier `FeatureCollection` eller `Feature`, fungerer også). |
| GeoPackage | `.gpkg`-filen. Hver objekttabell i den vises. |
| KML eller KMZ | `.kml`-filen (fra Google Earth eller et nettkart), eller den zippede `.kmz`. Hver mappe blir et layer (delt i punkter, linjer og polygoner når den har flere typer); en markørs navn, beskrivelse og utvidede data blir attributtene. Høyder er i meter og i breddegrad og lengdegrad, som i GeoJSON. |

Punkter, multipunkter, linjer, polygoner med hull og flerdelte former leses, med sine høyder (z) når filen har dem. Målingsverdier (M) utelates. Høyderutenett og LiDAR åpnes på samme måte: se [Høyderutenett og LiDAR](topic:elevation-grids-and-lidar).

## Åpne filene

1. Klikk {{ui:Importer}} i **GIS**-gruppen (eller {{ui:Åpne}}), velg filene, eller slipp dem på planen. Filene leses på denne datamaskinen; ingenting lastes opp.
2. Dialogen **Importer GIS-data** lister hvert layer den finner: type, hvor mange objekter (og hvor mange uten geometri), hvor mange attributtfelt, og koordinatsystemet filen nevner. Fjern haken for layerne du ikke vil ha.
3. Les delen **Koordinatsystem** (under) og linjen **Hva skjer**, og klikk deretter {{ui:Importer}}.
4. Layerne vises på planen og under **GIS-layere** i venstre panel. Importen er ett steg: {{key:Mod+Z}} tar den tilbake.

En stor fil viser en fremdriftslinje over planen med en knapp {{ui:Avbryt}}.

## Koordinatsystemet

GIS-filer sier hvor de er gjennom et koordinatsystem (en shapefils `.prj`, en GeoPackages tabell for romlig referanse; GeoJSON er alltid breddegrad og lengdegrad). CivilCraft konverterer hvert layer fra sitt eget system til prosjektets. Det gjetter aldri:

- **Prosjektet har et koordinatsystem** (satt i {{ui:Koordinater}}): hvert layer med et eget system konverteres til det, inkludert en terreng- eller lokal justering. En fil uten `.prj` får to valg: **Samme som prosjektet** (tallene lastes som de er) eller **Velg filens system**.
- **Prosjektet har ingen, og filen er i et projisert system i prosjektets enheter** (for eksempel en state plane-sone i US survey feet for et fotprosjekt): dialogen tilbyr **Bruk det systemet som prosjektets koordinatsystem**. Det settes i samme angrestegg som importen. Ingenting i prosjektet flyttes; systemet sier bare hva tallene betyr. Du kan velge et annet system for prosjektet i stedet, og layerne konverteres til det.
- **Prosjektet har ingen, og filen er i breddegrad og lengdegrad** (hver GeoJSON) **eller i andre enheter**: {{ui:Importer}} er nedtonet til du velger prosjektets koordinatsystem. Velgeren starter nær dataene.
- **Verken prosjektet eller filene nevner et system**: tallene lastes som de er, og dialogen sier det.

Høyder konverteres også: GeoJSON-høyder er meter (GeoJSON-standarden sier det); andre filers høyder tas i enheten til deres eget system.

:::warning
Posisjoner i en GeoJSON-fil utenfor ±180° lengdegrad eller ±90° breddegrad er ikke breddegrad og lengdegrad. De objektene utelates, og dialogen sier hvor mange. En slik fil er vanligvis en projisert fil lagret uten sitt system; be om den på nytt, eller be om shapefilen med dens `.prj`.
:::

NAD83 behandles som det samme som WGS 84 (systemet GeoJSON bruker); de to skiller seg med noen meter i Nord-Amerika, så GeoJSON-data kan være av med så mye. Der den beste forskyvningen trenger en rutenettfil (NADCON for NAD27, for eksempel), bruker CivilCraft en grovere publisert forskyvning, og dialogen for koordinatsystemet viser hvor grov den er (for NAD27, omtrent 20 m), til du legger til rutenettet: se [Rutenettforskyvningsfiler](topic:coordinate-systems).

## GIS-layere

Hver rad under **GIS-layere** har:

- en avkrysningsboks for å vise eller skjule layeret (skjulte layere blir heller ikke valgt);
- sin farge, valgt fra listen;
- en meny (de tre prikkene) med {{ui:Zoom til}}, {{ui:Bruk for terrengmodellen…}}, {{ui:Gi nytt navn…}} og {{ui:Fjern}}.

Vise, skjule, endre farge, gi nytt navn og fjerne er steg som kan angres. GIS-layere lagres i prosjektfilen og kommer tilbake når du åpner den. De tas også med i planens PDF-plott og dens DXF- og DWG-eksporter, hver på et layer kalt `GIS-` og dets nummer.

## Merk objekter fra et attributt

I layerets {{ui:Mer}}-meny (de tre prikkene i **GIS-layere**) velger du et felt under **Merk med**: hvert objekt viser verdien sin på planen, i layerets farge. Punkter merkes ved siden av punktet, linjer langs midten av den lengste delen (vendt slik at den leses fra venstre mot høyre), og polygoner i midten. Tall vises med opptil tre desimaler. Etiketter er 1,8 mm høye på papir i enhver målestokk, og de går med i PDF-plottet, DXF og DWG. Velg **Ingen etiketter** for å fjerne dem; hver endring er ett steg ({{key:Mod+Z}} angrer den). Et layer merker høyst 5 000 objekter.

## Se på et objekt

Med {{ui:Velg}} på, klikk et objekt. **Egenskaper** viser layeret, hvilket objekt det er, formen (deler, hull, hjørnepunkter), høydene, filen det kom fra og den filens koordinatsystem, og deretter alle attributtene i en tabell. Attributtene er skrivebeskyttet: CivilCraft viser GIS-data slik de kom, og den redigerer dem ikke.

Punkter vinner over linjer når begge er under pekeren; inne i et polygon velges det minste polygonet.

## Bruk for terrengmodellen

Åpne et layers meny og velg {{ui:Bruk for terrengmodellen…}} (eller knappen i **Egenskaper**). Det som tilbys, avhenger av layeret:

| Layer | Kan bli |
|---|---|
| Linjer med høyder (3D-linjer) | Bruddlinjer i sine egne høyder |
| Linjer uten høyder, men med et tallfelt (koter) | Bruddlinjer i høyden i feltet du velger |
| Polygoner | Terrengmodellens grense (det valgte polygonet, ellers det største), eller bruddlinjer langs kantene |
| Punkter med høyder, eller med et høydefelt | Oppmålingspunkter, beskrevet med layerets navn slik at de danner en punktgruppe |

Hver bruk er ett steg som kan angres, og det kopierer geometrien inn i prosjektet; layeret selv blir som det er. Høyder tas i prosjektets enheter.

## Punktfiler med breddegrad og lengdegrad

En punktfil der overskriften nevner **breddegrad**- og **lengdegrad**-kolonner (`lat`, `latitude`, `lon`, `long`, `longitude`) leses som grader, ikke som nord og øst. Importdialogen sier det. Ved {{ui:Importer}} konverteres punktene til prosjektets koordinatsystem; et prosjekt uten et spør deg om å velge det først. Grader lastes aldri som fot. Rader utenfor ±90° breddegrad eller ±180° lengdegrad avvises med årsaken. Høydekolonnen tas som den er, i prosjektets enheter.

## LandXML-filer som nevner et koordinatsystem

Når en LandXML-fil du åpner har et `CoordinateSystem`-element (en EPSG-kode, en WKT-beskrivelse eller et systemnavn), tilbyr CivilCraft det som prosjektets koordinatsystem. Ingenting flyttes om du godtar; systemet sier bare hva tallene betyr.

## Hva som er kontrollert

- Hver leser ble sammenlignet med GDAL, biblioteket de fleste GIS-programmer bruker til disse filene, på filer GDAL skrev: shapefiler av alle typer med og uten høyder, linjer med flere deler, polygoner med hull, tomme geometrier, tekst-, tall-, dato- og sant/usant-attributter, UTF-8- og Windows-1252-tekst med og uten `.cpg`, en zip med flere shapefiler, GeoJSON med alle geometrityper, og en GeoPackage med fire tabeller. Hver geometri, høyde og attributt stemte.
- Posisjoner konvertert fra breddegrad og lengdegrad, og fra UTM, stemte med PROJ (projeksjonsbiblioteket bak GDAL) innen 3 mm.
- Skadede filer (kuttet av, med feil størrelse, dårlige zip-filer, dårlige GeoPackage-filer) gir én enkel melding; ingenting henger seg.
- Ingenting her er åpnet i andre GIS-programmer ennå, og filgeodatabaser, KML og KMZ leses ikke ennå (se [Ikke bygget ennå](topic:not-built-yet)).
