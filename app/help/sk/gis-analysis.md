---
title: Analýza hladín GIS
summary: Okolie (buffer), prekrytie (prienik, zjednotenie, vymazanie, rozpustenie), priestorové spojenie, výber podľa atribútu a meranie hladín GIS v projekte, každá ako nová hladina, ktorú môžete vrátiť späť.
keywords: gis, analýza, buffer, prekrytie, prienik, zjednotenie, vymazanie, orezanie, rozpustenie, priestorové spojenie, spojenie, výber podľa atribútu, dopyt, where, výraz, štatistika, plocha, dĺžka, obvod, meranie, parcely, vecné bremeno, odstup od stavebnej čiary, shapefile, geopackage, tabuľka atribútov
from: a6b2d3f9
---

Keď projekt obsahuje hladiny GIS (pozri [Import údajov GIS](topic:gis-import)), tlačidlo **Analyzovať** v skupine GIS (zadané ako `GISANALYSIS`, `ANALYZE` alebo `BUFFER`) otvorí panel s piatimi kartami. Zostáva otvorený vedľa pôdorysu, takže to, čo vyberiete, sa kreslí do pôdorysu počas vašej práce.

Každý nástroj, ktorý niečo vytvára, **pridá novú hladinu** a hladiny, z ktorých čítal, ponechá presne tak, ako boli. Každý je jeden krok späť: {{ui:Undo}} v paneli (alebo Ctrl+Z) odstráni novú hladinu. Výsledok exportujte ako ktorúkoľvek hladinu pomocou [Export údajov o skutočnom vyhotovení pre GIS](topic:gis-export) ako shapefile, GeoJSON alebo GeoPackage.

Úplná tabuľka hladiny, s triedením, úpravami a kalkulátorom polí, je v [Práca s tabuľkou atribútov hladiny](topic:gis-table); farbenie podľa poľa je v [Štýlovanie hladiny podľa atribútu](topic:gis-symbology).

Všetko sa spracúva v pôdoryse, v jednotkách projektu (stopy alebo metre). Projekt je vždy v projekčnom alebo miestnom systéme, takže vzdialenosť 50 znamená 50 stôp alebo 50 metrov, nikdy stupne. Výšky (z) sa vo výsledkoch neuchovávajú.

## Buffer

Vykreslí zónu zadanej vzdialenosti okolo každého prvku ako novú hladinu polygónov. Body sa stanú kruhmi, čiary koridormi so zaoblenými koncami, polygóny sa zväčšia. **Záporná** vzdialenosť polygóny zmenší (štvorec 100 na 100 zmenšený o 5 má 90 na 90; zmenšený o 60 nezostane nič a panel to oznámi). Vzdialenosť zoberte z číselného poľa, ak chcete pre každý prvok vlastnú, alebo zaškrtnite **Zlúčiť všetky zóny do jedného tvaru**, aby sa rozpustili.

Zaoblené časti sú rovné úseky nakreslené vnútri skutočnej krivky, takže buffer je o chlpik menší ako presný kruh: asi o 0.6 % plochy pri bežnom nastavení, o 0.16 % pri Jemnom. Pri všetkom, čo budete merať, použite Jemné.

## Prekrytie

| Nástroj | Čo dostanete |
|---|---|
| Prienik | Časti, kde vstupná hladina prechádza cez polygóny prekrytia, každá s poliami oboch hladín. Čiary a body sa orežú podľa polygónov. |
| Zjednotenie | Obe polygónové hladiny rozrezané pozdĺž hrán tej druhej: spoločné časti nesú polia oboch hladín, zvyšok nesie polia jednej hladiny (polia tej druhej sú prázdne). |
| Vymazanie | Vstupné polygóny s odčítanými polygónmi prekrytia. Polia zostávajú pri vstupe. Prvok vymazaný úplne sa vynechá (panel ich spočíta). |
| Rozpustenie | Zlúči polygóny, ktoré sa dotýkajú alebo prekrývajú, buď všetky, alebo jeden tvar pre každú hodnotu poľa. Pridá `COUNT` a `AREA`. |

Názov poľa, ktoré majú obe hladiny, sa zachová pre prvú hladinu a pole druhej hladiny sa zapíše s príponou `_2`. Prvky v jednej hladine by sa nemali navzájom prekrývať: ak sa prekrývajú, zjednotenie počíta prekryv v oboch.

## Spojenie

Priestorové spojenie skopíruje atribúty zo **zdrojovej** hladiny na každý **cieľový** prvok, ktorý sa jej dotýka, a dá novú hladinu s tvarmi cieľa. Zvoľte, kedy sa stretnú: dotykom alebo prekrytím, cieľ leží vnútri zdrojového polygónu, cieľ obsahuje zdrojový prvok, najbližší zdrojový prvok (voliteľne s obmedzením) alebo ľubovoľný zdrojový prvok v zadanej vzdialenosti.

Keď sa zhoduje viac zdrojových prvkov, prevezmete atribúty prvého (najbližšieho pri spojení najbližším alebo vzdialenosťou; pridá sa `DISTANCE`), alebo ich **spočítate a sčítate ich číselné polia**: `COUNT` a `SUM_`, `MEAN_`, `MIN_`, `MAX_` pre každé číselné pole. Zrušením **Ponechať cieľové prvky, ktoré nenašli zhodu** ich vynecháte. Pripojené polia sú prázdne tam, kde sa nič nezhodovalo, a panel spočíta nezhodné.

## Výber

Napíšte otázku o atribútoch alebo tvare, stlačte **Vybrať** a prvky sa vykreslia v pôdoryse s ich počtom, tabuľkou a celkovou plochou, dĺžkou alebo číslom. Potom z nich vytvorte vlastnú hladinu, priblížte na ne alebo zrušte výber.

| Môžete napísať | Príklad |
|---|---|
| Pole podľa názvu; ak názov obsahuje medzery, použite "úvodzovky" alebo [hranaté zátvorky] | `VALUE`, `"Lot Number"` |
| Čísla, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (text ignoruje veľkosť písmen; v `like` je `%` ľubovoľný úsek a `_` jedno písmeno) | `Notes contains 'corner'` |
| `is null`, `is not null` (prázdna hodnota sa počíta ako null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` a zátvorky | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Hodnoty tvaru `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Neúplná otázka alebo otázka, ktorá uvádza pole, ktoré hladina nemá, sa odmietne vetou, ktorá povie, kde je chyba.

## Meranie

Zobrazí celkovú plochu a obvod, dĺžku alebo počet hladiny a **pridá polia** do nej: `AREA` a `PERIMETER` pre polygóny, `LENGTH` pre čiary (dĺžka v pôdoryse), `X` a `Y` pre body. Existujúce pole sa nikdy neprepíše: nové sa nazve `AREA_2`. Je to jeden krok späť. **Štatistika** dá počet, súčet, priemer, minimum a maximum číselného poľa, voliteľne pre každú hodnotu iného poľa.

:::note
Kontroly za týmito nástrojmi sa v teste overujú ručne (`node bin/test-civilcraft-gisanalysis.mjs`): napríklad parcely 100 na 100 pod zónou 100 na 80 sa pretnú v 3,000 plus 3,000, a čiara dlhá 100, obalená okolím 10, má 2,000 plus kruh.
:::
