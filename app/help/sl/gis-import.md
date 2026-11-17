---
title: Uvoz podatkov GIS
summary: Shapefile, GeoJSON in GeoPackage uvozite v projekt kot GIS-sloje, jih postavite prek pravilnega koordinatnega sistema, pregledate njihove atribute in jih uporabite za površje.
keywords: gis, oznake, označevanje značilnic, atributi na načrtu, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, uvoz, sloji, atributi, koordinatni sistem, epsg, zemljepisna širina, zemljepisna dolžina, plastnice, parcele, prelomnice, meja
from: f6b235cc
---

Mestni in okrajni oddelki GIS razdelijo podatke o okolici gradbišča kot GIS-datoteke: parcele, služnosti, plastnice, komunalna omrežja, geodetske točke. CivilCraft odpre tri vrste takih datotek kot **GIS-sloje**, ki ležijo pod vašo zasnovo na načrtu.

| Datoteka | Kaj odprete |
|---|---|
| Shapefile | `.shp` skupaj z `.shx`, `.dbf`, `.prj` in `.cpg` (izberite vse), ali `.zip`, v katerem so prišle. Zip z več shapefile-i da več slojev. |
| GeoJSON | Datoteko `.geojson` (deluje tudi datoteka `.json`, katere prve vrstice navajajo `FeatureCollection` ali `Feature`). |
| GeoPackage | Datoteko `.gpkg`. Našteta je vsaka tabela značilnic v njej. |
| KML ali KMZ | Datoteko `.kml` (iz Google Earth ali spletnega zemljevida) ali stisnjeno `.kmz`. Vsaka mapa postane sloj (razdeljen na točke, črte in poligone, če vsebuje več vrst); ime, opis in razširjeni podatki oznake postanejo njeni atributi. Višine so v metrih, zemljepisna širina in dolžina pa kot pri GeoJSON. |

Točke, multitočke, črte, poligoni z luknjami in večdelne oblike so prebrani, skupaj z njihovimi višinami (z), če jih datoteka ima. Vrednosti mere (M) so izpuščene. Mreže višin in LiDAR se odpirajo na enak način: glejte [Mreže višin in LiDAR](topic:elevation-grids-and-lidar).

## Odpiranje datotek

1. Kliknite {{ui:Uvozi}} v skupini **GIS** (ali {{ui:Odpri}}), izberite datoteke ali jih spustite na načrt. Datoteke se preberejo na tem računalniku; ničesar se ne naloži.
2. Pogovorno okno **Uvoz podatkov GIS** našteje vsak najden sloj: njegovo vrsto, koliko značilnic (in koliko jih nima geometrije), koliko polj atributov in koordinatni sistem, ki ga datoteka navaja. Odznačite sloje, ki jih ne želite.
3. Preberite del **Koordinatni sistem** (spodaj) in vrstico **Kaj bo sledilo**, nato kliknite {{ui:Uvozi}}.
4. Sloji se prikažejo na načrtu in pod **GIS-sloji** v levem podoknu. Uvoz je en korak: {{key:Mod+Z}} ga povrne.

Velika datoteka prikaže vrstico napredka nad načrtom z gumbom {{ui:Prekliči}}.

## Koordinatni sistem

Datoteke GIS povedo, kje so, prek koordinatnega sistema (`.prj` shapefile-a, tabela prostorskih referenc GeoPackage; GeoJSON je vedno zemljepisna širina in dolžina). CivilCraft pretvori vsak sloj iz njegovega sistema v sistem projekta. Nikoli ne ugiba:

- **Projekt ima koordinatni sistem** (nastavljen v {{ui:Koordinate}}): vsak sloj s svojim sistemom se pretvori vanj, vključno s prilagoditvijo tal ali lokalno prilagoditvijo. Datoteka brez `.prj` ponudi dve izbiri: **Enako kot projekt** (njene številke se naložijo kakor so) ali **Izberi sistem datoteke**.
- **Projekt ga nima, datoteka pa je v projiciranem sistemu v enotah vašega projekta** (na primer cona državne ravnine v US survey feet za projekt v feet): pogovorno okno ponudi **Uporabi ta sistem kot koordinatni sistem projekta**. Nastavi se v istem koraku razveljavitve kot uvoz. Nič v projektu se ne premakne; sistem le pove, kaj številke pomenijo. Lahko pa za projekt izberete drug sistem, in sloji se pretvorijo vanj.
- **Projekt ga nima, datoteka pa je v zemljepisni širini in dolžini** (vsak GeoJSON) **ali v drugih enotah**: {{ui:Uvozi}} ostane zatemnjen, dokler ne izberete koordinatnega sistema projekta. Izbirnik začne blizu podatkov.
- **Niti projekt niti datoteke ne navajajo sistema**: številke se naložijo kakor so, pogovorno okno pa to pove.

Višine so pretvorjene prav tako: višine GeoJSON so v metrih (tako določa standard GeoJSON); višine drugih datotek so vzete v enoti njihovega sistema.

:::warning
Položaji v datoteki GeoJSON zunaj ±180° zemljepisne dolžine ali ±90° zemljepisne širine niso zemljepisna širina in dolžina. Te značilnice so izpuščene, pogovorno okno pa pove, koliko jih je. Taka datoteka je običajno projicirana datoteka, shranjena brez sistema; zahtevajte jo ponovno ali shapefile s `.prj`.
:::

