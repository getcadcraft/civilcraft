---
title: Impordi GIS-andmed
summary: Too shapefile'id, GeoJSON'id ja GeoPackage'id projekti GIS-kihtidena, aseta need õige koordinaatsüsteemi kaudu, vaata nende atribuute ja kasuta neid pinna jaoks.
keywords: gis, sildid, objektide sildistamine, atribuudid joonisel, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, kihid, atribuudid, koordinaatsüsteem, epsg, laiuskraad, pikkuskraad, samakõrgusjooned, krundid, murdejooned, piir
from: f6b235cc
---

Linnade ja maakondade GIS-osakonnad jagavad asukohakonteksti GIS-failidena: krundid, servituudid, samakõrgusjooned, kommunaalvõrgud, mõõdistusalused. CivilCraft avab neist kolme liiki **GIS-kihtidena**, mis asuvad sinu kujunduse all joonisel.

| Fail | Mida avada |
|---|---|
| Shapefile | `.shp` koos selle `.shx`, `.dbf`, `.prj` ja `.cpg`-ga (vali kõik), või `.zip`, milles nad tulid. Zip, milles on mitu shapefile'i, annab mitu kihti. |
| GeoJSON | `.geojson`-fail (sobib ka `.json`-fail, mille esimesed read ütlevad `FeatureCollection` või `Feature`). |
| GeoPackage | `.gpkg`-fail. Kõik selles olevad objektitabelid kuvatakse loendis. |
| KML või KMZ | `.kml`-fail (Google Earthist või veebikaardilt) või zipitud `.kmz`. Iga kaust muutub kihiks (jagatakse punktideks, joonteks ja hulknurkadeks, kui sisaldab mitut liiki); kohamärgi nimi, kirjeldus ja lisaandmed muutuvad tema atribuutideks. Kõrgused on meetrites, laiuskraad ja pikkuskraad nagu GeoJSON'is. |

Loetakse punktid, mitmikpunktid, jooned, aukudega hulknurgad ja mitmeosalised kujud koos kõrgustega (z), kui fail neid sisaldab. Mõõteväärtused (M) jäetakse välja. Kõrgusruudustikud ja LiDAR avanevad samamoodi: vt [Kõrgusruudustikud ja LiDAR](topic:elevation-grids-and-lidar).

## Failide avamine

1. Klõpsa **GIS**-rühmas {{ui:Impordi}} (või {{ui:Ava}}), vali failid või lohista need joonisele. Failid loetakse sellest arvutist; midagi ei laadita üles.
2. Dialoog **Impordi GIS-andmed** loetleb iga leitud kihi: selle liigi, objektide arvu (ja mitu neist on ilma geomeetriata), atribuutväljade arvu ja faili nimetatud koordinaatsüsteemi. Eemalda märkeruut kihtidelt, mida ei soovi.
3. Loe osa **Koordinaatsüsteem** (allpool) ja rida **Mis juhtub**, seejärel klõpsa {{ui:Impordi}}.
4. Kihid ilmuvad joonisele ja vasakpoolsesse paneeli jaotisesse **GIS-kihid**. Import on üks samm: {{key:Mod+Z}} võtab selle tagasi.

Suure faili korral näidatakse joonise kohal edenemisriba koos nupuga {{ui:Loobu}}.

## Koordinaatsüsteem

GIS-failid ütlevad, kus nad asuvad, koordinaatsüsteemi kaudu (shapefile'i `.prj`, GeoPackage'i ruumilise viite tabel; GeoJSON on alati laiuskraad ja pikkuskraad). CivilCraft teisendab iga kihi selle enda süsteemist projekti süsteemi. See ei oleta kunagi:

