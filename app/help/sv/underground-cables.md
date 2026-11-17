---
title: Underjordiska kablar
summary: Kabelsträckningar i schakt mellan stöd och utrustning, täckning och korsningar, skarvar efter trumlängd samt mängder för schakt och kabel.
keywords: underjordisk kabel, kabelsträcka, schakt, kabelrör, täckning, korsning, rörkorsning, skarv, kabeltrumma, skåp, transformator, matningskälla, spänningsfall
from: adfd2717
---

## Rita en kabelsträcka

1. Placera utrustningen först om kabeln slutar i ett skåp, en transformator eller en skarv: {{ui:Utrustning}}, klicka sedan.
2. Klicka på {{ui:Kabel}} och klicka på sträckan; börja och sluta på ett stöd eller på utrustning för att ansluta till den. Enter avslutar.

I **Egenskaper** väljer du **Kabel**, **Schakttyp**, hur många **kablar bredvid varandra** och **tillägget** (%). Sträckan visar sin längd, var den börjar och slutar och strömmen den bär.

## Vad som kontrolleras

- **Täckning**: kabelns överkant under marken längs sträckan, mot schakttypens täckning (eller regelsetets lägsta täckning).
- **Korsningar**: där sträckan korsar en CivilCraft-ledning eller en annan kabel, avståndet mellan dem mot ett avståndskrav: sträckans egna **Korsningsavstånd** (i dess egenskaper) när du väljer ett, annars regelsetets **Underjordiska korsningar** (exempelseten använder *Underjordisk korsning*, 0.3 m), annars schakttypens avstånd till andra ledningar. Två korsande kablar behåller det större av sina två. En korsad luftledning listas för information, och kabeln syns i den linjens profil.
- **Skarvar**: en per trumlängd av kabeln (med tillägg), när kabelobjektet anger en trumlängd.

## Utrustning

Utrustningen har ett biblioteksobjekt, en **last** (kW) med sin **effektfaktor**, och kan vara **en matningskälla**: nätet matas därifrån. En matningskällas spänning kommer från dess biblioteksobjekt, eller annars från ledningen eller kabeln den matar.

## Mängder

{{ui:Mer}} › {{ui:Mängder…}} räknar kabeln (sträcklängd × (1 + tillägg) × kablar bredvid varandra + stigningen vid varje ände), schakten per typ, urgrävning, bäddning och återfyllnadsvolymer, kabelrör och skarvar, samt luftledningarnas ledare, stöd och utrustning.
