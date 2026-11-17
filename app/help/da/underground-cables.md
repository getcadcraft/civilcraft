---
title: Underjordiske kabler
summary: Kabelruter i grøfter mellem understøtninger og udstyr, overdækning og krydsninger, muffer efter tromlelængde samt mængder for grøfter og kabler.
keywords: underjordisk kabel, kabelrute, grøft, kabelrør, overdækning, krydsning, rørkrydsning, muffe, tromle, skab, transformer, kilde, spændingsfald
from: adfd2717
---

## Tegn en kabelrute

1. Placér udstyret først, hvis kablet ender i et skab, en transformer eller en muffe: {{ui:Udstyr}}, og klik derefter.
2. Klik på {{ui:Kabel}}, og klik på ruten; start og slut på en understøtning eller på udstyr for at forbinde til den. Enter afslutter.

I Egenskaber vælger du **Kabel**, **Grøftetype**, hvor mange **kabler side om side** og **slæk** (%). Ruten viser sin længde, hvor den starter og slutter, og den strøm, den fører.

## Hvad kontrolleres

- **Overdækning**: kablets top under terrænet langs ruten, mod grøftetypens overdækning (eller regelsættets mindste overdækning).
- **Krydsninger**: hvor ruten krydser et CivilCraft-rør eller et andet kabel, afstanden mellem dem mod en afstandsregel: ruttens egen **Krydsningsafstand** (under Egenskaber), når du vælger en, ellers regelsættets regel **Underjordiske krydsninger** (eksempelsættene bruger *Underjordisk krydsning*, 0.3 m), ellers grøftetypens afstand til andre installationer. Hvis to kabler krydser hinanden, bruges den største af de to. En krydset luftledning angives til orientering, og kablet vises i den ledningens profil.
- **Muffer**: én for hver tromlelængde af kablet (med slæk), når kabelelementet angiver en tromlelængde.

## Udstyr

Udstyr har et biblioteksemne, en **belastning** (kW) med sin **effektfaktor**, og kan være **en kilde**: nettet forsynes derfra. En kildes spænding kommer fra dets biblioteksemne, ellers fra den ledning eller det kabel, den forsyner.

## Mængder

{{ui:Mere}} › {{ui:Mængder…}} tæller kablet (ruttens længde × (1 + slæk) × kabler side om side + stigningen i hver ende), grøften efter type, udgravnings-, sengelags- og tilbagefyldsmængder, kabelrør og muffer samt luftledningernes leder, understøtninger og udstyr.
