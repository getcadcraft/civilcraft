---
title: Merať vzdialenosti, plochy a sklony
summary: Merajte na pôdoryse kliknutím na body — dĺžku a smer každej strany, priebežný súčet, dĺžku po teréne, sklon a plochu a obvod uzavretého tvaru — a medzi dvoma bodmi na pozdĺžnom profile elektrického vedenia.
keywords: merať, meranie, vzdialenosť, dĺžka, plocha, obvod, smer, sklon, spád, pravítko, pásmo, po teréne, profil, výškový rozdiel
from: d614eb25
---

{{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (aj v ponuke {{ui:More}} pracovného priestoru Elektrické vedenia, alebo stlačením klávesu {{key:M}}) meria bez pridania čohokoľvek do projektu.

## Na pôdoryse

1. Vyberte {{ui:Measure}} a potom kliknite na body. Kliknutie blízko bodu zamerania ho nahradí jeho polohou a výškou.
2. Stavový riadok zobrazuje počet bodov a celkovú dĺžku, dĺžku a smer poslednej strany, jej sklon, ak je terén známy pod oboma koncami, a dĺžku po teréne. Vedľa kurzora sa zobrazuje kreslená strana a priebežný súčet.
3. Kliknutím na prvý bod znova uzavrite tvar: stavový riadok doplní jeho **plochu** a **obvod**. Ďalšie kliknutie začne nové meranie.
4. {{key:Enter}} ukončí meranie a ponechá jeho hodnoty v stavovom riadku; {{key:Backspace}} vráti posledný bod späť; {{key:Esc}} meranie vymaže a ďalšie stlačenie {{key:Esc}} vás vráti do režimu {{ui:Select}}.

Dĺžky sú v jednotke projektu a plochy v jej štvorcovej jednotke. Sklon a dĺžku po teréne počítame z navrhovaného povrchu, ak existuje, inak z jestvujúceho terénu; mimo povrchu sa vynechajú.

## Na pozdĺžnom profile elektrického vedenia

V [pozdĺžnom profile vedenia](topic:overhead-line#the-line-profile) {{ui:Measure}} v lište profilu vyžaduje dve kliknutia a zobrazí vodorovnú vzdialenosť, výškový rozdiel, priamu vzdialenosť a sklon medzi nimi. Kliknutie blízko terénu, vodiča alebo vrcholu podpory sa k nemu prichytí. Na zastavenie znova kliknite na {{ui:Measure}}.
