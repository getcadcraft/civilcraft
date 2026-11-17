---
title: Munkalapok: az objektumokhoz kötött kimutatások
summary: Mentett munkalapok sorokkal a növényekből, ültetett területekből, burkolatokból, falakból, lépcsőkből, terepmódosítókból vagy minden mennyiségből; saját oszlopok és képletek, csoportok és összegek; CSV, XLSX és táblázat a lapokon, mindig naprakészen.
keywords: munkalap, kimutatás, növénykimutatás, burkolat-kimutatás, mennyiségek, oszlopok, képlet, összeg, összesen, darabszám, csoport, szűrő, csv, xlsx, táblázatkezelő, táblázat a lapon
from: 11bc1bac
---

{{ui:Munkalapok}} (Tájépítészet › További) megnyitja a projekt munkalapjait. Először a **növénykimutatás** és a **burkolat- és területkimutatás** készül el. A munkalap minden megjelenítéskor, kiírásakor vagy lapra helyezéskor az objektumokból számítódik újra: ha módosít egy ágyást, a darabszámok mindenhol megváltoznak.

- **Sorok forrása**: növények (fajonként, fajtánként és méretenként egy sor), ültetett területek, burkolatok, falak, lépcsők, terepmódosítók (bevágás és feltöltés) vagy minden mennyiség.
- **Oszlopok**: mező (`qty`, `area`, `botanical`, vagy szögletes zárójelben álló név, például `[Net area]`) vagy képlet: `+ - * / ^ %`, `&` szöveg összefűzésére, `= <> < <= > >=`, valamint `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. A ki nem számítható képlet a cellájában `#ERR` (vagy `#DIV/0`) jelet mutat. A képleteket a CadCraft saját elemzője olvassa; semmi nem fut bennük kódként.
- **Összeg** oszloponként (összeg, darabszám, átlag, legkisebb, legnagyobb), **Csoportosítás** (részösszegek csoportonként) és **Csak azok a sorok, ahol**.
- {{ui:Mentés CSV-ként}}, {{ui:Mentés XLSX-ként}}, és **Ezt a munkalapot helyezze a lapokra** (a Lapok › Munkalapok táblázatként rajzolja ki, szükség szerint több lapon át).

A növényeken és területeken lévő címkék ugyanazokat a mezőneveket olvassák (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
