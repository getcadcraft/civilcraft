---
title: Izmeri rastojanja, površine i nagibe
summary: Meri na planu klikom na tačke: dužinu i azimut svake deonice, zbir, dužinu duž terena, nagib, a za zatvoren oblik površinu i obim — i rastojanje između dve tačke na podužnom profilu dalekovoda.
keywords: merenje, mera, rastojanje, dužina, površina, obim, azimut, nagib, pad, lenjir, merna traka, duž terena, profil, visinska razlika
from: d614eb25
---

{{ui:Površ}} › {{ui:Više}} › {{ui:Izmeri}} (takođe u meniju {{ui:Više}} radnog prostora Dalekovodi, ili pritisni {{key:M}}) meri bez dodavanja bilo čega u projekat.

## Na planu

1. Izaberi {{ui:Izmeri}}, pa klikni tačke. Klik blizu geodetske tačke uzima njeno mesto i kotu.
2. Statusna linija prikazuje broj tačaka i ukupnu dužinu, dužinu i azimut poslednje deonice, njen nagib ako je teren poznat na oba kraja, i dužinu duž terena. Pored pokazivača: deonica koja se crta i zbir.
3. Klikni ponovo na prvu tačku da zatvoriš oblik: statusna linija dodaje **površinu** i **obim**. Sledeći klik počinje novo merenje.
4. {{key:Enter}} završava merenje i zadržava njegove vrednosti u statusnoj liniji; {{key:Backspace}} poništava poslednju tačku; {{key:Esc}} briše merenje, a ponovni {{key:Esc}} vraća na {{ui:Izaberi}}.

Dužine su u jedinici projekta, a površine u odgovarajućoj kvadratnoj jedinici. Nagib i dužina duž terena koriste predloženu površ ako postoji, inače postojeći teren; van površi se izostavljaju.

## Na profilu dalekovoda

U [profilu linije](topic:overhead-line#the-line-profile), {{ui:Izmeri}} u traci profila zahteva dva klika i prikazuje horizontalno rastojanje, visinsku razliku, pravo rastojanje i nagib između njih. Klik blizu terena, provodnika ili vrha stuba se privlači ka njemu. Klikni {{ui:Izmeri}} ponovo da zaustaviš.
