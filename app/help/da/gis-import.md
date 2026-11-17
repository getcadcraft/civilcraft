---
title: Importér GIS-data
summary: Hent shapefiles, GeoJSON og GeoPackages ind i et projekt som GIS-lag, placér dem gennem det rigtige koordinatsystem, se deres attributter og brug dem til overfladen.
keywords: gis, etiketter, mærk objekter, attributter på planen, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importér, lag, attributter, koordinatsystem, epsg, breddegrad, længdegrad, koter, matrikler, brudlinjer, grænse
from: f6b235cc
---

Kommuners og amters GIS-afdelinger udleverer stedets kontekst som GIS-filer: matrikler, servitutter, højdekurver, forsyningsledninger, opmålingspunkter. CivilCraft åbner tre slags af dem som **GIS-lag**, der ligger under dit design på planen.

| Fil | Hvad du åbner |
|---|---|
| Shapefile | `.shp`-filen sammen med dens `.shx`, `.dbf`, `.prj` og `.cpg` (vælg dem alle), eller den `.zip` de kom i. En zip med flere shapefiles giver flere lag. |
| GeoJSON | `.geojson`-filen (en `.json`-fil, hvis første linjer siger `FeatureCollection` eller `Feature`, virker også). |
| GeoPackage | `.gpkg`-filen. Hver objekttabel i den vises på listen. |
| KML eller KMZ | `.kml`-filen (fra Google Earth eller et webkort), eller den zippede `.kmz`. Hver mappe bliver til et lag (delt op i punkter, linjer og polygoner, når den rummer flere slags); en placemarks navn, beskrivelse og udvidede data bliver til dets attributter. Højder er i meter og i breddegrad og længdegrad, som ved GeoJSON. |

Punkter, multipunkter, linjer, polygoner med huller og former med flere dele læses, med deres koter (z), når filen har dem. Målingsværdier (M) udelades. Kotegitre og LiDAR åbnes på samme måde: se [Kotegitre og LiDAR](topic:elevation-grids-and-lidar).

## Åbn filerne

1. Klik på {{ui:Importér}} i **GIS**-gruppen (eller {{ui:Åbn}}), vælg filerne, eller slip dem på planen. Filerne læses på denne computer; intet uploades.
2. Dialogen **Importér GIS-data** lister hvert lag, der blev fundet: dets slags, hvor mange objekter (og hvor mange der mangler geometri), hvor mange attributfelter, og det koordinatsystem filen angiver. Fjern fluebenet ved de lag, du ikke vil have.
3. Læs afsnittet **Koordinatsystem** (nedenfor) og linjen **Hvad der sker**, og klik så på {{ui:Importér}}.
4. Lagene vises på planen og under **GIS-lag** i venstre panel. Importen er ét trin: {{key:Mod+Z}} tager den tilbage.

En stor fil viser en fremdriftslinje over planen med knappen {{ui:Annuller}}.

## Koordinatsystemet

GIS-filer angiver, hvor de er, gennem et koordinatsystem (en shapefils `.prj`, en GeoPackages tabel over referencesystemer; GeoJSON er altid breddegrad og længdegrad). CivilCraft omregner hvert lag fra sit eget system til projektets. Det gætter aldrig:

- **Projektet har et koordinatsystem** (sat i {{ui:Koordinater}}): hvert lag med et eget system omregnes til det, inklusive en terræn- eller lokal justering. En fil uden `.prj` får to valg: **Samme som projektet** (dens tal indlæses, som de er) eller **Vælg filens system**.
- **Projektet har ingen, og filen er i et projiceret system i dit projekts enheder** (en State Plane-zone i US survey-fod for et fodprojekt, for eksempel): dialogen tilbyder **Brug det system som projektets koordinatsystem**. Det sættes i samme fortrydelsestrin som importen. Intet i projektet flytter sig; systemet siger kun, hvad tallene betyder. Du kan i stedet vælge et andet system til projektet, og lagene omregnes til det.
- **Projektet har ingen, og filen er i breddegrad og længdegrad** (alle GeoJSON) **eller i andre enheder**: {{ui:Importér}} er nedtonet, indtil du vælger projektets koordinatsystem. Vælgeren starter nær data.
- **Hverken projektet eller filerne angiver et system**: tallene indlæses, som de er, og dialogen siger det.

Koter omregnes også: GeoJSON-højder er meter (GeoJSON-standarden siger det); andre filers højder tages i enheden for deres eget system.

:::warning
Positioner i en GeoJSON-fil uden for ±180° længdegrad eller ±90° breddegrad er ikke breddegrad og længdegrad. Disse objekter udelades, og dialogen siger, hvor mange. En sådan fil er normalt en projiceret fil, der er gemt uden sit system; bed om den igen, eller om shapefilen med dens `.prj`.
:::

