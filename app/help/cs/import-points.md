---
title: Import zaměřených bodů
summary: Otevřete soubor bodů CSV nebo textový, zkontrolujte pořadí sloupců v dialogu Import bodů, opravte řádky, které nelze přečíst, a roztřiďte body do skupin.
keywords: import bodů, csv, txt, pnezd, penzd, soubor bodů, zaměření, body cogo, skupiny bodů, sloupce, sever, východ
from: ad33d88a
---

Soubor bodů je textový soubor s jedním bodem na řádek: číslo bodu, sever, východ, výška a popis v libovolném pořadí, oddělené čárkami, tabulátory, středníky nebo mezerami. CivilCraft ho čte v prohlížeči a hned z něj vytvoří povrch.

## Před začátkem

- Znejte pořadí sloupců, pokud ho znáte (PNEZD a PENZD vypadají pro počítač stejně).
- Znejte jeho jednotky. CivilCraft je nepřevádí: nastavte **Jednotky** v levém panelu tak, aby odpovídaly souboru (viz [Jednotky, staničení a formáty čísel](topic:units-and-stations)).
- Souřadnice mohou být velké (souřadnice státní roviny v milionech jsou v pořádku).

## Import souboru

1. Klikněte na {{ui:Otevřít}} v panelu nástrojů, nebo stiskněte {{key:Mod+O}}, a vyberte soubor. Můžete ho také přetáhnout na půdorys.
   Otevře se dialog **Import bodů** s názvem souboru, seznamem **Sloupce** nastaveným na {{ui:Zjistit}}, řádkem souhrnu a prvními šesti body.
2. Přečtěte řádek souhrnu. Říká, kolik bodů bylo načteno, v jakém pořadí sloupců, jak bylo pořadí zjištěno a co odděluje sloupce. Pořadí se zjišťuje třemi způsoby:
   - "z řádku záhlaví": první řádek pojmenovává své sloupce (Bod, Sever, Východ, Výška, Popis, nebo X, Y, Z …). To je nejbezpečnější.
   - "podle vašeho výběru": pořadí jste zvolili v **Sloupce**.
   - "odhadnuto z počtu sloupců a nastavení řádku bodu (PNEZD) – zkontrolujte, zda nejsou sever a východ zaměněny": záhlaví nebylo použitelné. Pokud vaše soubory obvykle začínají východem, nastavte **Řádky bodů** na P, E, N, Z, D v [nastavení CivilCraft](topic:settings).
3. Zkontrolujte náhledovou tabulku. Její sloupce jsou vždy **Bod**, **Sever**, **Východ**, **Výška**, **Popis**, ať je pořadí v souboru jakékoli. Sever a východ skutečné lokality se obvykle velikostně výrazně liší: pokud vypadají zaměněné, odhad byl špatný.
4. Je-li pořadí špatné, vyberte správné v **Sloupce** (například {{ui:PENZD — bod, východ, sever, výška, popis}}). Souhrn a náhled se hned aktualizují.
5. Pod náhledem najděte **Nenačtené řádky**. Každý řádek uvádí číslo řádku v souboru, důvod a začátek řádku. Viz [Řádky, které nejsou načteny](topic:import-points#rows-that-are-not-read).
6. Klikněte na {{ui:Import}}.
   Body se objeví na půdorysu, pohled se k nim přiblíží a povrch se vytvoří. Stavový řádek hlásí například "Importováno 276 bodů ze souboru site.csv; povrch: 546 trojúhelníků."

Nemá-li projekt ještě název, převezme název souboru.

## Kontrola skupin

Každý bod patří do skupiny pojmenované podle **prvního slova jeho popisu**, velkými písmeny: "GRD", "FL 12" a "fl" jsou skupiny GRD, FL a FL. Body bez popisu jdou do "(bez popisu)".

1. V tabulce pod **Body** v levém panelu vidíte skupinu, počet bodů a volbu **Povrch**.
2. Každá skupina začíná jako {{ui:Points}}. Spádnice, hrany vozovek, horní a spodní hrany svahů, hřebeny a podobné kódované čáry změňte na {{ui:Lomová hrana}}. Skupiny, které nemají tvarovat terén (kontrolní body, vrcholy stromů, sloupy vedení zaměřené nahoře), nastavte na {{ui:Vynecháno}}.
3. Klikněte na bod v půdorysu (s {{ui:Výběr}}), aby se v pravém panelu zobrazila jeho číslo, souřadnice, výška, popis a skupina.

:::warning
Skupina lomové hrany spojí **všechny** své body do **jedné** čáry, v pořadí podle čísla bodu. To funguje, když byla každá kódovaná čára zaměřena po pořadí se svým vlastním kódem. Dvě oddělené spádnice se stejným kódem "FL" se stanou jednou čárou klikatící se mezi nimi. Používáte-li sdílené kódy, použijte nástroj {{ui:Lomová hrana}} a klikněte na body každé čáry (viz [Sestavení a upřesnění povrchu](topic:build-surface)).
:::

## Řádky, které nejsou načteny

| Zobrazený důvod | Co to znamená | Co udělat |
|---|---|---|
| "northing or easting is not a number" | Sloupec souřadnic obsahuje text | Zkontrolujte pořadí sloupců, nebo zbloudilý textový řádek uprostřed souboru |
| "elevation is not a number" | Sloupec výšky obsahuje text | Špatné pořadí sloupců, nebo popis ve sloupci výšky |
| "no point number" | Sloupec bodu je prázdný | Očíslujte bod, nebo zvolte pořadí bez P (NEZD, NEZ …): body se pak číslují 1, 2, 3 … |
| "point 12 appears twice (the first one is kept)" | Dva řádky sdílejí číslo | Přečíslujte jeden z nich v souboru, jsou-li oba skutečná zaměření |
| "3 columns, expected 5 (PNEZD)" | Řádek je krátký | Přerušený řádek, nebo špatné pořadí sloupců |

Bod s prázdnou výškou se zachová, ale v povrchu se nepoužije. Údaje **Body** ukazují, kolik bodů má výšku.

Řádky začínající `#`, `;` nebo `//` jsou komentáře a přeskočí se. Prázdné řádky se také přeskočí.

## Nahradit nebo přidat body

Opětovný import **nahradí** všechny body; nepřidá k nim. Vaše osy, plošiny, potrubí, nakreslené lomové hrany a hranice zůstanou. Historie zpět se vymaže, takže pokud možná budete chtít staré body zpět, nejdřív projekt uložte. Chcete-li spojit dva soubory, spojte je před importem v textovém editoru nebo tabulkovém procesoru (dávejte pozor na opakovaná čísla bodů).

Body zatím nelze v CivilCraftu přesouvat, upravovat ani mazat. Opravte je v souboru a importujte znovu.

## Související

- [Formáty souborů bodů](topic:point-file-formats): každé pořadí sloupců a jak se rozpoznávají záhlaví.
- [Sestavení a upřesnění povrchu](topic:build-surface).
