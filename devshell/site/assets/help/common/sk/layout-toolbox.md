---
title: Pracujte s rozložením so súpravou nástrojov a informačným poľom
summary: Prepnite aplikáciu na stĺpec nástrojov vľavo s miestami pre vlastné nástroje, informačné pole navrchu, ktoré sleduje bežiaci nástroj alebo Váš výber, navigátor vpravo, kartu pre každé zobrazenie, rýchle možnosti a paletu úprav. Kedykoľvek sa môžete vrátiť ku klasickému rozloženiu.
keywords: rozloženie, pracovný priestor, súprava nástrojov, stĺpec nástrojov, informačné pole, informačný panel, navigátor, mapa projektu, rýchly panel, rýchle možnosti, paleta úprav, moje nástroje, obľúbené nástroje, karty zobrazení, okno súpravy nástrojov, klasické rozloženie, zmeniť rozloženie, prepnúť rozloženie
from: ec341666
---

**Súprava nástrojov a informačné pole** je jedno z troch pracovných rozložení aplikácie. Nástroje na kreslenie stoja v stĺpci vľavo, informačné pole navrchu zobrazuje, čo beziaci nástroj potrebuje alebo čo ste vybrali, každé zobrazenie má kartu a rýchly panel pod výkresom obsahuje niekoľko bežných možností. Nástroje sú vlastné nástroje aplikácie: všetko, čo viete robiť v klasickom rozložení, funguje aj tu, a Váš výkres, štýl ponuky a klávesy zostávajú rovnaké.

## Výber

1. Otvorte {{ui:Nastavenia}} (ozubené koliesko alebo {{key:Mod+,}}).
2. Vyberte kartu {{ui:Globálne}} a potom prejdite na {{ui:Rozloženie}} › {{ui:Pracovný priestor}}.
3. Vyberte {{ui:Súprava nástrojov a informačné pole}}.

Rozloženie sa zmení okamžite. Voľba platí pre každú aplikáciu v tomto prehliadači: každá aplikácia sa v nej od tej chvíle otvára a je pripravená ešte pred vykreslením stránky, takže nikdy neuvidíte najprv klasické rozloženie.

## Kde je čo

- **Panel nástrojov:** vlastný panel nástrojov aplikácie zostáva navrchu oblasti výkresu, aj s jej ponukami.
- **Informačné pole:** pod panelom nástrojov. Keď beží nástroj, ukazuje nástroj a to, čo žiada. Keď niečo vyberiete, ukazuje jeho hlavné nastavenia (pri múre: jeho typ, hrúbku, dĺžku, líniu umiestnenia a výšku) a môžete ich meniť priamo tam: zmena tam je rovnaká ako vo Vlastnostiach a {{key:Mod+Z}} ju vráti späť. Keď nič nie je vybrané, zobrazí "Nič nie je vybrané". Každá aplikácia sem pridáva vlastné polia, napríklad aktuálnu hladinu alebo úroveň, alebo otvorený dokument.
- **Súprava nástrojov:** stĺpec vľavo, nástroje aplikácie v skupinách. Kliknutím na názov skupiny ju zbalíte alebo znova otvoríte. Bežiaci nástroj svieti.
- **Moje nástroje:** prvá skupina súpravy nástrojov, osem prázdnych miest pre nástroje, ktoré používate najviac. Kliknutím na prázdne miesto vyberte ľubovoľný nástroj alebo príkaz aplikácie; alebo kliknite pravým tlačidlom na nástroj v súprave a vyberte {{ui:Pridať do Mojich nástrojov}}; alebo presuňte nástroj na miesto. Pravým tlačidlom kliknite na miesto, ak ho chcete zmeniť alebo vyprázdniť. Vaše miesta sa uchovávajú pre každú aplikáciu v tomto prehliadači.
- **Navigátor:** pravý panel. Prehliadač projektu aplikácie je navrchu (pôdorysy, rezy, pohľady, 3D zobrazenia, tabuľky, listy, podľa toho, čo aplikácia má): kliknutím na jeden ho otvoríte. Pod ním sú {{ui:Vlastnosti}} a karta s ostatným obsahom pravého panela.
- **Karty zobrazení:** karta pre každé zobrazenie otvoreného súboru (list, pôdorys, scéna…) nad výkresom.
- **Rýchly panel:** pod výkresom nastavenia zobrazenia a bežné možnosti, ktoré aplikácia má, napríklad mierka, úroveň podrobností, rozsah zobrazenia, prispôsobiť, pôdorys, rozdeliť alebo 3D, uchopenia a jednotky.
- **Paleta úprav:** kliknite na niečo vo výkrese a pri kurzore sa objaví malá paleta s úpravovými príkazmi aplikácie pre daný objekt, napríklad presunúť, kopírovať, otočiť, zrkadliť, duplikovať alebo zmazať, a {{ui:Vlastnosti}}. {{key:Esc}}, koliesko myši, ďalšie kliknutie alebo jej tlačidlo zatvorenia ju zatvoria.

Nástroj, ktorý teraz nemôže bežať, je sivý a jeho popisok vysvetlí prečo. Kliknite naň alebo na ňom stlačte {{key:Enter}}, aby ste si dôvod prečítali v okne.

{{key:Esc}} najprv ukončí bežiaci nástroj, ako v klasickom rozložení, a každá klávesová skratka aj {{key:Ctrl+Shift+F}} (režimy obrazovky) fungujú ako predtým.

## Vlastné okno pre súpravu nástrojov

Tlačidlo {{ui:Presunúť súpravu nástrojov}} navrchu súpravy má {{ui:Presunúť do nového okna}}: súprava nástrojov sa otvorí v úzkom vlastnom okne, ktoré môžete dať vedľa aplikácie alebo na druhý monitor. Klávesy stlačené tam idú do aplikácie. {{ui:Vrátiť súpravu nástrojov späť}} alebo zatvorenie tohto okna ju vráti domov.

Nastavenia panela nástrojov platia aj pre súpravu nástrojov: {{ui:Nastavenia}} › {{ui:Globálne}} › {{ui:Panel nástrojov}} › {{ui:Ikony a popisy}}, {{ui:Iba ikony}} alebo {{ui:Iba popisy}}, a {{ui:Zobraziť názvy skupín (Súbor, Kreslenie, …)}}.

## Vaše panely zostávajú Vašimi

Ľavý a pravý panel si zachovávajú všetko, čo je opísané v časti [Usporiadanie panelov](common:arrange-panels): ukotvenie, plávanie, pripnutie, skrytie, karty, {{ui:Presunúť do nového okna}} a {{ui:Obnoviť rozloženie}}.

## Návrat ku klasickému rozloženiu

Otvorte {{ui:Nastavenia}} › {{ui:Globálne}} › {{ui:Rozloženie}} › {{ui:Pracovný priestor}} a vyberte {{ui:Klasické CadCraft}}. Každý panel nástrojov, karta a panel sa vrátia tam, kde boli.

:::note
V telefóne alebo v okne široko 760 pixelov alebo menej aplikácia použije rozloženie pre telefón bez ohľadu na to, čo ste vybrali. Širšie okno Vaše rozloženie vráti.
:::

Ak chcete vyskúšať iné usporiadanie, pozrite [rozloženie s pásom kariet a prehliadačom projektu](common:layout-ribbon).

Ak chcete zmeniť, čo toto rozloženie zobrazuje, pozrite [Zmena rozloženia na obrazovke](common:layout-edit); pre tmavé usporiadanie s panelom ponuky a pásom kariet pozrite [rozloženie Kreslenie](common:layout-drafting).
