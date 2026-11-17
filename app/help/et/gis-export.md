---
title: Ekspordi teostusandmed GIS-i
summary: Edasta punktid, samakõrgusjooned, trassid, platsid, torud ja rajatised linna või maakonna GIS-osakonnale shapefile'idena, GeoPackage'ina, GeoJSON'ina või KML-ina projekti koordinaatsüsteemi ruudustiku koordinaatides.
keywords: gis, eksport, kml, kmz, google earth, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, torud, rajatised, utiliidid, linn, maakond, ruudustik, maapind, epsg, prj
from: bba4fea5
---

Paljud linnad ja maakonnad nõuavad projekti lõpetamisel teostusandmeid GIS-vormingus: kus torud ja rajatised asuvad, lõplikud kõrgused, tee telgjoon. **GIS › Ekspordi** kirjutab selle, mida CivilCraft hoiab, GIS-kihtidena, üks iga objektiliigi kohta.

## Enne eksportimist

1. Määra projekti koordinaatsüsteem jaotises {{ui:Koordinaadid}}. GIS-osakond peab teadma, kus arvud asuvad; ilma süsteemita kannavad failid projekti enda arve ega nimeta ühtegi süsteemi.
2. Kontrolli pinda, trasse, platse ja torustikku nii, nagu soovid need üle anda.
3. Küsi osakonnalt, mis vormingut ja millist koordinaatsüsteemi nad soovivad. Paljud nõuavad veel shapefile'e riigi tasandikukoordinaatide (state plane) tsoonis; uuemad süsteemid võtavad GeoPackage'i.

## Eksport

1. Klõpsa **GIS**-rühmas {{ui:Ekspordi}}.
2. Jaotises **Mis** märgi saadetavad liigid. Iga liik näitab, mitu objekti tal on; liigid, millel veel midagi pole, on hallid.
3. Jaotises **Vorming** vali vorming.
4. Loe märkusi koordinaatide ja ühikute kohta ning klõpsa allalaadimisnuppu. Olekurida ütleb, mis läks sisse ja milliseid väljanimesid lühendati.

Dialoogis on ka kõrgusruudustiku eksport ({{ui:Pind GeoTIFF-kõrgusruudustikuna}}); vt [Kõrgusruudustikud ja LiDAR](topic:elevation-grids-and-lidar).

## Mida iga liik sisaldab

| Liik | Kuju | Väljad |
|---|---|---|
| Mõõdistuspunktid | Kõrgustega punktid | `P` punktinumber, `N` põhjakoordinaat, `E` idakoordinaat, `Z` kõrgus, `D` kirjeldus |
| Olemasoleva maapinna ja projekteeritud pinna samakõrgusjooned | Joontena nende kõrgusel | `ELEV` |
| Murdejooned | Kõrgustega jooned | `NAME` |
| Pinna piir | Hulknurk (joonistatud piir, muidu pinna serv) | `NAME` |
| Trassid | Telgjooned | `NAME`, `LENGTH`, `STA_START`, `STA_END` (pikettid tavaliste arvudena) |
| Platsid | Hulknurgad platsi kõrgusel | `NAME`, `ELEV`, `AREA` |
| Päevavalguse jooned | Kõrgustega jooned (platsid ja koridorid) | `NAME` |
| Koridori tunnusjooned | Kõrgustega jooned: telg, sõiduraja servad, õlad | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Torud | Jooned ülemisest kuni alumise siseava kõrguseni | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (protsentides), `LENGTH`, `NETWORK` |
| Rajatised | Punktid kaane pealispinnal | `NAME`, `RIM`, `INVERT` (madalaim toru siseava seal), `SUMP`, `DIA`, `DIA_UNIT` |
| Iga GIS-kiht | Nagu imporditud | Oma väljad |

Pikkused, pikettid ja kõrgused on projekti ühikutes (USA mõõdistusjalad või meetrid). Torude ja rajatiste läbimõõdud on tollides jalgprojektide puhul ja millimeetrites meetriprojektide puhul; `DIA_UNIT` ütleb, milline.

## Vormingud

- **Shapefile**: üks `.zip`, milles on shapefile iga liigi kohta (`.shp`, `.shx`, `.dbf`), `.cpg`, mis ütleb, et tekst on UTF-8, ja `.prj`, mis nimetab koordinaatsüsteemi. Kujud kõrgustega kirjutatakse shapefile'i Z-tüüpidena. Väljanimed, mis on pikemad kui 10 märki, lühendatakse vormingu nõudel ja olekurida loetleb need.
- **GeoPackage**: üks `.gpkg`-fail, milles on tabel iga liigi kohta; koordinaatsüsteem on salvestatud oma EPSG-koodiga. Üks fail kümnete asemel, pikad väljanimed säilivad.
- **KML** või **KMZ** (zipitud KML): üks fail laiuskraadi ja pikkuskraadi väärtustega Google Earthi ja veebikaartide jaoks, kaust iga liigi kohta, iga objekt kohamärgina, mille nimi tuleb NAME-väljalt ja kõik väljad lisaandmetena; kõrgused meetrites (kõrguserežiim absolute). Nagu GeoJSON, vajab see projekti koordinaatsüsteemi.
- **GeoJSON**: üks fail laiuskraadi ja pikkuskraadi väärtustega (GeoJSON lubab ainult seda), iga objekt kannab omadust `kind` (`pipes`, `structures` jne), et vastuvõtja saaks need eraldada. Kõrgused teisendatakse meetriteks, nagu standard nõuab; need jäävad sinu projekti vertikaalsele andmestikule (CivilCraftil pole geoidi mudelit). Projekt ilma koordinaatsüsteemita ei saa GeoJSON'i eksportida ja dialoog ütleb, miks.

## Ruudustik, mitte maapind

GIS-osakonnad hoiavad oma andmeid koordinaatsüsteemi **ruudustiku** koordinaatides. Kui projekt kasutab maapinna või kohalikke koordinaate (määratud jaotises {{ui:Koordinaadid}}), teisendatakse iga koordinaat väljundis tagasi ruudustikku: failide arvud erinevad joonise omadest sinu mõõtkavateguri (ja kohaliku süsteemi puhul pöörde) võrra. Punktiväljad `N` ja `E` sisaldavad samuti ruudustiku väärtusi. Dialoog tuletab seda meelde.

:::tip
Lisa failidega lühike märkus: koordinaatsüsteem ja selle EPSG-kood, kõrguste vertikaalne andmestik, ühikud ning mida iga fail sisaldab.
:::

## Mida kontrolliti

- Iga kirjutatud faili lugesid tagasi GDAL, raamatukogu, mida enamik GIS-programme nende failide lugemiseks kasutab: iga kuju, kõrgus ja atribuut, objektide arv ning koordinaatsüsteem EPSG-koodina (`.prj` ja GeoPackage). Meie enda lugejad lugesid need samamoodi tagasi.
- GeoJSON-failid järgivad RFC 7946: pikkuskraad enne laiuskraadi, `crs`-liiget ei ole, välisrõngad vastupäeva ja augud päripäeva; positsioonid vastasid PROJ-ile 2 mm täpsusega.
- Maapinna koordinaatidega projekt eksporditi ja iga punkt kontrolliti selle ruudustiku koordinaatide vastu.
- Seda pole veel avatud teistes GIS-programmides. Kontrolli esimest edastust osakonnaga enne, kui sellele toetud.
