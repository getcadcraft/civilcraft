---
title: Výběr, kopírování a vkládání průzkumných bodů
summary: Vybírejte průzkumné body kliknutím, klávesou Shift a rámečkem nebo všechny najednou; kopírujte, vyjměte, vložte, vložte na stejné místo, duplikujte a smažte je s novými čísly bodů, která se nikdy nekříží; vkládejte řádky bodů do tabulky a z ní.
keywords: kopírovat, vložit, vyjmout, duplikovat, smazat body, vybrat body, vybrat vše, výběr rámečkem, okno, schránka, tabulka, csv, přečíslovat, čísla bodů, vložit na stejné místo, klon, vytyčení
from: 78a6aea7
---

Průzkumné body lze kopírovat a vkládat uvnitř projektu, mezi projekty ve dvou záložkách prohlížeče a do tabulky a z ní. Každá změna je jeden krok zpět a povrch se hned přestaví z nových bodů.

## Výběr bodů

Pomocí {{ui:Select}} ({{key:V}}):

- **Klikněte** na bod, aby se vybral (jen on). Jeho čísla se ukážou v **Vlastnostech**.
- {{key:Shift}} a **klik** přidá bod do výběru nebo ho z něj odebere.
- {{key:Shift}} a **tažení** nakreslí rámeček: body uvnitř se přidají do výběru. Tažení kolem bodů místo toho vytvoří lasso; viz [Výběr body lasem](topic:lasso-selection). Tažení bez {{key:Shift}} posouvá pohled, jako vždy.
- {{key:Mod+A}} (nebo {{ui:More}} › {{ui:Select all points}}) vybere všechny body.
- {{key:Esc}} (nebo {{ui:More}} › {{ui:Select none}}) zruší výběr.

Vybrané body mají kroužek. Pokud je vybráno víc bodů, **Vlastnosti** ukážou jejich počet, čísla, rozsah výšek a skupiny.

## Kopírování, vyjmutí a mazání

- {{ui:Copy}} nebo {{key:Mod+C}} zkopíruje vybrané body. CivilCraft si kopii ponechá a také ji vloží do systémové schránky jako řádky bodů, takže ji lze rovnou vložit do tabulky nebo textového souboru.
- {{ui:More}} › {{ui:Cut}} nebo {{key:Mod+X}} je zkopíruje a zároveň smaže, v jednom kroku.
- {{ui:More}} › {{ui:Delete}} nebo {{key:Delete}} je smaže. {{key:Mod+Z}} je vrátí zpět.

Řádky jsou bod, Y, X, výška, popis (P,N,E,Z,D), oddělené čárkami, s třemi desetinnými místy. Chcete-li mít X před Y, nastavte **Řádky bodů** v [nastavení CivilCraftu](topic:settings). Popis, který by tabulka chápala jako vzorec (začíná na =, +, - nebo @), dostane před sebe apostrof, aby zůstal textem.

## Vložení

1. Stiskněte {{key:Mod+V}} nebo klikněte na {{ui:Paste}}. Body následují kurzor jako malé křížky s tečkovanou čárou zpět k místu, odkud přišly.
2. Klikněte, kam mají jít. Střed zkopírovaných bodů dopadne na místo kliknutí.
3. Nebo stiskněte {{key:Enter}}, aby se body vložily na vlastní souřadnice, či {{key:Esc}} pro zrušení.

{{ui:More}} › {{ui:Paste in place}} nebo {{key:Mod+Shift+V}} vloží body rovnou na jejich vlastní souřadnice. Vložené body se poté vyberou, takže je lze znovu kopírovat, přesouvat nebo mazat.

:::note
Kliknutí na {{ui:Paste}} na panelu nástrojů čte systémovou schránku. Prohlížeč se může při prvním použití zeptat, zda smí CivilCraft schránku vidět. Pokud to odmítnete, tlačítko na panelu vloží jen vlastní kopii CivilCraftu; {{key:Mod+V}} pořád vloží řádky z tabulky bez dotazu.
:::

## Čísla bodů se nikdy nekříží

Dva body nikdy nesdílejí číslo. Při vkládání:

- Vložený bod si ponechá své číslo, pokud ho v projektu žádný bod nemá. Po **Vyjmout** se tedy body vloží zpět s vlastními čísly a body zkopírované z jiného projektu si svá čísla ponechají, pokud jsou volná.
- Vložený bod, jehož číslo je obsazené, dostane nové celé číslo: o jedno vyšší než nejvyšší používané číslo, počítáno nahoru.
- Stavový řádek říká, co se stalo, například „1 si ponechal číslo; 9 dostalo nová čísla: 10–18 se změnilo na 277–285“.

V [nastavení CivilCraftu](topic:settings) můžete zvolit **Vždy nová čísla** a číslo, od kterého se nová čísla začínají počítat, například 5000 pro návrhové body.

:::warning
Skupiny bodů, které z povrchu tvoří **lomovou hranu**, spojují své body v pořadí čísel. Vložené kopie bodů lomové hrany (například body FL) dostanou nová, vyšší čísla a připojí se na konec té lomové hrany, případně s dlouhým skokem. Po vložení takových bodů zkontrolujte plán, nebo nastavte jejich skupinu na {{ui:Points}}.
:::

## Duplikace

{{ui:More}} › {{ui:Duplicate}} nebo {{key:Mod+D}} vytvoří kopii vybraných bodů, která následuje kurzor: klikněte, kam má jít. Kopie vždy dostanou nová čísla a schránka CivilCraftu zůstane beze změny.

## Z tabulky nebo textového souboru

Vyberte řádky bodů v tabulce (bod, Y, X, výška, popis) a zkopírujte je. V CivilCraftu stiskněte {{key:Mod+V}} a klikněte, kam mají jít, nebo stiskněte {{key:Mod+Shift+V}} pro vložení na jejich vlastní souřadnice, což je obvykle to, co chcete u skutečných dat zaměření.

Řádky se čtou přesně jako [soubor bodů](topic:point-file-formats): čárky, tabulátory nebo mezery, řádek záhlaví, pokud existuje. Bez záhlaví určí pořadí sloupců **Řádky bodů** v [nastavení CivilCraftu](topic:settings).

Když jsou k dispozici obojí, CivilCraft rozhodne podle toho, co je novější: řádky v systémové schránce, které se liší od poslední kopie CivilCraftu, byly zkopírovány později, takže se vloží. Text, který žádné body neobsahuje, se ignoruje a místo něj se vloží kopie CivilCraftu.

## Mezi projekty a záložkami

Kopie zůstává v tomto prohlížeči, takže ji může vložit druhá záložka CivilCraftu, i když se první záložka zavře. Body zkopírované v projektu v metrech a vložené do projektu ve stopách si ponechají svá čísla beze změny: nic se nepřevádí a stavový řádek to říká.

## Co se nekopíruje

Zatím se kopírují jen průzkumné body. Osy tras, plošiny, potrubní sítě, lomové hrany a hranice zatím nelze kopírovat ani vkládat. Vložení nemůže přesunout existující body: použijte {{ui:Cut}} a vložení, nebo přesouvejte body po jednom ([Úprava průzkumného bodu](topic:edit-points)).
