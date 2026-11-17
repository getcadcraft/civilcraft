---
title: Faktinių (as-built) duomenų eksportas į GIS
summary: Perduokite taškus, horizontales, trasas, aikšteles, vamzdžius ir statinius miesto ar apskrities GIS skyriui kaip shapefile, GeoPackage, GeoJSON arba KML, projekto koordinačių sistemos tinklelio koordinatėmis.
keywords: gis, eksportas, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, vamzdžiai, statiniai, komunalinės paslaugos, miestas, apskritis, tinklelis, žemė, epsg, prj
from: bba4fea5
---

Daugelis miestų ir apskričių prašo faktinių (as-built) duomenų GIS formatu, kai projektas užbaigiamas: kur nutiesti vamzdžiai ir statiniai, galutiniai nuolydžiai, kelio ašis. **GIS › Eksportuoti** įrašo tai, ką CivilCraft laiko, kaip GIS sluoksnius, po vieną kiekvienam objektų tipui.

## Prieš eksportuojant

1. Nustatykite projekto koordinačių sistemą lange {{ui:Koordinatės}}. GIS skyriui reikia žinoti, kur yra skaičiai; be sistemos failuose bus tik projekto skaičiai ir jokio pavadinimo.
2. Patikrinkite paviršių, trasas, aikšteles ir vamzdynų tinklą, kaip norite juos pateikti.
3. Paklauskite skyriaus, kokio formato ir kokios koordinačių sistemos jie nori. Daugelis dar prašo shapefile vietinėje valstybinės plokštumos zonoje; naujesnės sistemos priima GeoPackage.

## Eksportas

1. Spustelėkite {{ui:Eksportuoti}} **GIS** grupėje.
2. Skiltyje **Ką** pažymėkite tipus, kuriuos siųsti. Kiekvienas rodo, kiek objektų turi; tipai, kuriuose dar nieko nėra, pilka spalva užblokuoti.
3. Skiltyje **Kaip** pasirinkite formatą.
4. Perskaitykite pastabas apie koordinates ir vienetus, tada spustelėkite atsisiuntimo mygtuką. Būsenos eilutėje nurodoma, kas įrašyta ir kurie lauko pavadinimai sutrumpinti.

Dialogas taip pat turi aukščių tinklelio eksportą ({{ui:Paviršius kaip GeoTIFF aukščių tinklelis}}); žr. [Aukščių tinkleliai ir LiDAR](topic:elevation-grids-and-lidar).

## Ką turi kiekvienas tipas

| Tipas | Figūra | Laukai |
|---|---|---|
| Topografiniai taškai | Taškai su aukščiu | `P` taško numeris, `N` šiaurės koordinatė, `E` rytų koordinatė, `Z` aukštis, `D` aprašymas |
| Esamo reljefo horizontalės, projektuojamo paviršiaus horizontalės | Linijos jų aukštyje | `ELEV` |
| Lūžio linijos | Linijos su aukščiais | `NAME` |
| Paviršiaus riba | Poligonas (nubrėžta riba, kitu atveju paviršiaus kraštas) | `NAME` |
| Trasos | Ašys | `NAME`, `LENGTH`, `STA_START`, `STA_END` (piketai kaip paprasti skaičiai) |
| Aikštelės | Poligonai aikštelės aukštyje | `NAME`, `ELEV`, `AREA` |
| Nuolydžio sankirtos linijos | Linijos su aukščiais (aikštelių ir koridorių) | `NAME` |
| Koridoriaus charakteringos linijos | Linijos su aukščiais: ašis, važiuojamosios dalies kraštai, pakraščiai | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Vamzdžiai | Linijos nuo viršutinio iki apatinio dugno | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procentais), `LENGTH`, `NETWORK` |
| Statiniai | Taškai viršutiniame krašte | `NAME`, `RIM`, `INVERT` (žemiausias vamzdžio dugnas ten), `SUMP`, `DIA`, `DIA_UNIT` |
| Kiekvienas GIS sluoksnis | Kaip importuota | Jo paties laukai |

