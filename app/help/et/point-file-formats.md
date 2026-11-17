---
title: Punktifailide vormingud
summary: Veergude järjekord, mida CivilCraft loeb, kuidas ta leiab eraldaja ja päiserea, millised päisenimed ta tunneb ning kuidas ridu kontrollitakse.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, punktifaili vorming, veerud, päis, eraldaja
from: 84fab42e
---

Punktifail on lihtsa tekstina, üks punkt real. CivilCraft loeb seda brauseris; midagi ei laadita üles.

## Veergude järjekord

Tähed nimetavad veerud vasakult paremale: **P** punkti number või nimi, **N** põhjakoordinaat, **E** idakoordinaat, **Z** kõrgus, **D** kirjeldus.

| Järjekord | Veerud | Näiderida |
|---|---|---|
| PNEZD | punkt, põhjakoordinaat, idakoordinaat, kõrgus, kirjeldus | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkt, idakoordinaat, põhjakoordinaat, kõrgus, kirjeldus | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkt, põhjakoordinaat, idakoordinaat, kõrgus | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkt, idakoordinaat, põhjakoordinaat, kõrgus | `101,6150000.00,2080000.00,250.00` |
| NEZD | põhjakoordinaat, idakoordinaat, kõrgus, kirjeldus | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | idakoordinaat, põhjakoordinaat, kõrgus, kirjeldus | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | põhjakoordinaat, idakoordinaat, kõrgus | `2080000.00 6150000.00 250.00` |
| ENZ | idakoordinaat, põhjakoordinaat, kõrgus | `6150000.00 2080000.00 250.00` |

Järjekordades ilma P-ta nummerdatakse punktid 1, 2, 3 … failis oleva järjekorra järgi. X on idakoordinaat ja Y on põhjakoordinaat.

## Eraldajad

CivilCraft vaatab esimesi 20 rida ja valib esimese neist, mis esineb vähemalt 60% nendest: koma, tabulaator, semikoolon. Muidu jaotab ta tühikute jadade järgi.

- Komaga, tabulaatoriga ja semikoolonitega failides võib jutumärkides väli sisaldada eraldajat (`"FL, NORTH"`) ning `""` jutumärkide sees on üks jutumärk.
- Tühikutega eraldatud failides võib rea lõpus olev kirjeldus sisaldada tühikuid: kõik pärast viimast koordinaatveergu on kirjeldus.
- Read, mis algavad märgiga `#`, `;` või `//`, ja tühjad read jäetakse vahele.
- Faili alguses olev baitide järjestuse märk (BOM) ignoreeritakse.

## Päiserida

Esimest rida käsitletakse päisena, kui vähem kui kaks selle väljast on arvud. Kui iga päise väli on nimi, mille CivilCraft tunneb ära, tuleb veergude järjekord sellest („päisereast“). Nimed sobitatakse suur- ja väiketähtede, tühikute, punktide, allkriipsude, kriipsude ja sulgude suhtes ükskõiksena:

| Veerg | Tunnustatud nimed |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Kui mõni päisenimi pole tunnustatud või nimed ei moodusta ühte kaheksast järjekorrast, jäetakse päis vahele ja järjekord arvatakse veergude arvu järgi.

:::warning
Päis, mis nimetab nii laiuskraadi veeru (`lat`, `latitude`) kui ka pikkuskraadi veeru (`lon`, `long`, `longitude`), loetakse kraadidena, mitte põhja- ja idakoordinaadina. Kui {{ui:Impordi}}-l punktid teisendatakse läbi projekti koordinaatsüsteemi ja projektil seda pole, küsib programm enne valida. Vahemikust väljaspool ±90° laiuskraadi või ±180° pikkuskraadi read lükatakse tagasi. Vaata [GIS-andmete importimine](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Arvamine veergude arvu järgi

Kui kasutatavat päist pole ja **Veerud** on jäetud väärtusele {{ui:Tuvasta}}:

- 5 või enam veergu: PNEZD.
- 4 veergu: PNEZ, kui esimene veerg on iga proovitud rea puhul täisarv ja neljas on arv; muidu NEZD.
- 3 veergu: NEZ.

PNEZD ja PENZD arvudest ei eristu. Arvamine järgib jaotises [CivilCraft'i sätted](topic:settings) olevat **Punktiridu**: P, N, E, Z, D algusest peale või P, E, N, Z, D (siis loetakse neli veergu kui PENZ ja kolm kui ENZ). Dialoogis on tekst „arvatud veergude arvu järgi – kontrolli, et põhja- ja idakoordinaate pole vahetatud“. Kui eelvaade tundub vale, vali õige järjekord jaotises **Veerud**.

## Kuidas ridu kontrollitakse

- Rida võib kirjelduse ära jätta.
- Põhja- ja idakoordinaat peavad olema arvud. Kõrgus võib olla tühi (punkt jäetakse alles, kuid pinnas seda ei kasuta).
- Punkti number võib olla mis tahes tekst (ka tähed, näiteks `CP1`), kuid mitte tühi.
- Kui punkti number kordub, jäetakse esimene rida alles ja teised loetakse loetamata nimekirjas.
- Kirjeldused säilitatakse kuni 200 tähemärki; juhtmärgid muudetakse tühikuteks.
- Kuni 200 loetamata rida hoitakse dialoogi jaoks (näidatakse 25), ja kõik loendatakse.

## Punktigrupid

Punkti grupp on tema kirjelduse esimene sõna suurtähtedes. „GRD“, „grd shot“ ja „Grd“ on kõik grupis GRD. Punkt ilma kirjelduseta on grupis „(kirjeldus puudub)“. Vaata [Mõõdistuspunktide importimine](topic:import-points).

## Punktide kirjutamine

CivilCraft ei ekspordi veel punktitekstifaili. Punktid lähevad välja LandXML-is (CgPoints-ina), projektifailis ja GIS-i {{ui:Ekspordi}} kaudu shapefile-, GeoPackage- või GeoJSON-vormingus väljadega P, N, E, Z ja D ([Ekspordi as-built-andmed GIS-i](topic:gis-export)). Vaata [Pole veel valmis](topic:not-built-yet).
