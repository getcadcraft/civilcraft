---
title: Pazemes kabeļi
summary: Kabeļu trases grāvjos starp balstiem un iekārtām, pārklājums un krustojumi, savienojumi pēc spoles garuma, grāvja un kabeļu daudzumi.
keywords: pazemes kabelis, kabeļu trase, grāvis, kanāls, pārklājums, krustojums, cauruļu krustojums, savienojums, spole, skapis, transformators, avots, sprieguma kritums
from: adfd2717
---

## Zīmējiet kabeļu trasi

1. Vispirms novietojiet iekārtu, ja kabelis beidzas skapī, transformatorā vai savienojumā: {{ui:Aprīkojums}}, tad noklikšķiniet.
2. Noklikšķiniet uz {{ui:Kabelis}} un noklikšķiniet uz trases; sākumam un beigām jābūt uz balsta vai iekārtas, lai savienotu ar to. Enter pabeidz.

Sadaļā **Rekvizīti** izvēlieties **Kabelis**, **Grāvja tips**, cik **kabeļi blakus**, un **rezervi** (%). Trase rāda savu garumu, kur tā sākas un beidzas un strāvu, ko tā nes.

## Ko pārbauda

- **Pārklājums**: kabeļa augšdaļa zem zemes visā trasē, salīdzinot ar grāvja tipa pārklājumu (vai noteikumu kopas mazāko pārklājumu).
- **Krustojumi**: kur trase krusto CivilCraft cauruli vai citu kabeli, sprauga starp tiem tiek salīdzināta ar atstarpes noteikumu: trases pašas **Krustojuma atstarpe** (tās Rekvizītos), ja to izvēlaties, citādi noteikumu kopas noteikums **Pazemes krustojumi** (parauga kopās tiek izmantots *Pazemes krustojums*, 0.3 m), citādi grāvja tipa atstarpe līdz citiem pakalpojumiem. Divi krustojošies kabeļi saglabā lielāko no abām. Krustots gaisa vads tiek uzskaitīts informācijai, un kabelis parādās šīs līnijas profilā.
- **Savienojumi**: viens ik pēc kabeļa spoles garuma (ar rezervi), ja kabeļa vienumam ir norādīts spoles garums.

## Iekārtas

Iekārtai ir bibliotēkas vienums, **slodze** (kW) ar savu **jaudas koeficientu**, un tā var būt **avots**: tīkls tiek barots no tās. Avota spriegums nāk no tās bibliotēkas vienuma vai no līnijas vai kabeļa, ko tā baro.

## Daudzumi

{{ui:Vairāk}} › {{ui:Daudzumi…}} saskaita kabeli (trases garums × (1 + rezerve) × kabeļi blakus + pacēlums katrā galā), grāvi pēc tipa, izrakumu, pamatnes un aizbēršanas tilpumus, cauruļu un savienojumu skaitu, kā arī gaisa vadu vadītājus, balstus un iekārtas.
