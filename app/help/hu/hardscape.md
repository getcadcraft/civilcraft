---
title: Burkolás, falak és lépcsők
summary: Burkolás lefolyóra vagy keresztesésre, mintázattal és rétegszerkezettel; a talajt követő gyalogutak; támfalak és szabadon álló falak lépcsőzetes alapozással; szegélyek; rámpák és lépcsők a határértékeikhez képest ellenőrizve; IFC-kivitel.
keywords: burkolt felület, burkolás, térkő, terasz, térburkolat, esés, lefolyó, keresztesés, halszálas, fekvő kötés, gyalogút, sétány, támfal, kerti fal, alapozás, koronázás, szegély, szegélyezés, rámpa, akadálymentesség, lépcsők, lépcsőfok-magasság, lépcsőfok-járófelület, lépcsőkar, pihenő
from: d34b4466
---

A burkolt felületet minden alkalommal újraszámítja a program a talajból, így követi a terepet, és újra épül, ha a talaj vagy a vonala mozog. A sarkait a térképen bármely vonalhoz hasonlóan húzhatja. Nyissa meg a Tájépítészet csoportban lévő {{ui:Burkolt felületek}} gombból.

## Burkolás

Kattintson a sarkokra, majd nyomja meg az {{key:Enter}} billentyűt. A Tulajdonságokban:

- **Szint**: üresen hagyva a talaj alatta lévő átlagos szintje.
- **Esések**: vízszintes, **keresztesés** (százalékos esés egy irány felé) vagy **lefolyóhoz**: a CivilCraft kéri, hogy kattintson arra a helyre, ahová a lefolyó kerül, majd minden sarok a lefolyótól az esésnek megfelelően emelkedik. A térképen nyilak mutatják az eséseket.
- **Mintázat** (rács, fekvő kötés, halszálas) az egységméretével, hézagjával és szögével; **Szegélyezés** szélessége. A lapon az egy milliméternél szűkebb hézagok kimaradnak.
- A burkolat a tervezett felület része. Rétegei (térkövek, ágyazat, alap) bekerülnek az IFC-be és a mennyiségekbe.

## Gyalogutak

Kattintson végig a gyalogút mentén, majd nyomja meg az {{key:Enter}} billentyűt. A talajt követi, **keresztesése** a jobb oldala felé. Ahol a gyalogút meredekebb a **Megengedett legnagyobb meredekségnél**, a térképen `!` jelöli, a Tulajdonságok pedig megmondja, mennyire meredek.

Ahol a gyalogút sávval épített útba fut, az út külső szélénél megáll, az ottani járda vagy padka szintjén, a tervezett felületen és a 3D-nézetben. Az úton átvezető gyalogutat szintezzük és két darabként jelenítjük meg, a végét pedig, amely legfeljebb a gyalogút szélességének kétszeresével rövidebben van az úttól, az útig folytatjuk. A térkép továbbra is azt mutatja, amit rajzolt, a hossza és területe pedig a teljes vonalat számítja. Lásd: [Útsáv végigvezetése](topic:corridor).

## Falak

Kattintson végig a fal mentén, majd nyomja meg az {{key:Enter}} billentyűt. A fal **támfal** vagy **szabadon álló** fal. A **Felső szint** megadása nélkül a fal végig a **Magasságával** áll a talaj felett; a felső szint megadásával vízszintesen tartható. Az **alapozása** a talaj alatt adott mélységben helyezkedik el, és egész lépcsőkben lépcsőzetesen süllyed, így a lépcsők között vízszintes marad. A Tulajdonságok megadják a hosszát, magasságait, homlokfelületének területét és az alapozási lépcsőit; a térkép mindkét végén jelöli a fal tetejét és alját (TW / BW).

:::warning
Az 1,2 m (4 ft)-nél magasabb támfal jelzést kap: ezt mérnöknek kell megterveznie.
:::

## Szegélyek

Kattintson végig a szegély mentén, majd nyomja meg az {{key:Enter}} billentyűt; állítsa be a szélességét és a kiemelkedését.

## Rámpák

Kattintson alulról felfelé, majd nyomja meg az {{key:Enter}} billentyűt. A szintek a két végén lévő talajból adódnak, hacsak nem írja be őket. A rámpa minden 750 mm (2,5 ft) emelkedés után pihenőt kap, és ellenőrzésre kerül a **Megengedett legnagyobb meredekség** (kezdetben 1:12) és a minimális szélesség szerint; a Tulajdonságok megmondják, mekkora hosszra lenne szükség.

## Lépcsők

Kattintson az alsó lépcsőfok elülső élére, majd arra a helyre, ahol a lépcsők a felsőbe érnek, és nyomja meg az {{key:Enter}} billentyűt. A lépcsőfokok száma a magasságból és a **Legnagyobb lépcsőfok-magasságból** adódik; a járófelület-mélység a 2R + G ≈ 630 mm kényelmi szabályból adódik, soha nem lehet a **Legkisebb járófelület-mélység** alatt; pihenő minden **Egy szakaszban legfeljebb ennyi lépcsőfok** után. A Tulajdonságok megmondják, hogy a két pont közé beférnek-e, vagy mennyivel hosszabbak kellene legyenek.

:::note
A rámpák és lépcsők határértékei címkézett alapértékek. Állítsa be azokat, amelyeket az Ön építési szabályzata előír.
:::

## A CivilCraften kívül

- Továbbiak › {{ui:Tájépítészeti IFC exportálása}}: a burkolat és a gyalogutak `IfcPavement` elemként, a falak `IfcWall` elemként (a támfalak RETAININGWALL néven), rétegeikkel együtt, a szegélyek `IfcKerb`, a rámpák `IfcRamp`, a lépcsők `IfcStair` elemként, lépcsőfok-magasságaikkal és -járófelületeikkel együtt.
- A növénylista **Küldés a TakeoffCraft-nak** parancsa továbbviszi a burkolt területeket és rétegtérfogatokat, a falak homlokfelületeinek területét és hosszát, a szegélyek hosszát és a lépcsőfokok számát.
- A részletlap minden fal keresztmetszetét, minden burkolat rétegrendjét és minden lépcsősort rajzolja. Lásd: [Tájépítészeti lapok](topic:landscape-sheets).