NAD83 se obravnava enako kot WGS 84 (sistem, ki ga uporablja GeoJSON); med njima je razlika nekaj metrov v Severni Ameriki, zato so lahko podatki GeoJSON za toliko narobe. Kjer najboljši premik potrebuje datoteko mreže (na primer NADCON za NAD27), CivilCraft uporabi grobi objavljeni premik, pogovorno okno koordinatnega sistema pa prikaže, kako grob je (za NAD27 približno 20 m), dokler ne dodate mreže: glejte [Datoteke premika mreže](topic:coordinate-systems).

## GIS-sloji

Vsaka vrstica pod **GIS-sloji** ima:

- potrditveno polje za prikaz ali skrivanje sloja (skriti sloji tudi niso izbrani);
- svojo barvo, izbrano s seznama;
- meni (tri pike) z {{ui:Povečaj nanj}}, {{ui:Uporabi za površje…}}, {{ui:Preimenuj…}} in {{ui:Odstrani}}.

Prikaz, skrivanje, preobarvanje, preimenovanje in odstranjevanje so koraki razveljavitve. GIS-sloji se shranijo v datoteko projekta in se vrnejo ob njenem odprtju. Gredo tudi v PDF-izris načrta ter v izvoze DXF in DWG, vsak na sloj, imenovan `GIS-` in njegova številka.

## Označevanje značilnic z atributom

V meniju {{ui:Več}} sloja (tri pike v **GIS-sloji**) izberite polje pod **Označi z**: vsaka značilnica prikaže svojo vrednost na načrtu v barvi sloja. Točke so označene ob točki, črte vzdolž sredine najdaljšega dela (obrnjene, da se berejo od leve proti desni), poligoni v svojem središču. Številke prikažejo do tri decimalna mesta. Oznake so visoke 1.8 mm na papirju pri vsakem merilu in gredo v PDF-izris, DXF in DWG. Izberite **Brez oznak**, da jih odstranite; vsaka sprememba je en korak ({{key:Mod+Z}} jo razveljavi). Sloj označi največ 5,000 značilnic.

## Oglejte si značilnico

Ob vklopljenem {{ui:Izberi}} kliknite značilnico. **Lastnosti** prikažejo njen sloj, katera značilnica je, njeno obliko (dele, luknje, oglišča), njene višine, datoteko, iz katere izhaja, in koordinatni sistem te datoteke, nato vse atribute v tabeli. Atributi so samo za branje: CivilCraft prikaže podatke GIS tako, kot so bili, jih ne ureja.

Točke imajo prednost pred črtami, kadar sta obe pod kazalcem; znotraj poligona se izbere najmanjši poligon.

## Uporaba za površje

Odprite meni sloja in izberite {{ui:Uporabi za površje…}} (ali gumb v **Lastnostih**). Ponujeno je odvisno od sloja:

| Sloj | Lahko postane |
|---|---|
| Črte z višinami (3D črte) | Prelomnice na svojih višinah |
| Črte brez višin, a s številskim poljem (plastnice) | Prelomnice na višini iz polja, ki ga izberete |
| Poligoni | Meja površja (izbrani poligon, sicer največji) ali prelomnice vzdolž njihovih robov |
| Točke z višinami ali s poljem višine | Točke terena, opisane z imenom sloja, tako da tvorijo skupino točk |

Vsaka uporaba je en korak razveljavitve, ki kopira geometrijo v projekt; sam sloj ostane nespremenjen. Višine so vzete v enotah projekta.

## Datoteke točk z zemljepisno širino in dolžino

Datoteka točk, katere glava navaja stolpca **latitude** in **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), se prebere kot stopinje, ne kot sever in vzhod. Pogovorno okno uvoza to pove. Ob {{ui:Uvozi}} se točke pretvorijo v koordinatni sistem projekta; projekt brez njega vas najprej vpraša, da ga izberete. Stopinje nikoli ne postanejo feet. Vrstice zunaj ±90° zemljepisne širine ali ±180° zemljepisne dolžine so zavrnjene z razlogom. Stolpec višine je vzet, kakor je, v enotah projekta.

## Datoteke LandXML, ki navajajo koordinatni sistem

Ko odprta datoteka LandXML vsebuje element `CoordinateSystem` (kodo EPSG, opis WKT ali ime sistema), CivilCraft ga ponudi kot koordinatni sistem projekta. Če ga sprejmete, se nič ne premakne; sistem le pove, kaj številke pomenijo.

## Kaj je bilo preverjeno

- Vsak bralnik je bil primerjan z GDAL, knjižnico, ki jo večina GIS-programov uporablja za branje teh datotek, na datotekah, ki jih je zapisal GDAL: shapefile-i vseh vrst z višinami in brez, večdelne črte, poligoni z luknjami, prazne geometrije, besedilni, številski, datumski in logični atributi (true/false), besedilo UTF-8 in Windows-1252 s `.cpg` in brez njega, zip z več shapefile-i, GeoJSON z vsemi tipi geometrije ter GeoPackage s štirimi tabelami. Vsaka geometrija, višina in atribut so se ujemali.
- Položaji, pretvorjeni iz zemljepisne širine in dolžine ter iz UTM, so se ujemali s PROJ (projekcijsko knjižnico za GDAL) na 3 mm.
- Poškodovane datoteke (odrezane, z lažnimi velikostmi, slabe zip datoteke, slabi GeoPackage) dajo eno preprosto sporočilo; nič se ne zatakne.
- Nič od tega še ni bilo odprto v drugih GIS-programih; datoteke baze geopodatkov, KML in KMZ še niso prebrani (glejte [Še ni izdelano](topic:not-built-yet)).
