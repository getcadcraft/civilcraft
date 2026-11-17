---
title: "Éghajlati jövőkép: 2050 és 2080 árvíz, hőség és erdőtűz"
summary: A Cím a helyszínhez funkcióban a helyszín árvízszintje megemelhető egy jövőbeli éghajlathoz, megvizsgálható az erdőtűz-kitettség, és átalakítható az időjárási fájl, összevetve a jelenlegi és a jövőbeli adatot egy éghajlati adatcsomagból (SSP2-4.5 és SSP5-8.5, 2050 és 2080).
keywords: éghajlat, éghajlatváltozás, jövő, 2050, 2080, ssp, cmip6, forgatókönyv, tengerszint, árvíz, alapárvízszint, bfe, fema, hőség, időjárási fájl, epw, morph, erdőtűz, bozóttűz
from: b0d2ee38
---

Az éghajlati adatok egy **adatcsomagból** származnak, nem magából az alkalmazásból. Kapcsolja be a {{ui:Éghajlati jövőkép}} bővítményt a Beállítások › Bővítmények menüben, vagy töltsön be saját csomagfájlt a {{ui:Éghajlati jövőkép}} blokkban.

:::warning
A bővítménnyel érkező csomag **minta**: három helyszín (Denver, Miami, Johannesburg), egy éghajlati modell, és minden 20 éves időszakban öt év. Azért van, hogy kipróbálhassa az eszközöket, **nem tervezéshez**. Teljes csomagot a `tools/climate/build-pack.mjs` segítségével készítünk a NASA NEX-GDDP-CMIP6 adataiból.
:::

## Hol található

Terepfelület › További › Cím a helyszínhez. Állítsa be a pontot, adjon hozzá rétegeket (egy FEMA árvízi réteg megadja az alapárvízszintet), és nyomja meg a helyszínt olvasó gombot. A helyszín sorai alatt van a {{ui:Éghajlati jövőkép}} blokk: válasszon **Forgatókönyvet** (SSP2-4.5 vagy SSP5-8.5) és **Évet** (2050 = 2041–2060, 2080 = 2071–2090, mindkettő az 1995–2014 időszakhoz képest). A csomag ponthoz legközelebbi helyszíne használódik, vagy az, amelyet kiválasztottak; ha minden helyszíntől messze van, az általános globális átlagos változásokat használjuk, és a panel ezt jelzi.

## Tervezési árvízszint

A jelenlegi szint a FEMA alapárvízszintje, ha az árvízi rétegben volt ilyen (láb, NAVD 88), különben írja be a sajátját. Válassza ki az árvíz típusát (tengerparti, folyami vagy heves eső, vagy mindkettő), a helyszíni elöntési mélységet az esőzés részéhez, és szükség szerint biztonsági magasságot (freeboard). Az {{ui:Árvízszint emelése}} gomb egymás mellett mutatja a jelenlegi és a jövőbeli szintet, a tengerszint-emelkedés és az esőzés részét, valamint a feltevéseket: a teljes tengerszint-emelkedés hozzáadódik a tengerparti szinthez; a folyási mennyiség egy az egyhez követi a legnedvesebb nap csapadékát, a mélység pedig a folyási mennyiség 0,6-os hatványát követi (Manning, széles meder); a részeket összeadjuk.

:::warning
A változás becslése, nem árvízvizsgálat. A tervezési árvízszint a hatóság vagy a mérnök döntése.
:::

## Erdőtűz-kitettség (csak becslés)

A legközelebbi növényzet, a hozzá tartozó emelkedő lejtő és a távolság egy sávot ad, a nagyon alacsonytól a szélsőségesig, jelenlegi és jövőbeli értékkel (a jövőbeli szorzója a csomag tűzidőjárási indexének változása). **Csak becslés:** a mi saját relatív skálánk, annak eldöntéséhez, hogy a helyszín igényel-e megfelelő erdőtűz-vizsgálatot; nem szabványos besorolás.

## Hőség: jövőbeli időjárási fájl

Válasszon egy mai `.epw` fájlt, és nyomja meg a {{ui:Jövőbeli időjárási fájl készítése}} gombot: a fájlt a közzétett eltolás-és-nyújtás módszerrel (Belcher, Hacker és Powell, 2005) átalakítjuk, és a hőség összevetésre kerül (átlagos és legmelegebb hőmérséklet, tervezési hőmérsékletek, 30 °C és 35 °C feletti órák, fokonapok). A {{ui:Jövőbeli időjárási fájl mentése}} gomb elmenti a fájlt a Környezet panelnek, a BimCraft energiaellenőrzésének vagy saját eszközeinek.

## Honnan származnak az adatok

A NASA NEX-GDDP-CMIP6 (léptékben lefelé skálázott CMIP6 modelleredmények, modellenként CC BY 4.0) a hőmérsékletre, a páratartalomra, a napfényre, a csapadékra és a tűzidőjárásra; az IPCC AR6 globális átlaga a tengerszint-emelkedésre, hacsak a csomag nem tartalmaz helyi adatokat. A panel mutatja a csomag forrását, licencét és dátumát.
