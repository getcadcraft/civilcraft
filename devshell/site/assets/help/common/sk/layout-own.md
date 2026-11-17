---
title: Usporiadajte vlastné rozloženie a uložte si nastavenia
summary: Zvoľte, ktorý panel zobrazuje prehliadač projektu, Vlastnosti alebo vlastný obsah panela, kam pôjde súprava nástrojov a čo obsahujú lišty, uložte to ako vlastné rozloženie a celé nastavenia si uchovajte pod názvom, medzi ktorými môžete prepínať.
keywords: rozloženie, pracovný priestor, usporiadať, prispôsobiť, moje rozloženie, vlastné rozloženie, panely, editory, prehliadač projektu, vlastnosti, súprava nástrojov, rýchly panel, informačné pole, pracovné prostredie, nastavenie, profil, uložiť nastavenie, prepnúť nastavenie, exportovať nastavenie, importovať nastavenie, ccenv
from: 6af528e0
---

Okrem troch vstavaných rozložení môžete usporiadať vlastné rozloženie a celé nastavenie uložiť pod názvom, aby ste sa k nemu mohli vrátiť jedným krokom.

## Usporiadanie vlastného rozloženia

1. Otvorte {{ui:Nastavenia}} (ozubené koliesko alebo {{key:Mod+,}}), vyberte {{ui:Globálne}} a potom {{ui:Rozloženie}}.
2. Vyberte {{ui:Usporiadať vlastné rozloženie…}}. Dialógové okno začína od rozloženia, ktoré používate teraz.
3. Pomenujte ho a potom zvoľte:
   - **Nad výkresom:** panel nástrojov aplikácie, pás kariet alebo nič z toho; lišta s názvom; informačné pole a ovládacie prvky, ktoré obsahuje.
   - **Vedľa výkresu:** súprava nástrojov vľavo, vpravo alebo vôbec, s {{ui:Moje nástroje}} alebo bez nich; ktorý panel drží palety, ktorý je navrchu (napríklad prehliadač projektu alebo Vlastnosti) a ktoré sú pod ním ako karty.
   - **Oblasť výkresu:** karty zobrazení, rýchly panel a panel zobrazenia s ovládacími prvkami, ktoré označíte, paleta úprav, stavový riadok.
   - **Vzhľad:** veľkosť, obrysy tlačidiel a štýl kariet.
4. Vyberte {{ui:Použiť toto rozloženie}}. Aplikácia sa naň okamžite prepne a rovnako ho použijú všetky aplikácie, ktoré majú rozloženia.

Ponúka sa len to, čo má táto aplikácia. Vaše rozloženie je uvedené pod {{ui:Z doplnkov a súborov}}; {{ui:Exportovať toto rozloženie}} ho uloží ako súbor, ktorý môžete dať kolegovi, a tlačidlo odstrániť ho odstráni. Panely, ktoré vypĺňa, sa stále ukotvujú, plávajú a presúvajú do vlastných okien, ako je uvedené v časti [Usporiadanie panelov](common:arrange-panels).

## Uloženie nastavenia ako pracovného prostredia

Pracovné prostredie je celé Vaše nastavenie pre každú aplikáciu v tomto prehliadači: rozloženie, štýl ponuky a klávesy, štýl panela nástrojov, panely a ich veľkosti a {{ui:Moje nástroje}}. Motív a jazyk do neho nepatria.

- **Uložiť:** zadajte názov pod {{ui:Pracovné prostredia}} a vyberte {{ui:Uložiť moje nastavenie}}. Uloženie pod existujúcim názvom nahradí toto nastavenie.
- **Prepnúť:** v zozname vyberte nastavenie a zvoľte {{ui:Prepnúť naň}}. Aplikácia sa v tomto nastavení znovu načíta; ak máte neuloženú prácu, aplikácia sa najprv opýta, ako pri každom znovunačítaní.
- **Zdieľať:** {{ui:Exportovať}} uloží vybrané nastavenie ako súbor `.ccenv.json`; {{ui:Importovať nastavenie…}} pridá nastavenie zo súboru. Súbor nastavuje iba tieto voľby a nič iné.
- **Odstrániť:** vyberte nastavenie a zvoľte {{ui:Odstrániť}}.

Môžete mať uložených až dvanásť nastavení.

Ak chcete rozloženie zmeniť bez otvorenia dialógu (potiahnutím bloku, pravým tlačidlom na nástroj), pozrite [Zmena rozloženia na obrazovke](common:layout-edit). Ak chcete najprv vyskúšať vstavané usporiadania, pozrite [rozloženie so súpravou nástrojov a informačným poľom](common:layout-toolbox), [rozloženie s pásom kariet a prehliadačom projektu](common:layout-ribbon) a [rozloženie Kreslenie](common:layout-drafting).