- **Projektil on koordinaatsüsteem** (määratud jaotises {{ui:Koordinaadid}}): iga kiht, millel on oma süsteem, teisendatakse sellesse, sealhulgas maapinna või kohaliku korrektsiooni. Fail ilma `.prj`-ta saab kaks valikut: **Sama mis projekt** (tema arvud laaditakse nagu on) või **Vali faili süsteem**.
- **Projektil pole koordinaatsüsteemi ja fail on projektsioonisüsteemis, mille ühikud on sinu projekti omad** (näiteks riigi tasandikukoordinaatide tsoon USA mõõdistusjalgades jalgprojekti jaoks): dialoog pakub **Kasuta seda süsteemi projekti koordinaatsüsteemina**. See määratakse samas tagasivõtmise sammus kui import. Projektis miski ei liigu; süsteem ütleb ainult, mida arvud tähendavad. Võid selle asemel valida projektile teise süsteemi, ja kihid teisendatakse sellesse.
- **Projektil pole koordinaatsüsteemi ja fail on laiuskraadi ja pikkuskraadi süsteemis** (iga GeoJSON) **või muudes ühikutes**: {{ui:Impordi}} jääb hallilt keelatuks, kuni valid projekti koordinaatsüsteemi. Valija algab andmete lähedalt.
- **Ei projekt ega failid ei nimeta süsteemi**: arvud laaditakse nagu on ja dialoog ütleb seda.

Kõrgused teisendatakse samuti: GeoJSON-i kõrgused on meetrites (GeoJSON-standard ütleb nii); teiste failide kõrgused võetakse nende enda süsteemi ühikus.

:::warning
GeoJSON-faili positsioonid väljaspool ±180° pikkuskraadi või ±90° laiuskraadi ei ole laiuskraad ja pikkuskraad. Need objektid jäetakse välja ja dialoog ütleb, mitu neid oli. Selline fail on tavaliselt projektsioonifail, mis salvestati ilma oma süsteemita; küsi see uuesti või shapefile koos `.prj`-ga.
:::

NAD83 käsitletakse nagu WGS 84 (süsteem, mida GeoJSON kasutab); need erinevad Põhja-Ameerikas mõne meetri võrra, nii et GeoJSON-andmed võivad olla sama palju nihkes. Kui parim nihe vajab ruudustikufaili (näiteks NADCON NAD27 jaoks), kasutab CivilCraft lihtsamat avaldatud nihet ja koordinaatsüsteemi dialoog näitab, kui ligikaudne see on (NAD27 puhul umbes 20 m), kuni lisad ruudustikufaili: vt [Ruudustiku nihkefailid](topic:coordinate-systems).

## GIS-kihid

Iga rida jaotises **GIS-kihid** sisaldab:

- märkeruutu kihi näitamiseks või peitmiseks (peidetud kihte ei valita samuti);
- selle värvi, valitud loendist;
- menüüd (kolm punkti) valikutega {{ui:Suumi sellele}}, {{ui:Kasuta pinna jaoks…}}, {{ui:Nimeta ümber…}} ja {{ui:Eemalda}}.

Näitamine, peitmine, uuesti värvimine, ümbernimetamine ja eemaldamine on tagasivõtmise sammud. GIS-kihid salvestatakse projektifaili ja tulevad tagasi, kui projekti avad. Need lähevad ka joonise PDF-plotti ning DXF- ja DWG-ekspordiga, igaüks kihil nimega `GIS-` ja selle number.

## Sildista objektid atribuudi järgi

Kihi menüüs {{ui:Veel}} (kolm punkti jaotises **GIS-kihid**) vali väli jaotises **Sildista väljaga**: iga objekt näitab oma väärtust joonisel kihi värvis. Punktid sildistatakse punkti kõrval, jooned pikima osa keskel (pööratud nii, et lugeda saaks vasakult paremale), hulknurgad keskel. Arvud kuvatakse kuni kolme kümnendkohaga. Sildid on paberil igas mõõtkavas 1.8 mm kõrged ja lähevad PDF-plotti, DXF-i ja DWG-sse. Vali **Sildeid pole**, et need eemaldada; iga muudatus on üks samm ({{key:Mod+Z}} võtab selle tagasi). Kiht sildistab kuni 5,000 objekti.

