---
title: Ava DWG või DXF joonestikuna
summary: Ava joonistuse joonestik plaanil kihtide kaupa, kasuta selle kõverjooni, 3D-polüjooni ja suletud kontuure pinna jaoks ning muuda selle punktiplokid mõõdistuspunktideks.
keywords: mõõdistuse kontroll, teksti kõrgused, dwg, dxf, cad, joonistus, joonestik, kõverjooned, murdejooned, piir, polüjoon, 3D-polüjoon, kihid, aluskaart, topo, mõõdistusjoonistus, plokid, plokiviited, mõõdistuspunktid plokkidest, atribuudid, punktiplokid, sisestuspunkt
from: da0f4c58
---

Topograafiline mõõdistus tuleb sageli joonistusena: kõverjooned polüjoontena nende kõrgusel, murdejooned 3D-polüjoontena, saidi piir suletud polüjoonena. CivilCraft avab joonistuse **mudeliruumi** kihtidena plaanil ja suudab need jooned otse pinnaks muuta.

## Ava joonistus

1. Klõpsa {{ui:Linework}} grupis **Surface** (või {{ui:Open}}, või lohista fail plaanile) ja vali `.dwg` või `.dxf` fail. Joonistus loetakse sellesse arvutisse; midagi ei laadita üles. Loetakse DWG 2000 kuni 2018 ja ASCII DXF.
2. Dialoog **Linework** loetleb joonistuse kihid, millel on jooni, suletud kujundeid või punkte, ja kas neil on **kõrgused**. Joonistuses välja lülitatud kihid algavad märkimata. Tekst, viirutused, mõõdud ja muud mitte-joonestiku objektid loetakse kokku ja jäetakse välja (dialoog ütleb, millised).
3. Kontrolli **Drawing units**. Kui joonistus ütleb oma ühikud, teisendab CivilCraft need projekti omadeks (millimeetrid meetriteks, meetrid jalgadeks, tollid jalgadeks). Jalgades joonistus loetakse USA mõõdistusjalgadena ilma skaleerimata: need erinevad 2 miljoni osa võrra, ja riigitasandi koordinaatide skaleerimine nihutaks neid jalgade võrra. Kui joonistus oma ühikuid ei ütle, loetakse selle arvud projekti ühikutes; vali nimekirjast õiged ühikud, kui need ei ole õiged.
4. Valikus **Use for the surface** vali, mida iga kiht annab pinnale (või jäta **Only show it**). Kihid, mille nimed on nagu kõverjooned (TOPO, CONT, CNTR) ja millel on kõrgused, algavad murdejoontena.
5. Klõpsa {{ui:Add}}. Kihid ilmuvad vasakus paneelis jaotisse **GIS layers**; iga kasutus pannakse pinda. Iga osa on oma samm: {{key:Mod+Z}} võtab need tagasi ükshaaval.

## Mida iga kihi tüüp anda võib

| Kiht sisaldab | Kasutus pinnale |
|---|---|
| Kõverjooned (polüjoonid kõrgusel) | Murdejooned joonte enda kõrgusel või ELEV väljal |
| 3D-polüjoonid | Murdejooned nende enda kõrgustel |
| Suletud kontuur | Pinna piir (suurim suletud kuju või see, mille valisid) |
| Punktid kõrgusega | Mõõdistuspunktid, kirjeldatud kihi nimega |
| Jooned kõrgusel 0 (plaani joonestik) | Mitte midagi: see jääb plaanile baasjoonistusena |

CivilCraft'i kirjutatud joonistus hoiab oma tunnusjooned 3D-polüjoontena, mis mäletavad oma kaari. Dialoog näitab siis **Feature lines**: jäta see märgituks, et tuua need tagasi tunnusjoontena koos kaarte ja kasutustega (üks tagasivõtmise samm), või eemalda märge, et lugeda need nagu iga teine kiht joonestikuna.

Hiljem kasuta {{ui:Use for the surface}} kihi menüüs jaotises **GIS layers**, et teha sama kihi jaoks, mida sa ainult näitasid.

## Mõõdistuspunktid plokkidest

Mõõdistusjoonistustel on punktid sageli plokkidena: väike sümbol igal mõõdul, atribuutidega punkti numbri, kirjelduse ja kõrguse jaoks. Kui joonistusel on plokiviiteid, on dialoogis jaotis **Survey points from blocks**:

1. Märgi plokid, mida võtta (tabel ütleb, mitu viidet igal on, millistel kihtidel ja milliste atribuutidega), või märgi kihid, et võtta kõik nendel olevad plokiviited.
2. Vali, kust tuleb iga punkti **number**, **kirjeldus** ja **kõrgus**: atribuudist, ploki või kihi nimest, järgmistest vabadest numbritest või sisestuspunkti Z-st. CivilCraft alustab tõenäoliste atribuutidega (PT, DESC, ELEV ja sarnased) ja võtab kõrguse atribuudist ainult siis, kui plokid asuvad nullil.
3. Eemalda märge joonestikukihtidelt, kui tahad ainult punkte, ja klõpsa {{ui:Add}}.

Iga viide muutub üheks mõõdistuspunktiks oma sisestuspunktis. Arvestatakse ainult mudeliruumi paigutatud viiteid; teiste plokkide sees olevaid plokke ei arvestata. Projektis juba olevad numbrid või joonistuses kahekordselt kasutatud numbrid saavad uued numbrid pärast suurimat, ja kõrgusatribuut, mis ei ole number, jätab punkti ilma kõrguseta; olekurida loeb mõlemad kokku. Joonistust ei muudeta kunagi ja iga punkt mäletab oma plokki: selle Omadused näitavad **From block** koos ploki, kihi ja käepidemega. Punktide lisamine on üks samm, nii et {{key:Mod+Z}} võtab need kõik ära.

## Kõrgused tekstina ja kontroll

Tekstina kirjutatud kõrgusmärgid (või plokiatribuudis, mis ei ole mõõdistuspunkti plokk) ei ole joonestik. Jaotis **Survey levels and check** võib need võtta mõõdistuspunktidena ja loetleb, mis joonistuses näib valesti: ühikud, koordinaatsüsteem, kaugus nullist, lamedad kõverjooned, kummalised kõrgused, topeltpunktid. Vaata [Mõõdistusjoonistuse kontroll impordil](topic:survey-check).

## Kuidas joonistust loetakse

- Kaared, ringid, ellipsid, kõverdatud polüjooni lõigud ja splainid muutuvad lühikesteks sirgeteks tükkideks (kõige rohkem iga 5°).
- Plokiviited joonistatakse sinna, kus need on paigutatud, samuti sisemised plokid; see, mida plokk hoiab kihil 0, võtab viite kihi.
- Teistes tasapindades joonistatud objektid (erinev ekstrusiooni suund) paigutatakse maailmakoordinaatidesse.
- Iga objekt saab kolm välja: LAYER, TYPE (objekti tüüp) ja ELEV (selle kõrgus, kui kõigil selle punktidel on üks kõrgus).
- Koordinaadid võetakse nii, nagu need on: joonistus peab kasutama samu koordinaate kui projekt (näiteks sama riigitasandi tsoon). Lingitud joonistusi (xrefs) ei avata: ava need eraldi.

:::tip
Kõverjoonte joonistus annab parima pinna, kui sellele lisada mõni punktikõrgus künkade tippudel ja süvendites, kus ainult kõverjooned jätavad lamedad kolmnurgad. Lisa need mõõdistuspunktidena või punktikihist joonistusel.
:::
