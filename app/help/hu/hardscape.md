---
title: Burkolatok, falak és lépcsők
summary: Burkolat esésekkel a lefolyóhoz vagy keresztlejtéssel, mintázat és annak rétegrendje; a terepet követő utak; támfalak és szabadon álló falak lépcsős alapozással; szegélyek; rámpák és lépcsők a határértékeikkel ellenőrizve; IFC-exportálás.
keywords: burkolt felület, burkolat, burkolókő, terasz, esés, lefolyó, keresztlejtés, halszálkás, fektetett kötés, út, sétány, támfal, kerti fal, alapozás, koronázás, szegély, szegélyezés, rámpa, akadálymentesség, lépcső, lépcsőfok, pihenő
from: 51475877
---

A burkolt felület minden alkalommal újra kiszámítódik a terepből, így követi a domborzatot, és újragenerálódik, amikor a talaj vagy a vonala mozdul. Húzza a sarkait a terven, mint bármely vonalat. Nyissa meg a {{ui:Burkolt felületek}} parancsot a Tájépítészet csoportban.

## Burkolat

Kattintson a sarkokra, és nyomja meg az {{key:Enter}} billentyűt. A Tulajdonságokban:

- **Szint**: üres = a talaj átlagos szintje alatta.
- **Esések**: szint, **keresztlejtés** (% egy irányba) vagy **lefolyóhoz**: a CivilCraft megkéri, hogy kattintson oda, ahová a lefolyó kerül, majd minden sarok a lefolyótól emelkedik a megadott eséssel. A terven nyilak mutatják az eséseket.
- **Mintázat** (rács, fektetett kötés, halszálkás) a mértékegységgel, fugával és szöggel; **Szegélyezés** szélessége. Rajzlapon az 1 mm-nél közelebb eső fugák kimaradnak.
- A burkolat a tervezett felület része. Rétegei (burkolókő, ágyazat, alap) bekerülnek az IFC-be és a mennyiségekbe.

## Utak

Kattintson az út mentén, és nyomja meg az {{key:Enter}} billentyűt. Követi a terepet, a **Keresztlejtés** a jobb oldala felé mutat. Az a út, amelynek meredeksége meghaladja a **Megengedett legnagyobb meredekség** értéket, `!` jelet kap a terven arra a részre, ahol van, a Tulajdonságok pedig megmondja, mennyire meredek.

## Falak

Kattintson a fal mentén, és nyomja meg az {{key:Enter}} billentyűt. A fal **támfal** vagy **szabadon álló** lehet. Ha nincs megadva **Teteje**, a fal a **Magasság** értékével áll a talaj fölött végig; ha megad egy tetőszintet, vízszintesen tartja. Az **alapozása** egy beállított mélységben van a talaj alatt, és teljes lépcsőkben lép lefelé, így közöttük vízszintes marad. A Tulajdonságok megadják a hosszt, a magasságokat, a homlokzati felületet és az alapozási lépcsőket; a terv minden végén feliratozza a fal tetejét és alját (TW / BW).

:::warning
Az 1,2 m (4 ft) magasságnál magasabb támfalat jelez a rendszer: ilyet mérnök tervez.
:::

## Szegélyek

Kattintson a szegély mentén, és nyomja meg az {{key:Enter}} billentyűt; állítsa be a szélességét és a kiemelkedését.

## Rámpák

Kattintson az aljától a tetejéig, és nyomja meg az {{key:Enter}} billentyűt. A szintek a két végén lévő talajból adódnak, hacsak be nem írja őket. Minden 750 mm (2,5 ft) emelkedésnél pihenőt kap a rámpa; ellenőrzi a **Megengedett legnagyobb meredekség** (kezdetben 1:12) értéket és a minimális szélességet. A Tulajdonságok megmondják, mekkora hosszúságra lenne szükség.

## Lépcsők

Kattintson az alsó lépcsőfok előlapjának élére, majd arra a helyre, ahol a lépcső eléri a tetejét, és nyomja meg az {{key:Enter}} billentyűt. A lépcsőfokok száma a magasságból és a **Legnagyobb lépcsőfok-magasság** értékből adódik; a lépcsőfok-mélység a 2R + G ≈ 630 mm kényelmi szabályból, és sosem lehet a **Legkisebb lépcsőfok-mélység** alatt; pihenő kerül minden olyan szakasz után, amelynek lépcsőfokszáma eléri a **Legtöbb lépcsőfok egy szakaszban** értéket. A Tulajdonságok megmondják, hogy a két pont között elférnek-e, vagy mennyivel hosszabbnak kellene lenniük.

:::note
A rámpák és lépcsők határértékei címkézett alapértékek. Állítsa be azokat, amelyeket az építési szabályzata előír.
:::

## Kivitel a CivilCraftból

- Továbbiak › {{ui:Tájépítészeti IFC exportálása}}: burkolatok és utak `IfcPavement`-ként, falak `IfcWall`-ként (a támfalak RETAININGWALL típussal) a rétegeikkel, szegélyek `IfcKerb`-ként, rámpák `IfcRamp`-ként, lépcsők `IfcStair`-ként a lépcsőfokaikkal és a lépcsőlapjaikkal együtt.
- A növényjegyzék **Küldés a TakeoffCraftba** parancsa a burkolati területeket és rétegtérfogatokat, a falak homlokzati felületeit és hosszait, a szegélyek hosszait és a lépcsőszámokat viszi át.
- A részletlap rajzolja meg minden fal metszetét, minden burkolat rétegrendjét és minden lépcsőszakaszt. Lásd: [Tájépítészeti lapok](topic:landscape-sheets).
