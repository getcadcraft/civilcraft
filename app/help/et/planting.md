---
title: Istutusplaanid ja loendid
summary: Üksikute taimede paigutamine, istutusalad, mis täidetakse taimede vahekauguse järgi segatud taimedega protsentides, ja hekid; nende sildistamine; loendamine taimeloendis tabelarvutuse või TakeoffCrafti jaoks.
keywords: istutusplaan, taimeloend, istutusala, massistutus, hekk, puu, põõsas, maakate, vahekaugus, kolmnurkne vahekaugus, taimede arv, kogused, sildid, võrastik, taimesümbolid, ifc, takeoff
from: ab49eab5
---

## Taimede paigutamine

1. Vali taim vasakul jaotises **Taimed**.
2. Klõpsa {{ui:Plant}}, seejärel plaanil: iga klõps paigutab ühe taime. Peatamiseks vajuta {{key:Esc}}.

Taime sümbol joonistatakse tema laiuses täiskasvanuna; Veel › {{ui:Show at planting size}} joonistab iga taime istutussuuruses. Puud asuvad maapinnal nende all: kui hiljem ala kujundad, järgivad need maapinda. Taime fikseerimiseks kindlale kõrgusmärgile sisesta atribuutides **Kõrgusmärk**.

## Istutusalad

1. Vali põhitaim, klõpsa {{ui:Bed}} ja klõpsa istutusala nurki. Vajuta {{key:Enter}} (või klõpsa esimest nurka uuesti), et see sulgeda.
2. Ala täitub selle taimega oma vahekaugusel, **kolmnurkses** mustris (tavaline: iga taim on võrdsel kaugusel kuuest teisest), pool vahekaugust servast sisse.
3. Atribuutides **Lisa taim** segab sisse vasakul valitud taime. Määra iga taime **Osa %**: ala võtab täpselt nii palju igast, laiali üle ala. **Sega uuesti** muudab nende asukohad.

**Vahekaugus** tühjana kasutab taimede enda vahekaugust (kaalutud osade järgi); sisesta üks, et seda kasutada kõigi taimede puhul. **Muster** võib olla ruudukujuline ja **Ridade suund** pöörab read.

## Hekid

Vali hekitaim, klõpsa {{ui:Hedge}}, klõpsa mööda heki ja vajuta {{key:Enter}}. Taimed paigutuvad joonele nende vahekaugusel, keskel nii, et mõlemas otsas on sama varu. Hekk võib olla **kaks rida, nihutatult**, määratud vahega.

## Sildid

Üksikud taimed on sildistatud sildiseadega (vaikimisi `{name}`); ühe taime sildi saab kirjutada atribuutides. Istutusalad on sildistatud iga taime arvuga, hekid oma arvuga. Veel › {{ui:Plant labels}} lülitab sildid sisse ja välja. Sildiväljad: `{name}`, `{botanical}`, `{size}` (konteiner), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Taimeloend

Veel › {{ui:Plant schedule…}} loendab iga taime liigi järgi, üksikutest taimedest, istutusaladelt ja hekkidelt kokku, koos istutussuurusega. Salvesta see **CSV**- või **XLSX**-vormingus või **Saada TakeoffCrafti**: kogusefail, mille TakeoffCraft avab taimede hinnastamiseks (kõrvuti kõvakatte ja niisutuse kogustega).

## IFC

Veel › {{ui:Export landscape IFC}} salvestab haljastuse IFC-failina (IFC 4.3), mida BIM-mudel saab hoida: iga taim on `IfcGeographicElement` tüübiga VEGETATION, tüübiks liik, koos taime omadustega (botaaniline nimi, suurused, külmakindlus, vesi, valgus); iga istutusala ja hekk on üks element oma arvudega asukohas. BimCraft avab selle hoone kõrvale.
