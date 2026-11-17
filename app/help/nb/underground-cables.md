---
title: Underjordiske kabler
summary: Kabelruter i grøfter mellom støtter og utstyr, overdekning og kryssinger, skjøter etter tromlelengde, og mengder for grøft og kabel.
keywords: underjordisk kabel, kabelrute, grøft, kanal, overdekning, kryssing, rørkryssing, skjøt, tromle, skap, transformator, kilde, spenningsfall
from: adfd2717
---

## Tegn en kabelrute

1. Plasser utstyret først hvis kabelen ender i et skap, en transformator eller en skjøt: {{ui:Utstyr}}, og klikk deretter.
2. Klikk {{ui:Kabel}} og klikk ruten; start og slutt på en støtte eller på utstyr for å koble til den. {{key:Enter}} avslutter.

I Egenskaper velger du **Kabel**, **Grøfttype**, hvor mange **kabler side om side**, og **slakk** (%). Ruten viser lengden, hvor den starter og slutter, og strømmen den fører.

## Hva som kontrolleres

- **Overdekning**: kabelens topp under terrenget langs ruten, mot overdekningen for grøfttypen (eller regelsettets minste overdekning).
- **Kryssinger**: der ruten krysser et CivilCraft-rør eller en annen kabel, avstanden mellom dem mot en avstandsregel: ruteens egen **Kryssingsavstand** (i Egenskaper) når du velger en, ellers regelsettets regel **Underjordiske kryssinger** (eksempelsettene bruker *Underjordisk kryssing*, 0.3 m), ellers grøfttypens avstand til andre tjenester. To kabler som krysser hverandre, beholder den største av de to. En krysset luftledning listes for informasjon, og kabelen vises i profilen til den linjen.
- **Skjøter**: én for hver tromlelengde av kabelen (med slakk), når kabelelementet oppgir en tromlelengde.

## Utstyr

Utstyr har et bibliotekselement, en **last** (kW) med sin **effektfaktor**, og kan være **en kilde**: nettverket forsynes derfra. Spenningen til en kilde kommer fra bibliotekselementet, ellers fra linjen eller kabelen den forsyner.

## Mengder

{{ui:Mer}} › {{ui:Mengder…}} teller kabelen (ruttelengde × (1 + slakk) × kabler side om side + stigningen i hver ende), grøften etter type, utgraving, underlags- og tilbakefyllingsvolumer, kanaler og skjøter, med lederne, støttene og utstyret til luftledningene.
