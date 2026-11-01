---
title: Usporiadanie vlastného rozloženia a ukladanie nastavení
summary: Vyberte, ktorý panel ukazuje prehliadač projektu, Vlastnosti alebo vlastný obsah panela, kde bude súprava nástrojov a čo budú obsahovať panely, uložte to ako vlastné rozloženie a uchovajte celé nastavenia pod názvom, aby ste medzi nimi mohli prepínať.
keywords: rozloženie, pracovný priestor, usporiadať, prispôsobiť, moje rozloženie, vlastné rozloženie, panely, editory, prehliadač projektu, vlastnosti, súprava nástrojov, rýchly panel, informačné pole, pracovné prostredie, nastavenie, profil, uložiť nastavenie, prepnúť nastavenie, exportovať nastavenie, importovať nastavenie, ccenv
from: 2a71af43
---

Okrem troch vstavaných rozložení môžete usporiadať jedno vlastné a celé svoje nastavenie uložiť pod názvom, aby ste sa naň mohli vrátiť jedným krokom.

## Usporiadanie vlastného rozloženia

1. Otvorte {{ui:Nastavenia}} (ozubené koliesko alebo {{key:Mod+,}}), vyberte {{ui:Globálne}} a potom {{ui:Rozloženie}}.
2. Vyberte {{ui:Usporiadať vlastné rozloženie…}}. Dialógové okno začne od rozloženia, ktoré práve používate.
3. Zadajte názov a potom vyberte:
   - **Nad výkresom:** panel nástrojov aplikácie, pás kariet alebo nič; záhlavie okna; informačné pole a ovládacie prvky, ktoré obsahuje.
   - **Vedľa výkresu:** súpravu nástrojov vľavo, vpravo alebo vôbec, s položkou {{ui:Moje nástroje}} alebo bez nej; ktorý panel obsahuje palety, ktorý je navrchu (napríklad prehliadač projektu alebo Vlastnosti) a ktoré sú pod ním ako karty.
   - **Oblasť výkresu:** karty pohľadov, rýchly panel a panel pohľadu s ovládacími prvkami, ktoré označíte, paletu úprav, stavový riadok.
   - **Vzhľad:** veľkosť, obrysy tlačidiel a štýl kariet.
4. Vyberte {{ui:Použiť toto rozloženie}}. Aplikácia sa naň okamžite prepne a používa ho aj každá ďalšia aplikácia, ktorá má rozloženia.

Ponúka sa len to, čo táto aplikácia má. Vaše rozloženie je uvedené v časti {{ui:Z doplnkov a súborov}}; {{ui:Exportovať toto rozloženie}} ho uloží ako súbor, ktorý môžete dať kolegovi, a tlačidlo odstránenia ho odstráni. Panely, ktoré vypĺňa, sa stále dajú ukotviť, nechať plávať a presunúť do vlastných okien, ako v téme [Usporiadanie panelov](common:arrange-panels).

## Uloženie nastavenia ako pracovného prostredia

Pracovné prostredie je Vaše celé nastavenie pre každú aplikáciu v tomto prehliadači: rozloženie, štýl ponúk a Vaše klávesy, štýl panela nástrojov, panely a ich veľkosti a {{ui:Moje nástroje}}. Motív a jazyk jeho súčasťou nie sú.

- **Uložiť:** zadajte názov v časti {{ui:Pracovné prostredia}} a vyberte {{ui:Uložiť moje nastavenie}}. Uloženie pod existujúcim názvom toto nastavenie nahradí.
- **Prepnúť:** vyberte nastavenie v zozname a zvoľte {{ui:Prepnúť naň}}. Aplikácia sa načíta znova v tomto nastavení; ak máte neuloženú prácu, aplikácia sa najprv opýta, ako pri každom opätovnom načítaní.
- **Zdieľať:** {{ui:Exportovať}} uloží vybrané nastavenie ako súbor `.ccenv.json`; {{ui:Importovať nastavenie…}} pridá nastavenie zo súboru. Súbor nastavuje len tieto voľby, nič iné.
- **Odstrániť:** vyberte nastavenie a zvoľte {{ui:Odstrániť}}.

Môžete mať najviac dvanásť nastavení.

Na vyskúšanie vstavaných usporiadaní si najprv pozrite [rozloženie so súpravou nástrojov a informačným poľom](common:layout-toolbox) a [rozloženie s pásom kariet a prehliadačom projektu](common:layout-ribbon).
