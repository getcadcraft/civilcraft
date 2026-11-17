---
title: Probleemid ja BCF
summary: Kinnita probleem plaanile, joonduse staatusele, pinnapunktile või torule, anna sellele staatus ja kommentaarid ning vaheta probleeme BCF 2.1 failidena LandXML-faili kõrval.
keywords: probleem, probleemid, bcf, kommentaar, märgistus, puudus, defekt, objekt, kinnitus, staatus, avatud, lahendatud, suletud, bim collaboration format, landxml, vead
from: e44153b1
---

Probleem on märge, mis on kinnitatud CivilCrafti joonise kindlasse kohta ning millel on pealkiri, staatus ja kommentaarid. Seda kasutatakse selleks, et öelda objektil töötavatele inimestele või teisele programmile, mida vaadata, ning lugeda tagasi nende vastuseid.

## Probleemi lisamine

1. Ava **Pind, Veel, Probleemid (BCF)...**
2. Sisesta pealkiri ja kirjelda, mis on valesti.
3. Vali, kuhu see kinnitada: plaanivaate keskpunkt, keskpunktis olev pinnapunkt, valitud joondusel olev staatus (sisesta staatus ja nihe, parem pool on positiivne) või valitud toru, rajatis või tunnusjoon.
4. Vajuta **Lisa probleem**. Kinnitus ilmub plaanil väikese romb-kujulise märgina koos oma numbriga.

Klõpsa probleemi pealkirjal, et sellele suumida, muuda staatust loendis (Avatud, Aktiivne, Lahendatud, Suletud) ja lisa kommentaare. Iga muudatus on üks tagasivõtmise samm ning probleemid salvestatakse projektifaili.

## Vahetamine BCF-formaadis

- **Ekspordi BCF** kirjutab BCF 2.1 faili, kus on üks teema iga probleemi kohta: pealkiri, staatus, kommentaarid ja üks vaade koos ortogonaalse plaanikaamera ja kinnitusega.
- **Impordi BCF** loeb BCF-faili (2.0 ja 3.0 failid loetakse niivõrd, kuivõrd need vastavad 2.1-le). Teema, mille guid on sul juba olemas, uuendab seda probleemi (staatus, uued kommentaarid) ega lisa teist.
- **Probleemidest** teeb probleemi igast avatud kirjest Probleemide paneelis, mis ütleb, kus see asub.

BCF kannab selle projekti enda koordinaate meetrites, ilma nihketa. Teine programm peab olema samas koordinaatsüsteemis, mis sinu LandXML-fail, et kinnitused paigutuksid õigesse kohta. Element, millele kinnitus osutab (joondus, staatus, nihe, toru), liigub siltidena, mis algavad "cc:", ja CivilCraft loeb need tagasi.

## Mida ei ole kontrollitud

Kinnitusi ja vaateid on testitud ainult faili kirjutamise ja tagasilugemisega CivilCraftis. Ükski teine BIM-programm pole neid veel avanud. Lisaks erineb programmiti see, kas BCF-i "view to world scale" tähendab vaate täis- või poolt kõrgust: CivilCraft kirjutab täiskõrguse.
