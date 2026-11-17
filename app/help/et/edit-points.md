---
title: Mõõdistuspunkti muutmine
summary: Muuda ühe punkti numbrit, koordinaate, kõrgusmärki või kirjeldust või lohista punkt plaanil uude kohta.
keywords: muuda punkti, teisalda punkt, muuda kõrgusmärki, nummerda uuesti, punkti number, kirjeldus, lohista, põhjakoordinaat, idakoordinaat, paranda punkt, vigane mõõtmine
from: 375ae2e9
---

Vigane mõõtmine, vale riistakõrgus, valesti kirjutatud kirjeldus: paranda üks punkt ja pind järgib seda.

## Punkti väärtuste muutmine

1. Kasutades {{ui:Vali}}, klõpsa plaanil punktil. **Omadused** näitab selle numbrit, idakoordinaati, põhjakoordinaati, kõrgusmärki ja kirjeldust kastides.
2. Sisesta uus väärtus ja vajuta {{key:Enter}} (või klõpsa mujale). Punkti puhul, millel pole kõrgusmärki, jäta **Kõrgusmärk** tühjaks.
3. Pind, samakõrgusjooned ja kõik nende põhjal tehtu uuenevad kohe.

Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi ja {{key:Mod+Y}} teeb uuesti. Väärtust, mida CivilCraft ei saa kasutada (number, mis on juba teisel punktil, tähed koordinaadis), ei võeta vastu: kast jääb ümber joonitud ja olekuriba ütleb, miks.

Uus kirjelduskood loob uue punktirühma, nagu teeb import (vt [Pinna koostamine](topic:build-surface)).

## Punkti teisaldamine plaanil

1. Vali punkt (see saab rõnga).
2. Lohista rõngast. Olekuriba näitab idakoordinaati ja põhjakoordinaati, kuhu see läheb.
3. Vabasta, et punkt liigutada; selle kõrgusmärk jääb samaks. Enne vabastamist vajuta {{key:Esc}}, et punkt tagasi panna.

## Murdejooned järgivad punkti

{{ui:Murdejoon}} tööriistaga joonistatud murdejoon kopeerib punktid, mida ta läbib. Kui liigutad punkti või muudad selle kõrgusmärki, liiguvad sellel olevad murdejoone nurgad kaasa, samas sammus. Kirjeldustest tehtud murdejoonte rühmi koostatakse punktidest alati uuesti.

:::note
LandXML-failist loetud pind säilitab oma kolmnurgad: punktimuudatused muudavad seda alles pärast {{ui:Koosta pind uuesti punktidest}} käivitamist.
:::
