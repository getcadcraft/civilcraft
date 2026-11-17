---
title: Štýlovanie hladiny podľa atribútu
summary: Sfarbite prvky hladiny GIS podľa hodnôt poľa (jedna farba pre každú hodnotu alebo podľa číselných rozsahov), zväčšite body podľa čísla, zafarbite polygóny a zobrazte legendu v pôdoryse.
keywords: symbolika, štýl, farba, kategorizované, stupňované, jedinečné hodnoty, rovnaký interval, kvantil, prirodzené zlomy, jenks, prechod, farbosleposť, legenda, veľkosť, body, choropleth, triedy, gis
from: a3a69add
---

Otvorte ponuku **troch bodiek** v zozname hladín GIS a vyberte {{ui:Style by attribute…}}.

## Tri štýly

- **Jednoduchý symbol:** farba hladiny, ako predtým.
- **Kategorizované:** jedna farba pre každú rozdielnu hodnotu ľubovoľného poľa. Až osem hodnôt dostane osem farieb Okabe-Ito (zvolených tak, aby zostali od seba rozlíšiteľné pri bežných typoch farbosleposti); pri viacerých hodnotách dostane sedem najčastejších každá svoju farbu a zvyšok zdieľa sivú triedu **Ostatné**. Prvky bez hodnoty sú sivé.
- **Stupňované:** číselné pole sa rozdelí na 2 až 9 rozsahov, každý s farbou z prechodu. Hodnota na hranici ide do nižšieho rozsahu.

## Ako sa rozsahy rozdeľujú

| Metóda | Zlomy |
|---|---|
| Rovnaký interval | Rozsah od najmenšej po najväčšiu hodnotu rozdelený na rovnaké šírky. Hodnoty 0 až 30 v troch rozsahoch: 0, 10, 20, 30. |
| Kvantil | Približne rovnaký počet prvkov v každom rozsahu. Zlomy sa čítajú z zoradených hodnôt bežnou lineárnou interpoláciou: pre 1 až 10 v dvoch rozsahoch je zlom 5.5. |
| Prirodzené zlomy (Jenks) | Rezy, ktoré zanechajú najmenší rozptyl vnútri každého rozsahu, takže zhluky podobných hodnôt zostanú pohromade. Pri viac než 1,500 hodnotách pracuje s 1,500 rovnomerne rozloženými a o tom informuje. |

## Farby

Viridis a Cividis idú od tmavej po svetlú s plynulou zmenou svetlosti, takže poradie rozsahov sa dá čítať aj v odtieňoch sivej alebo pri farbosleposti. Blues ide od svetlej po tmavú. Červená až modrá je obojsmerný prechod pre hodnoty okolo strednej. **Obrátiť farby** ktorýkoľvek z nich otočí. Dialóg pred použitím vypíše rozsahy a počet prvkov v každom.

## Veľkosť, výplň a legenda

- **Veľkosť bodu podľa** číselného poľa zväčší štvorec každého bodu, čím väčšia hodnota, medzi dvoma veľkosťami, ktoré zadáte (polovica strany, v milimetroch na papieri).
- **Zafarbiť vnútro polygónov** vyplní každý polygón farbou jeho triedy (otvory zostanú prázdne). Zafarbenie je na obrazovke; výkresy a DXF/DWG zobrazia farebné obrysy.
- **Zobraziť legendu v pôdoryse** nakreslí triedy, ich počty a rozsah veľkostí v ľavom dolnom rohu pôdorysu. Legenda je na obrazovke; nie je vo výkrese.
- Na označenie prvkov poľom použite **Označiť pomocou** v tej istej ponuke.

Štýl sa uloží do súboru projektu. Zostava, ktorá štýly nepozná, otvorí súbor s farbou hladiny. Výkresy, DXF a DWG nesú triedy ako samostatné hladiny pomenované podľa hladiny a triedy, v najbližšej z deviatich základných farieb CAD. Hladina s viac než 200,000 prvkami sa kreslí jednou farbou.
