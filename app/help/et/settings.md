---
title: CivilCraft'i sätted
summary: Vali kopeeritud ja kleebitud punktirea veergude järjestus ning failide veergude äraarvamine, kuidas kleebitud punktid nummerdatakse, mida punktisildid näitavad, nurgaindikaator, 3D vertikaalne liialdus, kuidas laius- ja pikkuskraadid kuvatakse ning kas kaardikihid tulevad internetist.
keywords: sätted, eelistused, PNEZD, PENZD, veergude järjekord, punktiread, nummerdus, punktinumbrid, algnumber, punktisildid, sildid, kirjeldus, kõrgus, vaatekuup, teljeikoon, nurgaindikaator, kompass, vertikaalne liialdus, 3D, laiuskraad, pikkuskraad, kraad minut sekund, kümnendkraad, kaardikihid, internet, privaatsus
from: 64b9cb92
---

Ava {{ui:Settings}} rakenduse ribal oleva hammasrattaga või klahvikombinatsiooniga {{key:Mod+,}}. Esimene kaart, {{ui:CivilCraft}}, hoiab seda rakendust puudutavaid sätteid; {{ui:General}} hoiab neid, mida jagavad kõik CadCraft'i rakendused (teema, tööriistariba, paneelid). CivilCraft'i sätted kehtivad ainult selles rakenduses: muudad need siin ja see brauser mäletab neid. {{ui:Reset CivilCraft settings}} seab kõik CivilCraft'i sätted algseisu.

## Punktiread

**P, N, E, Z, D** (algus) või **P, E, N, Z, D**: punkt, põhjakoordinaat, idakoordinaat, kõrgus, kirjeldus või ida enne põhja. Seda kasutatakse kolmes kohas:

- **Kopeeri**: read, mille CivilCraft paneb süsteemi lõikelauale tabelarvutuse jaoks.
- **Kleebi**: read, mis on kleebitud tabelarvutusest või tekstifailist ja millel ei ole päisrida.
- **Impordi**: oletus dialoogis **Impordi punktid**, kui failil ei ole päisrida (nelja veeruga fail loetakse PENZ-ina, kolme veeruga ENZ-ina). Vt [Punktifailide vormingud](topic:point-file-formats).

Päisrida, mis nimetab oma veerud, võidab alati, nagu ka valik impordi dialoogi loendis **Veerud**.

## Kleebitud punktide numbrid

- **Säilita vabad numbrid** (algus): kleebitud punkt säilitab oma numbri, kui ükski punkt seda ei kasuta; ainult konfliktsed punktid saavad uue numbri.
- **Alati uued numbrid**: iga kleebitud punkt saab uue numbri, isegi kui tema oma on vaba.

**Uued numbrid algavad**: jäta tühjaks, et lugeda edasi ühe võrra kasutuses olevast suurimast numbrist. Sisesta number, näiteks 5000, et anda uutele punktidele numbrid alates 5000; juba kasutuses olevad numbrid jäetakse vahele. Kaks punkti ei jaga kumbagi režiimi korral kunagi sama numbrit. Vt [Mõõdistuspunktide valimine, kopeerimine ja kleepimine](topic:copy-paste-points#point-numbers-never-clash).

## Punktisildid

Mida punktisilt näitab, kui {{ui:Point labels}} on jaotises **Kuva** sisse lülitatud: **Number**, **Number ja kõrgus** või **Number, kõrgus ja kirjeldus** (algus). DXF-, DWG- ja PDF-eksport näitavad samu silte, mis ekraanil.

## Nurgaindikaator

Mis asub plaani ja 3D-vaate nurgas: **Vaatekuup** (algus), **Teljeikoon** või **Puudub**.

- **Vaatekuup** (paremal üleval). Plaanil näitab see ülaosa koos kompassirõngaga: N on võrgu põhi (plaanil üles). Klõpsa mis tahes teisel kuubi küljel, servas või nurgas või lohista seda ja [3D-vaade](topic:site-3d) avaneb sealt vaadates. {{ui:Home}} plaani kuubil sobitab plaani.
- 3D-vaates pöörleb kuup koos vaatega: klõpsa küljel, servas või nurgas, et sealt vaadata, lohista kuupi, et orbiteerida, lohista kompassirõngast, et pöörata ala vertikaali ümber, klõpsa tähel, et vaadata sellelt küljelt, ja kasuta {{ui:Home}}, et saada kogu ala isovaade. Otse küljele vaadates viivad väikesed nooled järgmisele küljele ja kõverad nooled pööravad vaadet veerandpöörde võrra.
- **Teljeikoon** (vasakul all): väike X (ida) ja Y (põhi) märgis plaanil, X, Y ja Z (üles) 3D-vaates.

## 3D vertikaalne liialdus

Kui palju 3D-vaade venitab kõrgusi: **1×**, **2×** (algus), **3×**, **5×** või **10×**. 3D-vaate ribal olev loend on sama säte, nii et ühe muutmine muudab mõlemat. Mahud, profiilid ja 3D-eksport jäävad tõelisse mõõtkavasse.

## Laiuskraad ja pikkuskraad

Kuidas olekuriba näitab kursori laiuskraadi ja pikkuskraadi, kui projektil on koordinaatsüsteem: **kraad, minut ja sekund** (algus, näiteks `30°18′00.00″ N`) või **kümnendkraad** (`30.300000° N`). Vt [Projekti koordinaatsüsteemi määramine](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kaardikihid internetist

**Väljas** (algus) või **Sees**. Kui sisse lülitatud, küsib CivilCraft sinu lisatud kaardiservereilt ekraanil oleva ala pilte. Su joonis jääb sellesse arvutisse; server näeb ala ja sinu internetiaadressi. Kui see on väljas, ei küsita ühegi kaardiserveri käest midagi, isegi kui avatud projekt seda nimetab; georefereeritud pilt failist töötab mõlemal juhul. Vt [Kaardikihtide näitamine plaani all](topic:map-layers).

## Assistendid

**Luba AI-assistentidel ja skriptidel kasutada CivilCraft'i** (algul väljas) lubab sinu arvutis asuval assistendil pääseda avatud alale CadCraft Studio kaudu: **Loe** kirjeldab ala ja annab punkte, pinnakõrgusi, pikette, profiile, mahud ja krundid; **Muuda** lubab tal valida ja lisada mõõdistuspunkte; **Salvesta** ja **Ekspordi** lubavad salvestada projekti ning kirjutada LandXML-i või DWG-d. **Kaustad, mida ta võib kasutada** (Studios) on kohad, kuhu ta võib salvestada ja eksportida. **Tegevus** loetleb tema kutsed. Vt [Lase AI-assistendil sinu alaga töötada](topic:assistants).
