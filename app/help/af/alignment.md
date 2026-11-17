---
title: Lê 'n horisontale belyning uit
summary: Teken 'n belyning volgens sy PI's, stel boogradiusse en die beginstasie, skuif PI's, en lees die boogdata en stasie en afset.
keywords: belyning, geen oplossing, boog pas nie, grootste radius, kleinste radius, minimum radius, ontwerpspoed, oorvleueling, middellyn, pi, horisontale boog, radius, stasionering, raaklyn, skep belyning, belyninglayout, pc, pt, stasie afset
from: 8c5df4aa
---

'n Belyning in CivilCraft is 'n ketting van raaklyne deur snypunte (PI's), met 'n sirkelboog by enige binne-PI wat 'n radius het. Dit word gestasioneer vanaf 'n beginstasie wat jy kies. 'n Projek kan baie belynings hou.

## Teken die belyning

1. Druk {{key:A}}, of klik {{ui:Belyning}} in die **Ontwerp**-groep.
   Die wenk sê "Belyning: klik die PI's in volgorde. Enter of dubbelklik voltooi, Backspace verwyder die laaste, Esc kanselleer."
2. Klik die eerste PI (die begin van die belyning).
3. Klik elke volgende PI in volgorde. 'n Rooi lyn volg die wyser en wys die lengte en rigting van die raaklyn wat jy teken, byvoorbeeld "212.40 ft  N 63°12'05" E".
4. Klik die laaste PI (die einde van die belyning).
5. Druk {{key:Enter}}.
   Die belyning word geteken met stasionering en is gekies. Die statusbalk sê, byvoorbeeld, "Belyning 1: 386.36 ft, bogies met 100 ft radius waar hulle pas. Wysig radiusse in Eienskappe; Profiel (R) om die helling daarvan te ontwerp."

Terwyl jy teken: {{key:Backspace}} verwyder die laaste PI, {{key:Esc}} kanselleer, en sleep op leë ruimte beweeg die aansig sonder om 'n PI by te voeg.

:::warning
Voltooi met {{key:Enter}}. Dubbelklik voltooi ook, maar in hierdie weergawe laat dit die PI val waarop jy dubbelgeklik het. Klik die laaste PI een keer, en druk dan {{key:Enter}}.
:::

Elke binne-PI kry 'n boog van 100 ft (30 m in 'n meterprojek), of die grootste heelgetal-radius wat in die helfte van elke raaklyn pas as 100 ft nie pas nie. Baie skerp PI's of PI's wat reguit deurloop, kry geen boog nie.

## Stel radiusse en koördinate

Met die belyning gekies wys die regterpaneel **Belyning**:

1. **Naam** en **Beginstasie**. Tik 'n stasie as `10+00` (voet) of `0+500` (meter), of as 'n gewone getal. Sien [Eenhede, stasies en getalformate](topic:units-and-stations).
2. **Lengte** en **Eindstasie** word vir jou uitgewerk.
3. Die **PI's**-tabel lys elke PI se **Oos** en **Noord**, en 'n **Radius** vir elke binne-PI. Tik 'n nuwe waarde en druk {{key:Enter}}.
   - 'n Radius van 0 maak 'n hoekpunt sonder boog.
   - Die eerste en laaste PI het nooit 'n radius nie.
   - Die klein x aan die einde van 'n ry verwyder daardie PI ('n belyning hou ten minste twee).
4. Lees die **Bogies**-lys: vir elke boog sy PC- en PT-stasies, radius R, afwyking Δ en rigting (links of regs), lengte L, raaklyn T, eksterne E en koord.
5. Die lyn onder die bogies gee die rigting van die eerste raaklyn.

## Wanneer 'n boog nie pas nie

As bogies meer raaklyn benodig as wat daar tussen hul PI's is, het die belyning geen oplossing nie: dit word nie korrek geteken voordat jy dit regmaak nie, en dit word uit LandXML-uitvoere weggelaat. 'n Rooi kassie sê waarom, in getalle, en bied aan wat sal pas:

- "Die bogies by PI 2 en PI 3 benodig 240.00 ft raaklyn tussen hulle (130.00 + 110.00), maar die PI's is 180.00 ft uitmekaar." — of, wanneer net een van hulle 'n boog het, "Die boog by PI 2 benodig 240.00 ft raaklyn na PI 1 …".
- 'n Knoppie vir elke PI stel **die grootste radius wat pas** daar, met die ander boog soos dit is (dit moet ook by die PI se ander raaklyn pas). Waar albei PI's bogies het, krimp **Albei** die twee radiusse proporsioneel sodat hulle net raak.
- Wanneer een boog alleen langer is as die raaklyn, sê die kassie dat geen boog by die ander PI kan pas terwyl dit so groot is nie.
- 'n PI wat terugdraai na homself kan nie 'n boog kry nie; die kassie bied **Geen boog by PI n** aan.

