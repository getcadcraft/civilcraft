---
title: Práce s tabulkou atributů vrstvy
summary: Zobrazte každý prvek vrstvy GIS jako tabulku, řaďte a filtrujte ji, vybírejte řádky a prvky společně, opravujte hodnoty, přidávejte pole, počítejte nové hodnoty a ukládejte tabulku jako CSV.
keywords: tabulka atributů, tabulka, pole, sloupce, řádky, řazení, filtr, výraz, výběr, úpravy, kalkulátor polí, počítat, přidat pole, přejmenovat pole, odebrat pole, csv, export, gis, shapefile, geopackage, symbologie
from: fd9d6c11
---

Otevřete tabulku vrstvy z nabídky **tři tečky** v seznamu vrstev GIS ({{ui:Attribute table…}}), z Povrch › {{ui:More}} › {{ui:Attribute table}}, nebo napsáním `ATTRIBUTES`, `ATTTABLE` nebo `TABLE`. Tabulka se otevře vedle půdorysu a zůstává otevřená při práci. Vykreslují se jen řádky, které vidíte, takže vrstva s tisíci prvky se otevře a posouvá rychle.

## Řazení, filtr a výběr

- **Řazení:** klikněte na nadpis sloupce. Druhé kliknutí obrátí pořadí, třetí vrátí pořadí souboru. Prázdné hodnoty zůstávají vždy dole. Řazení mění jen to, co vidíte, nikdy vrstvu.
- **Filtr:** pište do filtračního pole. Výraz jako `AREA > 500 and USE = 'Res'` nechá řádky, kde platí (stejná slova jako na kartě Výběr v [Analýza vrstev GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Cokoli, co není výraz, například `oak maple`, hledá ta slova v každém sloupci.
- **Výběr řádků:** klikněte na řádek. Ctrl+klik přidá nebo odebere jeden, Shift+klik vybere souvislou řadu a {{ui:Select shown rows}} vybere všechny řádky, které procházejí filtrem. Vybrané prvky se kreslí v půdorysu a klik na prvek v půdorysu vybere jeho řádek zde.
- S vybranými řádky můžete {{ui:Zoom}} na ně, vytvořit **vrstvu z výběru** a přečíst celkovou plochu nebo délku ve stavovém řádku.

## Oprava hodnot

Dvakrát klikněte na buňku (nebo se na ni přesuňte šipkami a stiskněte Enter), napište novou hodnotu a stiskněte Enter. Escape ji nechá, jak byla. Hodnota musí odpovídat sloupci: čísla jako čísla, data jako `YYYY-MM-DD`, ano/ne jako yes, no, true nebo false. Hodnota, která nesedí, se odmítne větou a nic se nezmění. Prázdné pole udělá hodnotu prázdnou. Každá úprava je jeden krok zpět: {{ui:Undo}} a {{ui:Redo}} jsou dole v tabulce a Ctrl+Z funguje v půdorysu.

## Pole

V části **Pole** můžete přidat pole (text, číslo, datum nebo ano/ne), přejmenovat jedno, nebo jedno odebrat. Nové pole začíná prázdné. Přejmenování se propíše: popisové pole a [stylování podle atributu](topic:gis-symbology) vrstvy přejdou na nový název, a odebrání pole zruší popisek a styl, které ho používaly. Každá položka je jeden krok zpět, který vrátí všechno.

## Kalkulátor polí

Zapíše hodnotu do každého řádku (nebo jen do vybraných řádků) z ostatních polí řádku, jeho geometrie a několika funkcí. Vyberte existující pole, nebo **Nové pole…** a zadejte jeho název a typ. Nic se nespouští jako kód: výraz čte malý analyzátor s pevným seznamem funkcí.

| Skupina | Slova |
|---|---|
| Čísla | `+ - * /`, závorky, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (text se dává do 'jednoduchých uvozovek'; název pole s mezerami do "dvojitých uvozovek" nebo [hranatých závorek]) |
| Výběr | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Data | `year month day` hodnoty `YYYY-MM-DD` |
| Geometrie | `$area $perimeter $length $x $y $vertices`, v jednotkách projektu |

Výsledek, který nejde uložit do typu pole (text v číselném poli), zůstane prázdný a počítá se ve zprávě. Dělení nulou dá prázdnou hodnotu. Například `round($area / 43560, 2)` zapíše akry ze čtverečních stop.

## Export

{{ui:Export CSV}} uloží řádky, které vidíte (po filtru a řazení), jako soubor CSV v kódování UTF-8 s názvy polí na prvním řádku. Text, který začíná `=`, `+`, `-` nebo `@`, dostane úvodní apostrof, aby ho tabulkový procesor nespustil jako vzorec. Chcete-li uložit samotnou vrstvu, použijte [Exportovat data skutečného provedení pro GIS](topic:gis-export).

## Omezení

Tabulka zobrazuje vrstvu v jediném pořadí řazení a jednom filtru najednou. Řádky zde nelze přidávat ani mazat (vytvořte místo toho novou vrstvu z výběru), geometrie se neupravuje a typ pole nelze změnit po jeho vytvoření.