Ilgiai, piketai ir aukščiai pateikiami projekto vienetais (JAV apžvalgos pėdomis arba metrais). Vamzdžių ir statinių skersmenys pateikiami coliais pėdų projektams ir milimetrais metrų projektams; `DIA_UNIT` nurodo, kuris vienetas naudojamas.

## Formatai

- **Shapefile**: vienas `.zip` su shapefile kiekvienam tipui (`.shp`, `.shx`, `.dbf`), `.cpg` failas, nurodantis, kad tekstas yra UTF-8, ir `.prj`, nurodantis koordinačių sistemą. Figūros su aukščiais įrašomos kaip shapefile Z tipai. Lauko pavadinimai, ilgesni nei 10 simbolių, sutrumpinami, kaip reikalauja formatas, o būsenos eilutėje jie išvardijami.
- **GeoPackage**: vienas `.gpkg` failas su lentele kiekvienam tipui; koordinačių sistema įrašoma su savo EPSG kodu. Vienas failas vietoj daugelio, ilgi lauko pavadinimai išlaikomi.
- **KML** arba **KMZ** (suspaustas KML): vienas failas su platuma ir ilguma Google Earth ir žiniatinklio žemėlapiams, aplankas kiekvienam tipui, kiekvienas objektas – žymė, pavadinta pagal jo NAME lauką, su visais laukais kaip papildomais duomenimis; aukščiai metrais (aukščio režimas – absoliutus). Kaip ir GeoJSON, reikia projekto koordinačių sistemos.
- **GeoJSON**: vienas failas su platuma ir ilguma (GeoJSON standartas nieko kito neleidžia), kiekvienas objektas turi `kind` savybę (`pipes`, `structures`, …), kad gavėjas galėtų juos išskirstyti. Aukščiai konvertuojami į metrus, kaip reikalauja standartas; jie lieka jūsų projekto vertikaliajame datume (CivilCraft neturi geoido modelio). Projektas be koordinačių sistemos negali eksportuoti GeoJSON, o dialogas paaiškina kodėl.

## Tinklelis, o ne žemė

GIS skyriai savo duomenis laiko koordinačių sistemos **tinklelio** koordinatėmis. Jei jūsų projektas naudoja žemės arba vietines koordinates (nustatytas lange {{ui:Koordinatės}}), kiekviena koordinatė išeinant konvertuojama atgal į tinklelį: failų skaičiai skiriasi nuo plano skaičių per jūsų mastelio koeficientą (ir pasukimą, jei vietinė sistema). Taškų laukai `N` ir `E` taip pat laiko tinklelio reikšmes. Dialogas tai primena.

:::tip
Su failais išsiųskite trumpą pastabą: koordinačių sistemą ir jos EPSG kodą, aukščių vertikalųjį datumą, vienetus ir kiekvieno failo paskirtį.
:::

## Ką patikrinome

- Kiekvienas įrašytas failas buvo perskaitytas atgal GDAL, biblioteka, kurią naudoja dauguma GIS programų: kiekviena figūra, aukštis ir atributas, objektų skaičius ir koordinačių sistema kaip EPSG kodas (`.prj` ir GeoPackage). Mūsų pačių skaitytuvai juos perskaito taip pat.
- GeoJSON failai atitinka RFC 7946: pirmiausia ilguma, paskui platuma, jokio `crs` nario, išoriniai žiedai prieš laikrodžio rodyklę, skylės pagal laikrodžio rodyklę; pozicijos sutapo su PROJ iki 2 mm.
- Eksportuotas projektas su žemės koordinatėmis, ir kiekvienas taškas patikrintas pagal jo tinklelio koordinates.
- Nieko čia dar nebuvo atidaryta kitose GIS programose. Prieš pasikliaudami pirmuoju pristatymu, patikrinkite jį su skyriumi.