NAD83 behandles som det samme som WGS 84 (systemet GeoJSON bruger); de to adskiller sig med nogle meter i Nordamerika, så GeoJSON-data kan være forskudt med så meget. Hvor den bedste forskydning kræver en gitterfil (NADCON for NAD27, for eksempel), bruger CivilCraft en grovere offentliggjort forskydning, og dialogen for koordinatsystemet viser, hvor grov den er (for NAD27 ca. 20 m), indtil du tilføjer gitterfilen: se [Gitterforskydningsfiler](topic:coordinate-systems).

## GIS-lag

Hver række under **GIS-lag** har:

- et afkrydsningsfelt til at vise eller skjule laget (skjulte lag bliver heller ikke valgt);
- dens farve, valgt fra listen;
- en menu (de tre prikker) med {{ui:Zoom til}}, {{ui:Brug til overfladen…}}, {{ui:Omdøb…}} og {{ui:Fjern}}.

At vise, skjule, farvelægge om, omdøbe og fjerne er fortrydelsestrin. GIS-lag gemmes i projektfilen og kommer tilbage, når du åbner den. De medtages også i planens PDF-plot og dens DXF- og DWG-eksport, hver på et lag navngivet `GIS-` og dets nummer.

## Mærk objekter ud fra en attribut

I lagets {{ui:Mere}}-menu (de tre prikker i **GIS-lag**) vælger du et felt under **Mærk med**: hvert objekt viser sin værdi på planen, i lagets farve. Punkter mærkes ved siden af punktet, linjer langs midten af deres længste del (vendt, så de kan læses fra venstre mod højre), og polygoner i deres centrum. Tal vises med op til tre decimaler. Etiketter er 1.8 mm høje på papir ved enhver skala, og de går med i PDF-plottet, DXF og DWG. Vælg **Ingen etiketter** for at fjerne dem; hver ændring er ét trin ({{key:Mod+Z}} fortryder den). Et lag mærker højst 5,000 objekter.

## Se på et objekt

Med {{ui:Vælg}} tændt klikker du på et objekt. **Egenskaber** viser dets lag, hvilket objekt det er, dets form (dele, huller, hjørnepunkter), dets koter, filen det kom fra og den filens koordinatsystem, og derefter alle attributter i en tabel. Attributter er skrivebeskyttede: CivilCraft viser GIS-data, som de kom, og redigerer dem ikke.

Punkter vinder over linjer, når begge er under markøren; inde i et polygon vælges det mindste polygon.

## Brug til overfladen

Åbn et lags menu og vælg {{ui:Brug til overfladen…}} (eller knappen i **Egenskaber**). Hvad der tilbydes, afhænger af laget:

| Lag | Kan blive |
|---|---|
| Linjer med koter (3D-linjer) | Brudlinjer i deres egne koter |
| Linjer uden koter, men med et talfelt (højdekurver) | Brudlinjer i koten fra det felt du vælger |
| Polygoner | Overfladegrænsen (det valgte polygon, ellers det største), eller brudlinjer langs deres kanter |
| Punkter med koter, eller med et kotefelt | Opmålingspunkter, beskrevet med lagets navn, så de danner en punktgruppe |

Hver brug er ét fortrydelsestrin, der kopierer geometrien ind i projektet; selve laget bliver, som det er. Koter tages i projektets enheder.

## Punktfiler med breddegrad og længdegrad

En punktfil, hvis overskrift navngiver kolonnerne **latitude** og **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), læses som grader, ikke som nordkoordinat og østkoordinat. Importdialogen siger det. Ved {{ui:Importér}} omregnes punkterne til projektets koordinatsystem; et projekt uden et beder dig først om at vælge det. Grader indlæses aldrig som fod. Rækker uden for ±90° breddegrad eller ±180° længdegrad afvises med årsagen. Kotekolonnen tages, som den er, i projektets enheder.

## LandXML-filer, der navngiver et koordinatsystem

Når en LandXML-fil, du åbner, har et `CoordinateSystem`-element (en EPSG-kode, en WKT-beskrivelse eller et systemnavn), tilbyder CivilCraft det som projektets koordinatsystem. Intet flytter sig, hvis du accepterer; systemet siger kun, hvad tallene betyder.

## Hvad der er kontrolleret

- Hver læser blev sammenlignet med GDAL, biblioteket de fleste GIS-programmer bruger til at læse disse filer, på filer GDAL selv skrev: shapefiles af alle slags med og uden koter, linjer med flere dele, polygoner med huller, tomme geometrier, tekst-, tal-, dato- og sand/falsk-attributter, UTF-8- og Windows-1252-tekst med og uden `.cpg`, en zip med flere shapefiles, GeoJSON med alle geometrityper og en GeoPackage med fire tabeller. Hver geometri, kote og attribut matchede.
- Positioner omregnet fra breddegrad og længdegrad, og fra UTM, matchede PROJ (projektionsbiblioteket bag GDAL) inden for 3 mm.
- Beskadigede filer (afkortede, med løgnagtige størrelser, dårlige zip-filer, dårlige GeoPackages) giver én almindelig besked; intet hænger.
- Intet her er endnu åbnet i andre GIS-programmer, og filgeodatabaser, KML og KMZ læses ikke endnu (se [Ikke lavet endnu](topic:not-built-yet)).
