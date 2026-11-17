---
title: Bou en verfyn die oppervlak
summary: Hoe CivilCraft die bestaande grond trianguleer, en hoe om dit te vorm met breeklyngroepe, getekende breeklyne, 'n buitegrens en die langste buitekant-rand.
keywords: tin, oppervlak, triangulasie, breeklyn, grens, bestaande grond, eg, skep oppervlak, delaunay, driehoeke, maksimum rand, buitegrens
from: b9eea3f3
---

CivilCraft het een bestaande grondoppervlak per projek. Dit is 'n TIN (getrianguleerde onreëlmatige netwerk) wat uit jou punte gebou is, en dit word outomaties herbou elke keer as 'n invoer verander. Daar is geen "herbou"-opdrag nie en geen verouderde oppervlak nie.

## Wat in die oppervlak gaan

- Elke punt met 'n hoogte in 'n groep wat op {{ui:Punte}} gestel is.
- Elke groep wat op {{ui:Breeklyn}} gestel is, verbind in puntnommervolgorde.
- Elke breeklyn wat jy met die {{ui:Breeklyn}}-gereedskap teken.
- Die buitegrens, as jy een teken.
- Die **Langste buitekant-rand**-instelling.

Driehoeke kruis nooit 'n breeklyn nie: die oppervlak word gedwing om dit te volg, en dan so eweredig as moontlik rondom gemaak (Delaunay elders).

## Maak gekodeerde lyne breeklyne

1. In die linkerpaneel onder **Punte**, vind die groep (byvoorbeeld FL).
2. Stel sy **Oppervlak**-keuse op {{ui:Breeklyn}}.
   Die oppervlak word herbou, die lyn word in oranje geteken (met {{ui:Breeklyne}} aan onder **Vertoning**), en **Breeklyne** in die oppervlakfeite gaan een hoër.
3. Kontroleer die lyn op die plan. Dit moet punt tot punt loop in die volgorde waarin die lyn gemeet is. As dit sigsag loop, bevat die groep meer as een lyn, of die punte is nie in volgorde genommer nie: stel die groep terug op {{ui:Punte}} en teken die lyne met die hand (volgende afdeling).

## Teken 'n breeklyn deur punte

1. Druk {{key:B}}, of klik {{ui:Breeklyn}} in die **Oppervlak**-groep.
   Die wenk sê "Breeklyn: klik opmetingspunte in volgorde (dit neem hulle hoogtes). Enter voltooi."
2. Beweeg die wyser naby 'n punt. 'n Klein oranje vierkant merk die punt wat dit sal neem.
3. Klik die punte van die lyn een na die ander. Elke klik noem die punt en sy hoogte in die statusbalk.
4. Druk {{key:Enter}} om te voltooi.
   Die statusbalk sê "Breeklyn 1 bygevoeg; die oppervlak is herbou."

Klikke moet op 'n opmetingspunt met 'n hoogte land; 'n klik elders word geweier met "Klik op 'n opmetingspunt met 'n hoogte: 'n breeklyn neem die punte se hoogtes." {{key:Backspace}} laat die laaste punt val; {{key:Esc}} kanselleer die hele lyn.

:::warning
Voltooi met {{key:Enter}}. Dubbelklik voltooi ook, maar in hierdie weergawe laat dit die punt val waarop jy dubbelgeklik het. Klik die laaste punt een keer, en druk dan {{key:Enter}}.
:::

Om elke getekende breeklyn in een keer te verwyder, klik {{ui:Verwyder getekende breeklyne}} in die **Oppervlak**-afdeling. Om net die laaste een te verwyder, gebruik {{key:Mod+Z}}. Getekende breeklyne kan nog nie een vir een gekies of gewysig word nie.

## Teken die buitegrens

'n Grens sny die oppervlak tot die gebied wat jy vertrou, byvoorbeeld die opmetingsgrense, sodat lang driehoeke oor onopgemete hoeke verdwyn.

1. Druk {{key:O}}, of klik {{ui:Grens}}.
2. Klik die hoeke in volgorde rondom die gebied. 'n Gestreepte lyn wys die vorm.
3. Druk {{key:Enter}}.
   Die statusbalk sê "Grens gestel; driehoeke buite dit is weg." **Grens** in die oppervlakfeite sê "Ja" en die getal hoeke.

Goed om te weet:

- Daar is een grens. Om 'n ander te teken, vervang dit. {{ui:Verwyder die grens}} neem dit weg.
- Dit kan net wegneem: 'n grens wat verby die punte reik, word teruggesny na hul omtrek, met die aantekening "Die grens reik verby die punte; dit is teruggesny na hul omtrek."
- Sy hoeke neem hul hoogtes van die oppervlak, so die rand volg die grond presies.
- Versteekte (binne-)grense is nog nie beskikbaar nie.

## Sny lang buitedriehoeke af

Sonder 'n grens vul die oppervlak die hele omtrek van die punte, insluitend lang dun driehoeke oor konkawe rande.

1. In **Oppervlak**, tik 'n lengte in **Langste buitekant-rand** en druk {{key:Enter}}. Begin met ongeveer twee of drie keer jou tipiese meetafstand.
2. Buitedriehoeke waarvan die buiterand langer as dit is, word verwyder, en dit werk so ver innetoe totdat elke buiterand kort genoeg is. 'n Rand wat 'n breeklyn is, word nooit afgeskil nie.
3. Tik 0 om elke driehoek weer te behou.

## Lees die oppervlakverslag

Onder die oppervlakfeite lys 'n kassie wat die bouer gedoen het. Met 'n okerkleurige balk aan die linkerkant is dit inligting; met 'n rooi balk bevat dit 'n fout en is daar geen oppervlak nie.

| Boodskap | Betekenis |
|---|---|
| "3 punte was op dieselfde plek as 'n ander en het daarby aangesluit." | Punte nader as 0.0001 in die plan het een hoekpunt geword (die eerste een is behou). |
| "2 plekke het twee verskillende hoogtes …" | Punte op mekaar, of breeklyne wat kruis, stem nie in hoogte ooreen nie. Die breeklyn se hoogte wen, dan die eerste een. |
| "1 breeklynstuk kon nie in die oppervlak afgedwing word nie." | 'n Baie kort of byna-oorvleuelende breeklynstuk het nie gepas nie; kontroleer daardie plek. |
| "'n Oppervlak benodig ten minste drie punte met hoogtes." | Te min punte: kontroleer die kolomvolgorde en die groepe. |
| "Die punte is almal op een lyn: geen driehoeke nie." | Die punte het geen breedte nie, byvoorbeeld 'n enkele traverslyn. |
| "Die grens oorvleuel nie die punte nie." | Die grens is elders, dikwels 'n eenhede- of koördinaatmenging. |
| "Geen driehoeke bly oor binne die grens nie." | Die grens is te klein of verkeerd geplaas. |

## 'n Oppervlak gelees uit LandXML

Wanneer jy LandXML oopmaak, word sy eerste TIN-oppervlak soos dit is gebruik: die **Oppervlak**-opskrif sê "Oppervlak (uit LandXML)" en **Langste buitekant-rand** is grys. Solank daardie oppervlak in gebruik is, verander breeklyngroepe, getekende breeklyne en 'n nuwe grens dit nie. Om die oppervlak uit die lêer se punte te bou, klik {{ui:Bou die oppervlak weer uit die punte}}. {{key:Mod+Z}} bring die LandXML-oppervlak terug.

## Verwant

- [Lees kontoere, hoogtes en hellings](topic:contours).
- [Voer opmetingspunte in](topic:import-points).
