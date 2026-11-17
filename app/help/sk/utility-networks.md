---
title: Inžinierske siete a údaje z otvorenej mapy
summary: Úseky vodovodu, kanalizácie, dažďovej kanalizácie, plynu, elektriny a telekomunikácií s materiálom, veľkosťou, krytím a vlastníkom; údaje z otvorenej mapy zo súboru Overpass JSON; križovania, výkopy a objemy; vrstvy služieb v DWG, DXF a PDF; segmenty potrubia a káblov v IFC.
keywords: inžinierske siete, siete, sieť, osm, openstreetmap, overpass, potrubie, kábel, plyn, kanalizácia, dažďová kanalizácia, telekomunikácie, elektrina, voda, hydrant, šachta, výkop, križovanie, odstup, krytie, hĺbka, dwg, ifc, georeferencovaný, vrstvy
from: 8a85dace
---

Nakreslite podzemné služby lokality ako jednu sieť pre každú službu, skontrolujte, kde sa križujú, a exportujte ich ako vrstvy výkresu a ako IFC.

## Vytvorenie úsekov

Otvorte **Povrch, Viac, Inžinierske siete...**

- **Vytvoriť úsek z výberu** z vybranej osi trasy, charakteristickej čiary alebo potrubia vytvorí úsek zvolenej služby. Potom v tabuľke vyplňte materiál, veľkosť (mm), krytie (hĺbku po vrch potrubia alebo kábla) a vlastníka.
- **Načítať údaje z OpenStreetMap** načíta uložený súbor Overpass JSON (dotaz s `out geom;`). Projekt najprv potrebuje súradnicový systém, pretože polohy v OpenStreetMap sú zemepisná šírka a dĺžka. Načítajú sa potrubia (podľa látky), podzemné silové a telekomunikačné káble, hydranty, šachty a dažďové kanály; všetko ostatné sa počíta ako vynechané a správa to uvedie. Nadzemné vedenia sa vynechávajú.
- **Pridať mapu OpenStreetMap** pridá mapu OpenStreetMap pod pôdorys. Kreslí sa len vtedy, keď sú v Nastaveniach zapnuté mapové vrstvy z internetu.

## Kontroly a výstupy

- **Križovania**: úseky rôznych služieb, ktoré sa v pôdoryse križujú, sú uvedené so svetlou výškou medzi nimi, ak je k dispozícii povrch terénu; minimum je zástupná hodnota, ktorú nastavíte vy, nie číslo z normy.
- **Výkop**: každý úsek dostane výkop (veľkosť potrubia plus odstup z každej strany, sklon svahu, lôžko) s objemom. Celkový objem sa zobrazí v okne a v CSV.
- **Výkres**: úseky a body sú na vrstvách služieb (napríklad U-WATR-RUN, U-POWR-RUN), takže sa dostanú do PDF, DXF a DWG.
- **IFC**: úseky sa do exportu IFC dostanú ako segmenty potrubia a segmenty káblov, spolu s hydrantmi, armatúrami a komorami, jeden systém pre každú službu, v súradnicovom systéme projektu.

## Údaje z otvorenej mapy

Údaje OpenStreetMap sú autorským dielom prispievateľov OpenStreetMap a sú licencované podľa ODbL. Uvedenie autorstva sa doplní do výkresu, CSV a IFC. Ak zdieľate súbor, ktorý obsahuje údaje OpenStreetMap, zachovajte uvedenie autorstva a prečítajte si podmienky licencie o zdieľaní pod rovnakými podmienkami.

## Čo ešte nie je hotové

Úseky sa zatiaľ na pôdoryse nekreslia nástrojom bod po bode a križovania sa zatiaľ nekreslia v pohľade na pozdĺžny profil (výpočet je hotový). Hĺbky, veľkosti a odstupy sú na začiatku zástupné hodnoty: použite čísla vašej vlastnej normy.