## Vaata objekti

Kui {{ui:Vali}} on sisse lülitatud, klõpsa objekti. **Omadused** näitavad selle kihti, millist objekti see on, selle kuju (osad, augud, tipud), kõrgusi, faili, millest see tuli, ja selle faili koordinaatsüsteemi, seejärel iga atribuudi tabelis. Atribuudid on ainult lugemiseks: CivilCraft näitab GIS-andmeid nii, nagu need tulid; ta ei muuda neid.

Kui kursori all on nii punkt kui ka joon, võidab punkt; hulknurga sees valitakse väikseim hulknurk.

## Kasuta pinna jaoks

Ava kihi menüü ja vali {{ui:Kasuta pinna jaoks…}} (või nupp jaotises **Omadused**). Pakutav sõltub kihist:

| Kiht | Võib saada |
|---|---|
| Kõrgustega jooned (3D-jooned) | Murdejooned nende enda kõrgustel |
| Kõrguseta jooned, kuid arvväljaga (samakõrgusjooned) | Murdejooned kõrgusel väljast, mille valid |
| Hulknurgad | Pinna piir (valitud hulknurk, muidu suurim) või murdejooned mööda nende servi |
| Kõrgustega punktid või kõrgusväljaga punktid | Mõõdistuspunktid, kirjeldatud kihi nimega, et moodustada punktirühm |

Iga kasutus on üks tagasivõtmise samm, mis kopeerib geomeetria projekti; kiht ise jääb samaks. Kõrgused võetakse projekti ühikutes.

## Punktifailid laiuskraadi ja pikkuskraadiga

Punktifail, mille päises on veerud **latitude** ja **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), loetakse kraadidena, mitte põhja- ja idakoordinaatidena. Importimise dialoog ütleb seda. Kui valid {{ui:Impordi}}, teisendatakse punktid projekti koordinaatsüsteemi; projekt ilma süsteemita palub enne selle valimist. Kraade ei laadita kunagi jalgadena. Read, mis jäävad väljapoole ±90° laiuskraadi või ±180° pikkuskraadi, lükatakse tagasi koos põhjendusega. Kõrguse veerg võetakse nagu on, projekti ühikutes.

## LandXML-failid, mis nimetavad koordinaatsüsteemi

Kui avatud LandXML-failis on element `CoordinateSystem` (EPSG-kood, WKT-kirjeldus või süsteemi nimi), pakub CivilCraft seda projekti koordinaatsüsteemina. Midagi ei liigu, kui nõustud; süsteem ütleb ainult, mida arvud tähendavad.

## Mida kontrolliti

- Iga lugejat võrreldi GDAL-iga, raamatukoguga, mida enamik GIS-programme nende failide lugemiseks kasutab, failidel, mille kirjutas GDAL: shapefile'id igat liiki, kõrgustega ja ilma, mitmeosalised jooned, aukudega hulknurgad, tühjad geomeetriad, tekst-, arv-, kuupäeva- ja tõeväärtusatribuudid, UTF-8 ja Windows-1252 tekst koos `.cpg`-ga ja ilma, mitme shapefile'i zip, GeoJSON iga geomeetriatüübiga ja GeoPackage nelja tabeliga. Iga geomeetria, kõrgus ja atribuut ühtisid.
- Laiuskraadist ja pikkuskraadist ning UTM-ist teisendatud positsioonid ühtisid PROJ-iga (projektsioonide raamatukogu, GDAL-i taga) 3 mm täpsusega.
- Kahjustatud failid (katkised, valede suurustega, rikkis zipid, rikkis GeoPackage'id) annavad ühe lihtsa teate; miski ei jää rippuma.
- Seda pole veel avatud teistes GIS-programmides; failigeodatabaase, KML-i ja KMZ-d ei loeta veel (vt [Veel pole valmis](topic:not-built-yet)).