Elke knoppie is een stap: {{key:Mod+Z}} herstel die radiusse. Aangebode radiusse word na beneden tot 0.01 afgerond sodat hulle altyd pas.

### 'n Ontwerp-minimumradius

Tik 'n **Ontwerp-minimumradius** (byvoorbeeld uit jou ontwerpspoed) om elke boog daarteen te laat nagaan; laat dit leeg vir geen. 'n Boog daaronder word gelys met 'n knoppie vir **die kleinste radius wat aan die minimum voldoen**, wanneer daardie radius pas. Wanneer dit nie pas nie, sê die kassie so en gee die grootste radius wat die raaklyne toelaat, sodat jy weet om 'n PI te skuif of die minimum te verlaag.

## Skuif PI's op die plan

1. Met {{ui:Kies}} aktief, klik die belyning om dit te kies. Vierkantige handvatsels verskyn by sy PI's.
2. Sleep 'n handvatsel. Die belyning, sy stasionering, profiel en korridor volg.
3. Laat los. Die skuif is een ontdoenstap.

Om 'n PI tussen twee bestaande PI's by te voeg is nog nie beskikbaar nie: verwyder die belyning en teken dit weer, of tik nuwe koördinate vir die PI's wat jy het.

## Lees stasie en afset

Beweeg die wyser oor die plan. Die statusbalk wys die naaste belyning (of die gekose een) met die stasie en die afset, **L** of **R** kyk op-stasie, byvoorbeeld "Belyning 1: Sta 2+15.30, afset 18.42 R". Verby enige kant voeg dit "(verby die einde)" by.

## Wat geteken word

Op die plan, in DXF en in PDF: die middellyn (raaklyne as lyne, bogies as ware boë), 'n merkstreep elke 50 ft (20 m) met 'n langer merkstreep en 'n stasie-etiket elke 100 eenhede, en PC- en PT-merkstrepe met hulle stasies as etikette.

## Verwyder 'n belyning

Kies dit en druk {{key:Delete}}, of klik {{ui:Skrap}} in die nutsbalk of onderaan die regterpaneel. Sy profiel en korridor gaan saam. {{key:Mod+Z}} bring dit terug.

:::mac
Op 'n Mac-sleutelbord is die sleutel met die etiket **delete** vir die blaaier {{key:Backspace}} en skrap nie 'n keuse nie. Druk {{key:Delete}} (Fn en delete), of gebruik die {{ui:Skrap}}-knoppie.
:::

## Volgende

- [Ontwerp 'n vertikale profiel](topic:profile).

## Ontwerpspoed en klas

Onder die belyning se Eienskappe word **Ontwerpspoed** (km/h of mph) en **Ontwerpklas** by die belyning gehou, in die projek gestoor en na IFC geskryf (Pset_RoadDesignCriteriaCommon). CivilCraft het geen tabel wat 'n spoed aan 'n minimumradius koppel nie, dus word niks uit hulle nagegaan nie: stel **Minimumradius** uit jou eie ontwerpstandaard.

## Spirale

'n Boog kan 'n klotoïde-spiraal aan albei kante hê: raaklyn, spiraal, boog, spiraal, raaklyn. In die PI-tabel tik 'n lengte by **Spiraal in** en **Spiraal uit** vir 'n PI wat 'n radius het. Die PI bly waar dit is; die boog beweeg in om ruimte te maak, sodat die raaklynafstand groei met die spiraal se afset. Die twee lengtes kan verskil, en 'n PI met net een lengte kry 'n spiraal aan daardie kant alleen.

Die bogelys lees dan TS, SC, CS en ST (raaklyn na spiraal, spiraal na boog, boog na spiraal, spiraal na raaklyn) met die spiraalhoek θs, die raaklynafstande en die eksterne afstand. Stasies loop langs die spirale soos oral. Spirale wat saam meer draai as die boog, word geweier met die PI genoem; 'n spiraal langer as die raaklyn toelaat, is 'n oorvleueling, soos vir enige boog. Superhoogte gebruik die spiraal as sy uitloop (sien [Korridor](topic:corridor)).
