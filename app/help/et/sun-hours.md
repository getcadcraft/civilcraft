---
title: Arvuta päikesetunnid alal
summary: Vali päev (või hooaeg) ja ajavöönd ning vaata otsese päikese tunde iga hoonemahu iga seina ja nende ümber oleval maapinnal. Maapind on joonistatud plaanile ja numbrid laetakse alla CSV-na.
keywords: päike, päikesetunnid, vari, varjutus, päikese kättesaadavus, päevavalguse tunnid, fassaad, sein, hooaeg, pööripäev, võrdpäevsus, ajavöönd, suveaeg, laiuskraad, pikkuskraad, CSV, rastrandmed
from: 4e32a314
---

**Päikesetunnid** loeb otsese päikese tunde, mis jõuavad iga hoonemahu igale seinale ning nende ümber olevale maapinnale, valitud päeval või hooaja keskmisena. Mahud ja maapind ise heidavad varju; midagi muud ei heida (puid ega naabrihooneid, mida sa pole joonistanud). Taevavalgust, mis ei ole otsene päike, ei arvestata.

## Enne alustamist

Päikese asukoht tuleneb ala laiuskraadist ja pikkuskraadist, mis tulevad projekti **koordinaatsüsteemist**. Ilma koordinaatsüsteemita projekti ei lubata ja kuvatakse teade: määra see kõigepealt (**Koordinaadid** GIS-rühmas). Käsitsi sisestatud laiuskraad ja pikkuskraad oleksid oletus, seetõttu neile väljale ei ole kasti.

## Arvuta

**Omadustes** jaotises **Hoonemahud**, **Päikesetunnid**:

1. Vali **Päev**. See algab päevaga, mil päike on sinu asukohas madalaim (21. detsember või lõunapoolkeral 21. juuni). Hooaja jaoks märgi **Üle hooaja**, vali **Viimane päev** ning mitme päeva kaupa proovida.
2. Sisesta **Ajavöönd**: nimi, nagu `America/Mexico_City`, või UTC-nihe, nagu `-6`. Nimi järgib selle vööndi suveaja reegleid sellel päeval; sisestatud nihet kasutatakse täpselt nii, nagu sisestatud, seega kasuta sellel päeval kehtivat. Kasti all olev rida ütleb, millise nihke leidis.
3. Vali, kui tihti päikest paigutada (iga 5, 10, 15 või 30 minuti järel), seejärel **Arvuta päikesetunnid**. Hooaeg töötab taustatöötajates; **Peata** katkestab selle.

## Mida saad

- Tabel mahu kaupa: **halvim sein**, **keskmine** ja **parim sein** tundides päevas ning tabel kõigist seintest koos suunaga, millele nad on suunatud, ja tundidega korruste kaupa.
- Maapind mahtude ümber joonistatakse plaanile tumedast (päikest pole) kollaseni (kõige rohkem, mida mis tahes ruut saab), koos selgitusega. Mahu all olevad ruudud jäetakse tühjaks. **Kuva maapind plaanil** lülitab selle välja.
- **Seinad CSV-na** ja **Maapind CSV-na** salvestavad arvud.

Hooaja puhul on näitajad proovitud päevade keskmine päevas. Projektis midagi ei salvestata: tulemus on vaatamiseks ja uuesti käivitamine loob selle uuesti.

## Hea teada

- Sein loeb hetke päikeselisena ainult siis, kui see on päikese poole ja midagi ei ole teel. Päikesest eemale suunatud sein ei saa midagi.
- Maapinda proovitakse ruudustikul, mis sõltub ala suurusest, ja päikese asukohta iga ajasammu keskel, seega on tunnid õiged umbes valitud sammu täpsusega.
- Päikese asukoht on avaldatud astronoomiline valem, mis on täpne umbes ühe kaareminuti jaoks.
