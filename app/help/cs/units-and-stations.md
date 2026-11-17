---
title: Jednotky, staničení a formáty čísel
summary: Projekty ve stopách a metrech, jak se zapisují a zadávají staničení, sklony, směrníky, plochy, objemy a velikosti potrubí, a co dělá změna jednotek.
keywords: zadání délky, aritmetika, kalkulačka, součet, zlomek, stopy a palce, 4+7/16, jednotky, stopy, US survey stopy, metry, metrické, imperiální, formát staničení, staničení, sklon, procento, sklon svahu, h:v, směrník, krychlové yardy, průměr
from: 0b9b5b6b
---

## Jednotky projektu

Projekt je v **US stopách** nebo **metrech** (**Jednotky** v levém panelu). Každá souřadnice, výška, délka a staničení v projektu je v této jednotce.

:::warning
Změna **Jednotek** změní popisky, formát staničení, výchozí hodnoty a způsob zápisu souborů. Nepřevádí **žádná** čísla. Lokalita zaměřená ve stopách a přepnutá na metry si zachová stejná čísla, nyní čtená jako metry. Stavový řádek říká "Jednotky jsou nyní metry. Souřadnice nebyly převedeny." Nastavte jednotky podle svých dat dříve, než začnete navrhovat.
:::

Co závisí na jednotkách:

| | US stopy | Metry |
|---|---|---|
| Formát staničení | `12+34.56` (staničení po 100 ft) | `1+234.567` (staničení po 1000 m) |
| Nabízené intervaly vrstevnic | 0.25 až 20 ft | 0.1 až 10 m |
| Plocha | sq ft | sq m |
| Objem | cu yd | cu m |
| Průměr potrubí a objektu | palce | milimetry |
| Výchozí poloměr oblouku | 100 ft | 30 m |
| Značky staničení na plánu | každých 50 ft, popisky každých 100 ft | každých 20 m, popisky každých 100 m |
| Měřítka tisku | 1" = 5' až 1" = 1000' | 1:50 až 1:10000 |
| Délková jednotka v LandXML | USSurveyFoot | meter |

Nový projekt začíná ve stopách, nebo v metrech, pokud je v {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Jednotky}} označena metrická délková jednotka. Seznam **Jednotky** ukazuje jednotky zapnuté tam a vždy vlastní jednotky projektu. S označenou plošnou nebo objemovou jednotkou (akry, hektary, akro-stopy …) se plochy a objemy uvádějí v ní místo sloupce výše. Viz [Jednotky, zadávané hodnoty a seznamy jednotek](common:unit-lists).

Při otevření LandXML přebírá projekt jednotky souboru. Soubor v mezinárodních stopách se otevře jako projekt ve stopách; čísla se nemění.

## Zadávání délek a součtů

Každé pole, které přijímá délku nebo výšku, čte víc než prosté číslo: stiskněte {{key:Enter}} a pole ukáže výsledek v jednotkách projektu.

| Zadáte | V projektu ve stopách | V projektu v metrech |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | totéž v metrech |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | v ft | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, ostatní v US survey stopách | totéž v metrech |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | součet, ve ft | součet, v m |

Libovolná značka délky ze sdílené tabulky jednotek funguje s přesnou velikostí: stopy projektu jsou US survey stopy, takže `10 US ft` je 10 a `3 ch` (řetěz z mezinárodní stopy) je 197.9996. Používejte `+ - * /` a závorky, a `abs`, `round`, `ceil` a `floor`. Pomlčka zapsaná do délky je její součástí (`24'-6"`, `6-1/2`); s mezerami kolem ní odečítá (`24' - 6"` = 23.5 ft). Prosté číslo délku násobí nebo dělí a při přičtení k délce je délkou v jednotkách projektu. Pokud CivilCraft nerozumí tomu, co jste zadali, pole se označí a stavový řádek řekne, kde.

Staničení nejsou součty: `10+00` v poli staničení je staničení 10+00. Sklony v procentech, čísla bodů a popisy se čtou tak, jak jsou.

## Staničení

Staničení je vzdálenost podél osy, zapsaná se znaménkem plus:

- Stopy: část před plusem jsou stovky stop. `12+34.56` je 1,234.56 ft.
- Metry: část před plusem jsou tisíce metrů. `1+234.567` je 1,234.567 m.
- Záporná staničení nesou znaménko před sebou: `-0+50.00`.

Kdekoli zadáte staničení (**Počáteční staničení**, **Staničení** PVI), můžete je zadat se plusem (`12+34.56`) nebo jako prosté číslo (`1234.56`). Mezery se ignorují.

## Sklony a svahy

- **Sklony** (profily, potrubí, sklony pruhů a krajnic) jsou v procentech: `+1.25%` stoupá ve směru staničení, `-0.50%` klesá.
- **Sklony svahů** (výkop a násyp plošiny, výkop a násyp koridoru) jsou vodorovně ku svisle: `3` znamená 3 : 1, tři vodorovně na jeden nahoru nebo dolů.
- **K** pro svislý oblouk je jeho délka dělená změnou sklonu v procentech.

## Směrníky a úhly

Směrníky jsou čtvrtové směrníky ve stupních, minutách a sekundách: `N 63°12'05" E`. Úhly oblouků (Δ) používají stejné stupně, minuty a sekundy, s "vlevo" nebo "vpravo".

## Odsazení

Odsazení od osy jsou vzdálenosti kolmo na ni, označené **L** (vlevo) nebo **R** (vpravo) při pohledu po směru staničení.

## Zobrazení čísel

- Souřadnice a výšky se zobrazují s 2 desetinnými místy v panelech a ve stavovém řádku (3 pro vybraný bod zaměření).
- Plochy a objemy jsou seskupeny po tisících: `128,250 sq ft`, `454.9 cu yd`.
- Souřadnice se nikdy neseskupují, aby je bylo možné zkopírovat tak, jak jsou.

## Souřadnice

CivilCraft pracuje v rovinném prostoru: východ doprava, sever nahoru. Projekční práce se vždy dějí v zobrazených souřadnicích (státní rovinná soustava, UTM nebo místní síť). Můžete CivilCraftu říci, v jakém souřadnicovém systému jsou, a zda jde o mřížkové, terénní nebo místní souřadnice; pak zobrazuje zeměpisnou šířku a délku a umisťuje soubory GIS a mapové vrstvy, ale nikdy sám nemění jednotky ani nepřesouvá vaše souřadnice. Viz [Nastavení souřadnicového systému projektu](topic:coordinate-systems) a [Terénní a místní souřadnice](topic:ground-and-local-coordinates). Velké hodnoty státní rovinné soustavy (miliony stop) jsou v pořádku; CivilCraft pro zachování přesnosti interně pracuje vzhledem k lokalitě.
