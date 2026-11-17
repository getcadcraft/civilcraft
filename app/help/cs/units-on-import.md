---
title: Jednotky při importu: soubor udává své jednotky, nebo se nejprve zeptáme
summary: Když výkres nebo síť, kterou přinesete do projektu, uvádí své jednotky, CivilCraft je převede a řekne to. Když je neuvádí, CivilCraft se před načtením zeptá a zapamatuje si vaši odpověď pro daný soubor.
keywords: jednotky, import, DWG, DXF, STL, OBJ, zaměření, stopy, US survey stopy, metry, milimetry, měřítko, špatná velikost, příliš velký, příliš malý, zeptat se, zapamatováno, INSUNITS, jednotky výkresu
from: 60921963
---

## Co budete dělat

Přinesete soubor do projektu a ujistíte se, že se načte ve správné velikosti.

## Postup

1. Otevřete soubor obvyklým způsobem: {{ui:Otevřít}}, přetáhněte jej na plán, nebo použijte příkaz pro CAD výkres.
2. Pokud soubor uvádí své jednotky, nic se nepožaduje: dialog importu je zobrazí jako **Podle výkresu**.
3. Pokud je neuvádí, dialog se před otevřením dialogu importu zeptá na **Jednotky** souboru. Zvolte, čím je jedna jednotka v souboru, a klikněte na {{ui:Použít tyto jednotky}}.
4. {{ui:Zrušit}} (nebo {{key:Esc}}) soubor přeskočí. Nic z něj se do projektu nenačte.

## Které soubory uvádějí své jednotky

- **DWG a DXF**: jednotky vložení výkresu (`$INSUNITS`). Soubor bez nich se ptá. Seznam **Jednotky výkresu** v dialogu importu začíná na vaší odpovědi a lze jej ještě změnit.
- **STL a OBJ** (volné tvary terénu): nikdy neuvádějí jednotky. Ptáme se.
- **Seznamy bodů** (CSV, TXT) a seznamy z průzkumů: seznam, který uvádí svou jednotku v prvních řádcích, se převede a stavový řádek to řekne. Seznam, který žádnou neuvádí, se zeptá, když stisknete {{ui:Importovat}}, dříve než body vstoupí do projektu. Sloupce zeměpisné šířky a délky místo toho procházejí souřadnicovým systémem.
- **Doplněk Mračna bodů**: zeptá se, když sestavujete mrak, jehož soubor nemá uvedenou jednotku, a čísla mraku označí jednotkou, kterou nese.
- **IFC a LandXML**: uvádějí své jednotky; převedou se na jednotky projektu.
- **LAS, LAZ a výškové rastry**: umisťují se podle svého souřadnicového systému; dialog terénu se zeptá na jednotku výšky, pokud soubor neuvádí.

## Dobré vědět

- Odpověď se pro daný soubor zapamatuje na tomto počítači ve všech aplikacích CadCraftu. Příště, když soubor přijde, se neptáme.
- Chcete-li být znovu dotázáni: paleta příkazů ({{key:Mod+K}}) › **Znovu se zeptat na jednotky importovaných souborů**.
- Jednotka, kterou seznam uvádí, se čte z prvních osmi řádků: řádek jako `units: ft`, nebo nadpisy sloupců, které nesou stejnou jednotku v závorkách, například `Elevation (m)`.
