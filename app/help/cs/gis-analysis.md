---
title: Analýza vrstev GIS
summary: Zóna okolí (buffer), překryv (průnik, sjednocení, vymazání, rozpuštění), prostorové spojení, výběr podle atributu a měření vrstev GIS v projektu, každé jako nová vrstva, kterou lze vrátit zpět.
keywords: gis, analýza, buffer, zóna okolí, překryv, průnik, sjednocení, vymazání, oříznutí, rozpuštění, prostorové spojení, spojení, výběr podle atributu, dotaz, where, výraz, statistika, plocha, délka, obvod, měření, parcely, věcné břemeno, odstup od hranice, shapefile, geopackage, tabulka atributů
from: a6b2d3f9
---

Jakmile projekt obsahuje vrstvy GIS (viz [Import dat GIS](topic:gis-import)), otevře tlačítko **Analyzovat** ve skupině GIS (zadané jako `GISANALYSIS`, `ANALYZE` nebo `BUFFER`) panel s pěti kartami. Zůstává otevřený vedle půdorysu, takže to, co vyberete, se kreslí do půdorysu během práce.

Každý nástroj, který něco vytváří, **přidá novou vrstvu** a vrstvy, ze kterých čte, ponechá beze změny. Každá položka je jeden krok zpět: {{ui:Undo}} v panelu (nebo Ctrl+Z) novou vrstvu odebere. Výsledek exportujte jako každou vrstvu pomocí [Exportovat data skutečného provedení pro GIS](topic:gis-export) jako shapefile, GeoJSON nebo GeoPackage.

Úplná tabulka vrstvy, s řazením, úpravami a kalkulátorem polí, je popsána v [Práce s tabulkou atributů vrstvy](topic:gis-table); barvení podle pole je v [Stylování vrstvy podle atributu](topic:gis-symbology).

Vše se pracuje v půdorysu, v jednotkách projektu (stopy nebo metry). Projekt je vždy v promítnutém nebo místním systému, takže vzdálenost 50 znamená 50 stop nebo 50 metrů, nikdy stupně. Výšky (z) se ve výsledcích neuchovávají.

## Zóna okolí

Vykreslí zónu dané vzdálenosti kolem každého prvku jako novou vrstvu mnohoúhelníků. Body se změní na kružnice, čáry na koridory se zaoblenými konci a mnohoúhelníky se zvětší. **Záporná** vzdálenost mnohoúhelníky zmenší (čtverec 100 × 100 zmenšený o 5 má 90 × 90; zmenšený o 60 nezbude nic a panel to oznámí). Vzdálenost lze vzít z číselného pole, aby měl každý prvek vlastní, nebo zaškrtněte **Sloučit všechny zóny okolí do jednoho tvaru**, čímž je rozpustíte.

Zaoblené části jsou tvořeny přímými úseky vepsanými do skutečné křivky, takže zóna okolí je o vlas menší než přesná kružnice: přibližně o 0.6 % v ploše při běžném nastavení, o 0.16 % při Jemné. Pro cokoli, co budete měřit, použijte Jemné.

## Překryv

| Nástroj | Co dostanete |
|---|---|
| Průnik | Části, kde vstupní vrstva protíná mnohoúhelníky překryvu, každá s poli obou vrstev. Čáry a body jsou oříznuty na mnohoúhelníky. |
| Sjednocení | Obě vrstvy mnohoúhelníků rozřezané podle hran té druhé: sdílené části nesou pole obou vrstev, zbytek nese pole jedné vrstvy (pole druhé jsou prázdná). |
| Vymazání | Vstupní mnohoúhelníky s odečtenými překryvnými mnohoúhelníky. Pole zůstávají u vstupu. Prvek vymazaný úplně se vynechá (panel je počítá). |
| Rozpuštění | Sloučí mnohoúhelníky, které se dotýkají nebo překrývají, buď všechny, nebo jeden tvar pro každou hodnotu pole. Přidá `COUNT` a `AREA`. |

Pole, které mají obě vrstvy pod stejným názvem, se zachová u první vrstvy a pole druhé vrstvy se zapíše s příponou `_2`. Prvky uvnitř jedné vrstvy by se spolu neměly překrývat: kde se překrývají, Sjednocení počítá překryv v obou.

## Spojení

Prostorové spojení zkopíruje atributy ze **zdrojové** vrstvy na každý **cílový** prvek, který se s ní setká, a vytvoří novou vrstvu s tvary cílových prvků. Zvolte, kdy se setkají: dotýkají se nebo překrývají, cílový leží uvnitř zdrojového mnohoúhelníku, cílový obsahuje zdrojový prvek, nejbližší zdrojový prvek (volitelně s limitem), nebo libovolný zdrojový prvek ve vzdálenosti.

Když odpovídá několik zdrojových prvků, vezmete atributy prvního (nejbližšího u spojení nejbližším a podle vzdálenosti; přidá se `DISTANCE`), nebo je **spočítáte a sečtete jejich číselná pole**: `COUNT` a `SUM_`, `MEAN_`, `MIN_`, `MAX_` pro každé číselné pole. Zrušte zaškrtnutí **Ponechat cílové prvky bez shody**, abyste je vynechali. Připojená pole jsou prázdná tam, kde nic neodpovídá, a panel počítá nespárované.

## Výběr

Napište dotaz na atributy nebo tvar, stiskněte **Vybrat** a prvky se vykreslí do půdorysu s jejich počtem, tabulkou a celkovou plochou, délkou nebo číslem. Pak z nich lze vytvořit vlastní vrstvu, přiblížit na ně nebo zrušit výběr.

| Můžete psát | Příklad |
|---|---|
| Pole podle názvu; použijte "uvozovky" nebo [hranaté závorky], pokud název obsahuje mezery | `VALUE`, `"Lot Number"` |
| Čísla, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (text ignoruje velikost písmen; v `like` znamená `%` libovolný úsek a `_` jedno písmeno) | `Notes contains 'corner'` |
| `is null`, `is not null` (prázdná hodnota se počítá jako null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` a závorky | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Hodnoty tvaru `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Neúplný dotaz nebo dotaz s polem, které vrstva nemá, se odmítne větou, která řekne, kde je chyba.

## Měření

Zobrazí celkovou plochu a obvod, délku nebo počet vrstvy a **přidá pole**: `AREA` a `PERIMETER` pro mnohoúhelníky, `LENGTH` pro čáry (délka v půdorysu), `X` a `Y` pro body. Pole, které už existuje, se nikdy nepřepíše: nové se jmenuje `AREA_2`. Je to jeden krok zpět. **Statistika** dá počet, součet, průměr, minimum a maximum číselného pole, volitelně pro každou hodnotu jiného pole.

:::note
Kontroly za těmito nástroji se ověřují ručně v testu (`node bin/test-civilcraft-gisanalysis.mjs`): například parcely 100 × 100 pod zónou 100 × 80 se protnou v 3,000 plus 3,000 a čára dlouhá 100 se zónou okolí 10 má 2,000 plus kruh.
:::
