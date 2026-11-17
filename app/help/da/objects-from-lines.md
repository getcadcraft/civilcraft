---
title: Objekter fra stregtegning, bevaret koblet
summary: Lav belægning, et beplantet område, et bed, en hæk, en sti, en mur, en kantsten, trin, en rampe, et plateau, en grøft eller en feature-linje ud fra en linje; det følger med, når linjen flyttes, indtil du bryder koblingen.
keywords: fra en linje, stregtegning, DWG, DXF, kobling, koblet, følg, genberegn, bryd kobling, feature-linje, feature-linje fra stregtegning, importeret lag, kontur, tegnelinje, supercad studio
from: eb67a0c6
---

{{ui:Fra en linje}} (Landskab › {{ui:Mere}}): klik på en feature-linje, eller på en linje eller kontur i et importeret DWG/DXF-lag. En lukket linje kan give belægning, et græsareal, et beplantet bed, en eng, jorddække, et bed eller et plateau; en åben linje en sti, en mur, en kantsten, trin (dens første og sidste punkt), en rampe, en hæk eller en grøft. Begge slags kan lave en **feature-linje**, undtagen en feature-linje selv.

## En feature-linje fra en linje

En feature-linje lavet af en linje tager dens punkter, lukket hvis linjen var lukket. Dens koter lægges på det eksisterende terræn (0, hvor der endnu ikke er noget), og dens brug er **Fra**: den former ikke noget terræn, før du vælger en brug og angiver dens koter i dens Egenskaber. Når linjen flyttes, beholder en feature-linje med samme antal punkter hver kote, du har angivet; når linjen får eller mister punkter, lægges koterne på terrænet igen. Se [Feature-linjer](topic:feature-lines).

Det nye objekt beholder en **kobling** til sin linje. Når linjen flyttes (du trækker i dens punkter, eller tegningen flyttes eller læses igen), får objektet den nye form i samme fortrydelsestrin, og gennem terrænmodifikatorerne følger det projekterede terræn med. Egenskaber siger, hvad det er koblet til; {{ui:Bryd kobling}} gør det frit.

Linjer kontrolleres først: en linje skal have mindst 2 punkter (3 for en kontur), højst 5000, reelle tal, en kontur skal være lukket og må ikke krydse sig selv. En linje, der ikke består, bruges ikke: objektet bliver, som det var, og panelet Problemer forklarer hvorfor. Hvis linjen slettes, bliver objektet, og panelet Problemer noterer det.

## I SuperCad Studio

Åbn området og 2D-tegningen i samme projekt. Vælg én linje eller polylinje i 2D-tegningen, tryk på Ctrl+K, og kør {{ui:Landskabsobjekt fra den valgte tegnelinje}}: CivilCraft spørger, hvad der skal laves, som ovenfor, og objektet forbliver koblet til den linje i tegningen. Når du ændrer linjer i tegningen, får Ctrl+K {{ui:Opdatér landskabet fra tegningen}} objekterne til at følge med, med ét fortrydelsestrin for hver linje. Projektets koblingsfil noterer, hvilket objekt der følger hvilken linje. SuperCad Studios egen hjælp har et emne om Landskab.
