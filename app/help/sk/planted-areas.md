---
title: Vysadené plochy: trávniky, záhony, lúky, pôdopokryvné rastliny
summary: Vysadené plochy ako objekty so skladbou vrstiev (ornica, mulč, membrána, obrubník), zmesou rastlín a voliteľnou upravenou úrovňou; samy sa orezávajú okolo dlažby, múrov a schodov a udávajú čistú plochu, objemy, dĺžku obrubníka a počty rastlín.
keywords: vysadená plocha, trávnik, trávnikový koberec, záhon, lem, lúka, pôdopokryvná rastlina, ornica, mulč, membrána, textília proti burinám, obrubník, upravená úroveň, množstvá, čistá plocha, orezanie
from: 2617ec0e
---

{{ui:Areas}} v skupine Krajina kreslí **trávnik**, **vysadený záhon**, **lúku** alebo **pôdopokryvnú** plochu: kliknite na jej rohy a stlačte {{key:Enter}}. Záhon alebo pôdopokryvná plocha sa na začiatku vyplní rastlinou vybranou v časti Rastliny; trávnik nemá rastliny.

## Čo obsahuje

- **Skladba vrstiev**: hrúbka ornice, hrúbka mulču, textília proti burinám a obrubník (oceľový, drevený, tehlový, betónový, plastový alebo žiadny). Typické hrúbky sú predvyplnené; nastavte si vlastné.
- **Zmes**: druhy (s kultivarom a veľkosťou) a podiely, vyplnené ako záhon podľa rozstupu alebo hustoty.
- **Upravená úroveň**: nechajte prázdne a plocha sleduje terén; zadajte úroveň a plocha sa stane úpravou terénu (pozri [Úpravy terénu a úrovne](topic:ground-modifiers)).
- **Orezanie okolo dlažby, múrov a schodov** (predvolene zapnuté): tam, kde dlažba, chodník, múr, obrubník, rampa alebo schody zasahujú do plochy, sa táto časť vynechá. Rastlina sa nevysadí pod nimi ani do vzdialenosti pol rozstupu od ich okraja.

## Množstvá

Vlastnosti zobrazujú **čistú plochu** (po orezaní, presne zmeranú), obvod, **dĺžku obrubníka** (len pozdĺž vlastného okraja plochy, nie tam, kde ju rozreže tvrdá plocha), objemy ornice a mulču, plochu membrány a počty rastlín podľa riadkov zmesi. Zoznam rastlín počíta rastliny plochy; súbor množstiev pre TakeoffCraft dostane plochu, ornicu, mulč, membránu a obrubník; krajinný IFC zapíše IfcGeographicElement s množinou veličín.
