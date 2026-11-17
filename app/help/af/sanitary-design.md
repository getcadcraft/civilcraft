---
title: Werk sanitêre ontwerpvloeie uit en kontroleer die riool
summary: Gee die mense en oppervlakte in wat by elke putgat van 'n sanitêre netwerk invloei; CivilCraft tel dit af deur die netwerk, werk die piekvloei uit met 'n piekfaktor en infiltrasie, en kontroleer elke pyp se kapasiteit en snelheid.
keywords: sanitêr, riool, sanitêre riool, afvalwater, ontwerpvloei, piekvloei, piekfaktor, harmon, babbitt, infiltrasie, bevolking, per capita, persentasie vol, selfreinigend, snelheid, pypdimensionering, ontwerpblad
from: 73ba197a
---

Sanitêre ontwerpvloeie werk op die [pypnetwerk](topic:pipe-network) wanneer sy {{ui:Tipe}} {{ui:Sanitêr}} is. Met niks gekies nie, wys die regterpaneel dan **Sanitêre ontwerpvloeie** waar 'n stormnetwerk stormdreinering wys.

## Gee in wat invloei

1. Kies 'n putgat. Tik onder **Sanitêre ontwerpvloeie** die {{ui:Mense wat hier invloei}} en die {{ui:Oppervlakte wat hier invloei}} (hektaar in 'n meterprojek, akker in 'n voetprojek).
2. Vir winkels, kantore of nywerhede, tik gelyke mense: die oppervlakte maal die mense per hektaar (of akker) wat jou agentskap gebruik. Die oppervlakte tel vir infiltrasie in albei gevalle.
3. Herhaal vir elke putgat waar 'n straat of 'n erf aansluit. 'n Putgat waar niks aansluit nie, hou albei op 0.

Elke pyp dra alles wat by sy boonste putgat invloei, en alles bo dit. Kies 'n putgat om te sien wat daardeur gaan.

## Die instellings

| Instelling | Wat dit beteken |
|---|---|
| {{ui:Vloei per persoon}} | die gemiddelde vloei van een persoon per dag: liter (meterprojek) of Amerikaanse galings (voetprojek) |
| {{ui:Infiltrasie}} | grondwater wat inlek: liter per sekonde per hektaar, of galings per dag per akker |
| {{ui:Piekfaktor}} | Harmon, 1 + 14 / (4 + √P), of Babbitt, 5 / P^0.2, met P die bevolking in duisendtalle |
| {{ui:Piekfaktor minstens}} / {{ui:Piekfaktor hoogstens}} | die faktor word tussen hierdie twee gehou |
| {{ui:Manning n}} | vir kapasiteit en snelheid |
| {{ui:Kleinste snelheid}} / {{ui:Grootste snelheid}} | by die piekvloei se eie diepte in die pyp |
| {{ui:Grootste deel van volle kapasiteit}} | hoe vol 'n pyp by die piek mag loop, as 'n persentasie van wat hy vol laat vloei |

Die beginwaardes is plekhouers, nie 'n standaard nie. Gebruik die waardes wat jou agentskap publiseer.

## Wat dit uitwerk

Vir elke pyp, in vloeivolgorde:

- piekvloei = mense × vloei per persoon × piekfaktor + oppervlakte × infiltrasie
- kapasiteit wanneer vol (Manning se vergelyking by die pyp se helling), en hoe vol die piek dit maak
- die normale diepte van die piekvloei en die snelheid daar

Die tabel **Sanitêre resultate** lys elke pyp se mense, piekfaktor, piekvloei (L/s, of gpm en kubieke voet per sekonde), persentasie vol en snelheid. Probleme word daaronder gelys: 'n pyp wat voller is as die perk, stadiger as die kleinste snelheid (hy maak dalk nie homself skoon nie), vinniger as die grootste, of met geen val nie. {{ui:Dimensioneer die pype vir hierdie vloeie}} kies vir elke pyp die kleinste standaardgrootte (200 mm of 8 duim en groter) wat sy piek binne die perk dra; een {{key:Mod+Z}} maak dit ongedaan.

:::note
Dit is die bestendige piekvloei wat 'n ontwerpblad uitwerk, nagegaan teen 'n gepubliseerde ontwerpblad tot by sy gedrukte afronding. Dit is nie 'n model van die riool oor tyd nie: geen hidrograwe, berging, pompe of oorlope nie. Sien [Nog nie gebou nie](topic:not-built-yet).
:::

Snelhede gebruik Manning se vergelyking met dieselfde n by elke diepte. Sommige agentskappe se gedeeltelik-vol-grafieke laat n met diepte verander, wat 'n effens laer snelheid gee in 'n pyp wat 60 tot 70 persent vol loop (ongeveer 3 persent minder).
