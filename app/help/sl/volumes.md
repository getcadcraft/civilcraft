---
title: Prostornine zemeljskih del
summary: Preberite izkop, nasip in neto prostornine med obstoječim terenom in predvidenim površjem, po ploščadih in koridorjih ter skupaj, in razumite mrežno metodo za njimi.
keywords: prostornine, zemeljska dela, izkop, nasip, neto, izkop in nasip, količine, mrežna metoda, primerjava površij, površje prostornin, kubični yardi, kubični metri
from: 299d7bc7
---

Takoj ko ploščad ali koridor izravnata brez težav, CivilCraft primerja predvideno površje z obstoječim terenom in poroča o izkopu in nasipu. Številke se posodobijo ob vsaki spremembi.

## Kje jih prebrati

- **Zemeljska dela** v desnem podoknu, kadar nič ni izbrano (pogled **Projekt**), ko je vsaj ena ploščad ali en koridor.
- **Zemeljska dela** v desnem podoknu, kadar je izbrana ploščad (enake skupne vrednosti za ves projekt).
- Vrstica pod nastavitvami koridorja, z lastnim izkopom in nasipom tega koridorja.

Blok **Zemeljska dela** prikazuje:

- **Izkop**, **Nasip** in **Neto** (z „nasip“ ali „izkop“ za njim, kar je večje)
- vrstico za vsako postavko, kadar je več kot ena, na primer „Ploščad 1: izkop 120.4 cu yd, nasip 310.2 cu yd“
- vrstico metode: „Mrežna metoda: obstoječi teren in izravnano površje, vzorčena na vsakih 0.5 ft znotraj črt presečišča z terenom (92,891 celic). Faktor nabrekanja ali krčenja ni uporabljen.“

Prostornine so v cu yd v projektu v čevljih in v cu m v projektu v metrih.

## Pošljite jih v TakeoffCraft

Za cenitev zemeljskih del izberite {{ui:Pošlji v TakeoffCraft}} na dnu bloka **Zemeljska dela**. CivilCraft shrani datoteko količin (`<site>.quantities.json`) z dvema količinama: izkop in nasip, v kubičnih yardih (projekt v čevljih) ali kubičnih metrih (projekt v metrih), enake številke kot v bloku, zaokrožene na stotinko. Odprite jo v TakeoffCraftu z **Odpri predizmere** ali jo tja spustite: postaneta dve postavki, ki ju lahko ocenite ([Izkop in nasip iz CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Po spremembi pošljite znova in odprite novo datoteko: iste postavke dobijo nove številke.

Pošljejo se samo skupne vrednosti, zato se nič ne šteje dvakrat; opomba v datoteki navaja izkop in nasip vsake ploščadi in koridorja.

## Kako se izračunajo

CivilCraft uporablja **mrežno metodo**:

1. Mreža kvadratnih celic se položi čez območje znotraj vsake črte presečišča z terenom.
2. V središču vsake celice se vzorčita obe površji.
3. Vsaka celica se šteje kot prizma: razlika v koti, pomnožena s površino celice. Kjer je predvideno površje nižje, je izkop; višje, je nasip.
4. Celice se seštejejo.

Velikost celice je izbrana samodejno tako, da pravokotnik okoli izravnanih območij drži približno 250,000 celic, zaokrožen na lepo vrednost (1, 2 ali 5-kratnik potence desetih). Te velikosti še ne morete nastaviti sami. Vrstica metode pove velikost in število celic. Manjše celice so natančnejše ob robovih; na celotnih celicah med ravnimi ravninami je rezultat natančen.

## Na kaj paziti

- Šteje se samo površina znotraj črt presečišča z terenom. Teren zunaj njih ostane nespremenjen.
- Ploščad ali koridor s težavo se ne izravna vanj in nič ne doda. Če blok pravi „Še ni prostornin: ploščad mora izravnati brez težav.“, poiščite rdeči okvir nad njim.
- Kjer se postavke prekrivajo, poznejša nadomesti prejšnjo znotraj njene črte presečišča z terenom, prekrivanje pa se šteje enkrat.
- Faktor nabrekanja ali krčenja ni uporabljen. Če potrebujete prostornine v rahlem, razrahljanem ali zbitem stanju, rezultate pomnožite sami.
- Odstranjevanje humusa, globine prevozne površine in podlage ter prizmatične prostornine TIN-do-TIN še niso na voljo.

## Preverjanje rezultata

- Vklopite {{ui:Predvideno (izravnano)}} pod **Prikaz** in poglejte plastnice znotraj črt presečišča z terenom.
- Premaknite kazalec nad izravnano območje: vrstica stanja prikaže **Teren** in **Izravnano**. Razlika je globina izkopa ali nasipa na tem mestu.
- Za koridor prikaz v pogledu profila pri vsaki postaji kaže izkop ali nasip na osrednji črti.
