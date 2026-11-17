---
title: Izvoz podatkov o stanju po izvedbi za GIS
summary: Predajte točke terena, plastnice, trase, ploščadi, cevi in objekte oddelku GIS mesta ali okraja v shapefile, GeoPackage, GeoJSON ali KML, v mrežnih koordinatah koordinatnega sistema projekta.
keywords: gis, izvoz, kml, kmz, google earth, po izvedbi, shapefile, shp, zip, geopackage, gpkg, geojson, cevi, objekti, komunalna omrežja, mesto, okraj, mreža, tla, epsg, prj
from: bba4fea5
---

Mnoga mesta in okraji ob zaključku projekta zahtevajo podatke o stanju po izvedbi v GIS-formatu: kje so šle cevi in objekti, končni nakloni, osrednja črta ceste. **GIS › Izvoz** zapiše, kar ima CivilCraft, kot GIS-sloje, po enega za vsako vrsto objekta.

## Preden izvozite

1. Nastavite koordinatni sistem projekta v {{ui:Koordinate}}. Oddelek GIS mora vedeti, kje so številke; brez sistema datoteke nosijo lastne številke projekta in ne navajajo nobenega.
2. Preverite površje, trase, ploščadi in cevno omrežje, kot jih želite predati.
3. Vprašajte oddelek, v kateri obliki in katerem koordinatnem sistemu želijo. Mnogi še vedno zahtevajo shapefile v lokalni coni državne ravnine; novejši sistemi sprejemajo GeoPackage.

## Izvoz

1. Kliknite {{ui:Izvoz}} v skupini **GIS**.
2. Pod **Kaj** označite vrste za pošiljanje. Vsaka prikazuje, koliko značilnic ima; vrste brez vsebine so zatemnjene.
3. Pod **Kot** izberite obliko.
4. Preberite opombe o koordinatah in enotah, nato kliknite gumb za prenos. Vrstica stanja pove, kaj je šlo ven, in katera imena polj so bila skrajšana.

Pogovorno okno vsebuje tudi izvoz mreže višin ({{ui:Površje kot višinska mreža GeoTIFF}}); glejte [Mreže višin in LiDAR](topic:elevation-grids-and-lidar).

## Kaj hrani vsaka vrsta

| Vrsta | Oblika | Polja |
|---|---|---|
| Točke terena | Točke z višino | `P` številka točke, `N` severna, `E` vzhodna, `Z` višina, `D` opis |
| Plastnice obstoječega terena, izravnanega površja | Črte na svoji višini | `ELEV` |
| Prelomnice | Črte z višinami | `NAME` |
| Meja površja | Poligon (narisana meja, sicer rob površja) | `NAME` |
| Trase | Osrednje črte | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stacionaže kot navadna števila) |
| Ploščadi | Poligoni na višini ploščadi | `NAME`, `ELEV`, `AREA` |
| Linije preseka s terenom | Črte z višinami (ploščadi in koridorji) | `NAME` |
| Značilne črte koridorja | Črte z višinami: os, robovi vozišča, bankine | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Cevi | Črte od zgornjega do spodnjega dna | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (odstotek), `LENGTH`, `NETWORK` |
| Objekti | Točke na robu pokrova | `NAME`, `RIM`, `INVERT` (najnižje dno cevi tam), `SUMP`, `DIA`, `DIA_UNIT` |
| Vsak GIS-sloj | Kot je bil uvožen | Lastna polja |

Dolžine, stacionaže in višine so v enotah projekta (US survey feet ali metri). Premeri cevi in objektov so v palcih (in) za projekte v feet in v milimetrih (mm) za projekte v metrih; `DIA_UNIT` pove, katere.

## Formati

- **Shapefile**: ena `.zip` datoteka s shapefile-om za vsako vrsto (`.shp`, `.shx`, `.dbf`), datoteka `.cpg`, ki pove, da je besedilo v UTF-8, in `.prj`, ki navaja koordinatni sistem. Oblike z višinami so zapisane kot Z-tipi shapefile-a. Imena polj, daljša od 10 znakov, so skrajšana, kot zahteva format, vrstica stanja pa jih našteje.
- **GeoPackage**: ena datoteka `.gpkg` s tabelo za vsako vrsto; koordinatni sistem je shranjen s kodo EPSG. Ena datoteka namesto več, dolga imena polj ostanejo.
- **KML** ali **KMZ** (KML, stisnjen v zip): ena datoteka z zemljepisno širino in dolžino za Google Earth in spletne zemljevide, mapa za vsako vrsto, vsaka značilnica je oznaka, poimenovana po polju NAME, z vsemi polji kot razširjenimi podatki; višine v metrih (način višine absolute). Tako kot GeoJSON potrebuje koordinatni sistem projekta.
- **GeoJSON**: ena datoteka z zemljepisno širino in dolžino (standard GeoJSON ne dopušča drugega), vsaka značilnica ima lastnost `kind` (`pipes`, `structures`, …), da jo prejemnik lahko razdeli. Višine so pretvorjene v metre, kot zahteva standard; ostanejo na navpičnem datumu vašega projekta (CivilCraft nima modela geoida). Projekt brez koordinatnega sistema ne more izvoziti GeoJSON, pogovorno okno pa pove, zakaj.

## Mreža, ne tla

Oddelki GIS hranijo podatke v **mrežnih** koordinatah koordinatnega sistema. Če vaš projekt uporablja koordinate tal ali lokalne koordinate (nastavljene v {{ui:Koordinate}}), se vsaka koordinata ob izvozu pretvori nazaj v mrežo: številke v datotekah se od številk na načrtu razlikujejo za vaš faktor merila (in za zasuk pri lokalnem sistemu). Točkovni polji `N` in `E` vsebujeta tudi mrežne vrednosti. Pogovorno okno vas na to opomni.

:::tip
Datotekam priložite kratko opombo: koordinatni sistem in njegovo kodo EPSG, navpični datum vaših višin, enote in to, kaj je vsaka datoteka.
:::

## Kaj je bilo preverjeno

- Vsaka zapisana datoteka je bila prebrana nazaj z GDAL, knjižnico, ki jo večina GIS-programov uporablja za branje teh datotek: vsaka oblika, višina in atribut, števila značilnic ter koordinatni sistem kot koda EPSG (`.prj` in GeoPackage). Naši lastni bralniki jih berejo enako.
- Datoteke GeoJSON sledijo RFC 7946: najprej zemljepisna dolžina, nato širina, brez člana `crs`, zunanji obroči v nasprotni smeri urnega kazalca in luknje v smeri urnega kazalca; položaji se ujemajo s PROJ na 2 mm.
- Projekt s koordinatami tal je bil izvožen, vsaka točka pa preverjena glede na njene mrežne koordinate.
- Nič od tega še ni bilo odprto v drugih GIS-programih. Prvo oddajo preverite z oddelkom, preden se nanjo zanesete.
