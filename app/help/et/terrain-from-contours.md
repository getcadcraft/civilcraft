---
title: Maapind kontuurjoontest
summary: Koosta kontuurkaardist maapind. Vali joonte kihid, määra, kust iga joone kõrgus pärineb, kontrolli ristumisi ja dubleerimisi ning ehita. Kontuurjooned muutuvad murdejoonteks ja lamedad kolmnurgad harjadel ning orgudel parandatakse. Pildilt või PDF-ilt joonistatud kaarti saab skaleerida ja paigutada kahe teadaoleva punkti järgi.
keywords: kontuurid, kontuurjooned, maapind kontuurjoontest, pind kontuurjoontest, topograafiline kaart, mõõdistuskaart, koordinaadid puuduvad, murdejooned, lamedad kolmnurgad, hari, org, künka tipp, ristuvad kontuurid, dubleeritud kontuurid, kontuurivahe, kaardi skaleerimine, kaks punkti, kaardi paigutamine, DXF, DWG, shapefile
from: e6161653
---

Mõõdistaja saadab mõnikord kontuurkaardi: jooned kõrgusmärkidega, kuid ilma punktideta. CivilCraft ehitab olemasoleva maapinna nendest joontest.

## Too kontuurid sisse

Ava kaart joonestikuna: DXF- või DWG-joonis, shapefile või GeoJSON (**GIS** › {{ui:Impordi}} või lohista fail plaanile). Jooned tulevad sisse **kaardikihtidena**. Jaotises **Pind** › {{ui:Veel}} vali {{ui:Maapind kontuurjoontest}}.

## Näita, kust iga kõrgus pärineb

Märgi kihid, mis sisaldavad kontuure, seejärel vali **Kõrgus pärineb**:

- {{ui:Joonte enda kõrgustest}}: joon, mille kõikidel tippudel on sama kõrgus (3D-murdjoon või murdjoon kõrgusega). Joon kõrgusel 0 on plaani joonestik ja sellel ei ole kõrgusmärki.
- **Numbriväli** kihil (näiteks ELEV), kui kaardil see on.
- {{ui:Algus ja intervall joonte loetelu järjekorras}}: joontele, millel kõrgust üldse pole. Esimesele loetletud joonele antakse **Esimese joone kõrgus**, järgmisele see pluss **Kontuurivahe**, ja nii edasi. Loetle jooned madalamast kõrgemani (või järjesta need kihis ümber).

## Kontrolli ja ehita

{{ui:Kontrolli}} loetleb, mis on valesti, sõnades, enne kui midagi muutub:

- joon, millel on **kõrgus puudu** või vähem kui kaks punkti;
- **dubleeritud** joon (sama kuju kaks korda, isegi vastupidises suunas joonistatud);
- kaks joont, mis **ristuvad**, erinevatel või samal kõrgusel (ka joon, mis ristub iseendaga), koos asukohaga;
- kõrgus, mis **ei ole intervalli kohta** (kirjavea näide, nagu 105.5 1 m kaardil).

Märgi {{ui:Jäta välja jooned, mis ristuvad teisega}}, et jätta välja joon, mis ristub enamikuga teistest (seejärel järgmine, kuni ükski ei ristu): eksinud joon, mis lõikab iga kontuuri, on see, mis läheb, mitte kontuurid. **Lihtsusta jooni kauguses** vähendab tippe, mis on sirgele jooksule lähemal kui see kaugus.

{{ui:Ehita maapind}} lisab jooned olemasolevale maapinnale murdejoontena (üks tagasivõtmise samm), nii et pind läbib iga kontuuri täpselt. Kui on märgitud {{ui:Paranda tasased kolmnurgad harjadel, orgudel ja mäetippudel}} ja on antud intervall, lisab CivilCraft iga lameda kolmnurga (kolmnurk, mille kõik nurgad asuvad ühel kontuuril) sisse ka punkti kõrgusel, millele sellele kõrval olev nõlv jätkub, ning mitte kunagi rohkem kui pool intervalli kontuurist kaugemale. Ilma selleta tulevad harjade tipud, orgude põhjad ja mäetipud välja lamedate plaatidena. Katsekünkal vähenes viga tegelikust pinnast veerandi võrra; harjal 40 %.

## Kaart ilma koordinaatideta

Pildilt või PDF-ilt joonistatud kontuurkaardi puhul ava **Skaleeri ja paiguta kihid kahe teadaoleva punkti järgi**. Anna kaardil kaks punkti ja nende tegelik asukoht; märgitud kihid skaleeritakse, pööratakse ja nihutatakse sobima (üks tagasivõtmise samm; kõrgusi ei muudeta). Samad kaks punkti annavad mõõtkava (kuvatakse teates) ja pöörde.

Pind on sama hea kui kaart: kahe kontuuri vahel on see tasapind, seega tegelikku maapinda nende vahel ei teata. Kontrolli tulemust kõrgusmärkide järgi enne, kui sellele toetud.
