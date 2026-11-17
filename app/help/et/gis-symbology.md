---
title: Kihi värvimine atribuudi järgi
summary: Värvi GIS-kihi objektid välja väärtuste järgi (üks värv väärtuse kohta või arvuvahemike järgi), suurenda punkte arvu järgi, tooni hulknurki ja näita joonisel legendi.
keywords: sümboolika, stiil, värv, liigitatud, graduaalne, unikaalsed väärtused, võrdne intervall, kvantiil, looduslikud piirid, jenks, gradient, värvipimedus, legend, suurus, punktid, koropleet, klassid, gis
from: a3a69add
---

Ava kihi **kolme punkti** menüü GIS-kihtide loendis ja vali {{ui:Stiil atribuudi järgi…}}.

## Kolm stiili

- **Üksik sümbol:** kihi värv, nagu varem.
- **Liigitatud:** üks värv iga erineva väärtuse kohta mis tahes väljal. Kuni kaheksa väärtust saavad kaheksa Okabe-Ito värvi (valitud nii, et need jääksid eristatavaks levinumate värvipimeduse liikide puhul); rohkemate väärtuste korral saavad seitse kõige sagedamat oma värvi ja ülejäänud jagavad hallit klassi **Muu**. Väärtuseta objektid on hallid.
- **Graduaalne:** arvuväli jagatakse 2 kuni 9 vahemikuks, igaühel värv gradientskaalalt. Piirile langev väärtus läheb alumisse vahemikku.

## Kuidas vahemikud lõigatakse

| Meetod | Piirid |
|---|---|
| Võrdne intervall | Vahemik vähimast kuni suurimast väärtuseni jagatakse võrdse laiusega. Väärtused 0 kuni 30 kolmes vahemikus: 0, 10, 20, 30. |
| Kvantiil | Umbes sama palju objekte igas vahemikus. Piirid loetakse sorteeritud väärtustest tavalise sirgjoonelise interpolatsiooniga: 1 kuni 10 kahes vahemikus on piir 5.5. |
| Looduslikud piirid (Jenks) | Lõiked, mis jätavad iga vahemiku sees kõige vähem hajumist, nii et sarnaste väärtuste kobarad jäävad kokku. Rohkem kui 1,500 väärtuse korral töötab see 1,500 ühtlaselt jaotatud väärtusega ja ütleb seda. |

## Värvid

Viridis ja Cividis lähevad tumedast heledani, heledus muutub ühtlaselt, nii et vahemike järjekord on loetav isegi hallil või värvipimedusega. Blues on helest tumedani. Punasest siniseni on kaheosaline gradient väärtuste jaoks keskmise ümber. **Pööra värvid ümber** pöörab mis tahes neist. Dialoog loetleb vahemikud ja iga vahemiku objektide arvu enne rakendamist.

## Suurus, täidis ja legend

- **Punkti suurus** arvuväljaga muudab iga punkti ruudu suuremaks, mida suurem on väärtus, kahe sinu antud suuruse vahel (pool küljest, millimeetrites paberil).
- **Hulknurkade sisemuse toonimine** täidab iga hulknurga tema klassi värviga (augud jäävad tühjaks). Toon on ekraanil; plotid ning DXF/DWG näitavad värvitud piirjooni.
- **Näita legendi joonisel** joonistab klassid, nende arvud ja suuruste vahemiku joonise vasakule alla. Legend on ekraanil; see ei ole plotis.
- Objektide sildistamiseks väljaga kasuta **Sildista väljaga** samas menüüs.

Stiil salvestatakse projektifaili. Versioon, mis stiile ei tunne, avab faili kihi värviga. Plotid, DXF ja DWG kannavad klasse eraldi kihtidena, mis on nimetatud kihi ja klassi järgi, üheksast põhilisest CAD-värvist lähima järgi. Kiht, millel on üle 200,000 objekti, joonistatakse ühe värviga.
