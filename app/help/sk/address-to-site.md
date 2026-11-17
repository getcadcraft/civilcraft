---
title: Adresa na lokalitu
summary: Premeňte adresu na to, čo lokalita potrebuje vedieť: parcelu, okolité budovy, územné plánovanie, pôdu a záplavové územie z otvorených údajov, ktoré si vyžiadate tlačidlom alebo priložíte ako súbory, a odovzdajte ich BimCraftu ako návrhy.
keywords: adresa, geokódovanie, lokalita, parcela, budovy, územné plánovanie, pôda, záplava, otvorené údaje, openstreetmap, fema, ssurgo, usgs, kontext, ccsite, bimcraft
from: 125d848a
---

## Čo to robí

Povrch › Ďalšie › Adresa na lokalitu pre bod zistí: v ktorej parcele sa nachádza, okolité budovy, územné plánovanie, pôdu a záplavové územie. Údaje sú otvorené: súbory, ktoré pridáte (GeoJSON, shapefile, KML, GeoPackage), a pri zapnutých doplnkoch tlačidlá, ktoré sa pýtajú každú otvorenú službu.

## Ako to použiť

1. Zadajte adresu a stlačte tlačidlo vyhľadávania adries (doplnok "Vyhľadávanie adries"), alebo zadajte zemepisnú šírku a dĺžku.
2. Pridajte vrstvy: súbory tlačidlom "Pridať súbory", alebo ďalšími tlačidlami zdrojov (záplavové územie, budovy, pôda, výška terénu, katastrálne parcely). Služba sa zavolá, až keď stlačíte jej tlačidlo; pri spustení sa nič nesťahuje.
3. Stlačte tlačidlo spustenia pre odpoveď slovami a s CSV.
4. "Uložiť lokalitu ako súbor" alebo "Odoslať BimCraftu ako návrhy" odovzdá obrysy BimCraftu alebo ModelCraftu; tie ich vypíšu a pridajú len to, čo označíte.

## Čo treba vedieť

- Vyhľadávanie adries ide cez getcadcraft.com, ktorý za vás pýta OpenStreetMap Nominatim (najviac jedna požiadavka za sekundu, odpovede sa uchovávajú 90 dní, takže sa tá istá adresa nikdy nepýta dvakrát; uloží sa iba hash adresy, nikdy to, kto pýtal). Ostatné tlačidlá idú priamo z vášho prehliadača k ich službe.
- Každý zdroj má vlastnú licenciu (OpenStreetMap je ODbL: ponechajte riadok s uvedením autorov).
- Vrstvy sú tak dobré, ako sú otvorené údaje vo vašej oblasti. Dôležité veci overte voči geodetickému zameraniu.
